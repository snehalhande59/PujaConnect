import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VerificationStatus, Prisma } from '@prisma/client';
import { QueryPanditsDto } from './dto/query-pandits.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get verification overview statistics for Admin dashboard
   */
  async getPanditStats() {
    const [total, pending, verified, rejected] = await Promise.all([
      this.prisma.panditProfile.count({
        where: { user: { isDeleted: false } },
      }),
      this.prisma.panditProfile.count({
        where: {
          verificationStatus: VerificationStatus.PENDING,
          user: { isDeleted: false },
        },
      }),
      this.prisma.panditProfile.count({
        where: {
          verificationStatus: VerificationStatus.VERIFIED,
          user: { isDeleted: false },
        },
      }),
      this.prisma.panditProfile.count({
        where: {
          verificationStatus: VerificationStatus.REJECTED,
          user: { isDeleted: false },
        },
      }),
    ]);

    return {
      total,
      pending,
      verified,
      rejected,
    };
  }

  /**
   * Get paginated and filtered list of Pandits for Admin management
   */
  async getPandits(query: QueryPanditsDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.PanditProfileWhereInput = {
      user: { isDeleted: false },
    };

    // Filter by verification status
    if (query.status && query.status.toUpperCase() !== 'ALL') {
      const statusUpper = query.status.toUpperCase();
      if (Object.values(VerificationStatus).includes(statusUpper as VerificationStatus)) {
        where.verificationStatus = statusUpper as VerificationStatus;
      }
    }

    // Filter by city
    if (query.city) {
      where.city = { contains: query.city.trim(), mode: 'insensitive' };
    }

    // Search query on name, email or phone number
    if (query.search) {
      const search = query.search.trim();
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { phoneNumber: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [total, pandits] = await Promise.all([
      this.prisma.panditProfile.count({ where }),
      this.prisma.panditProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phoneNumber: true,
              isActive: true,
              createdAt: true,
            },
          },
          documents: {
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: {
              bookings: true,
              reviewsReceived: true,
            },
          },
        },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: pandits,
    };
  }

  /**
   * Get pending Pandits (legacy support)
   */
  async getPendingPandits() {
    return this.prisma.panditProfile.findMany({
      where: {
        verificationStatus: VerificationStatus.PENDING,
        user: {
          isDeleted: false,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
            isActive: true,
            createdAt: true,
          },
        },
        documents: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * Get full details of a specific Pandit profile
   */
  async getPanditDetails(id: string) {
    const pandit = await this.prisma.panditProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
            isActive: true,
            createdAt: true,
          },
        },
        documents: {
          orderBy: { createdAt: 'desc' },
        },
        services: {
          include: {
            puja: {
              select: {
                id: true,
                title: true,
                category: { select: { name: true } },
              },
            },
          },
        },
        _count: {
          select: {
            bookings: true,
            reviewsReceived: true,
          },
        },
      },
    });

    if (!pandit) {
      throw new NotFoundException('Pandit profile not found.');
    }

    return pandit;
  }

  /**
   * Approve and verify a Pandit profile
   */
  async verifyPandit(id: string) {
    const pandit = await this.prisma.panditProfile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!pandit) {
      throw new NotFoundException('Pandit profile not found.');
    }

    if (pandit.verificationStatus === VerificationStatus.VERIFIED) {
      throw new BadRequestException('Pandit is already verified.');
    }

    // 1. Update Pandit profile status
    const updated = await this.prisma.panditProfile.update({
      where: { id },
      data: {
        verificationStatus: VerificationStatus.VERIFIED,
        rejectionReason: null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    });

    // 2. Mark all existing documents as verified
    await this.prisma.panditDocument.updateMany({
      where: { panditProfileId: id },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
      },
    });

    // 3. Create notification for the Pandit
    await this.prisma.notification.create({
      data: {
        userId: pandit.userId,
        title: 'Pandit Profile Verified',
        message:
          'Congratulations! Your Vedic Pandit profile has been verified by the DevSutra admin team. You can now receive and accept puja bookings from devotees.',
        type: 'PANDIT_VERIFICATION_APPROVED',
        link: '/pandit/dashboard',
      },
    });

    return updated;
  }

  /**
   * Reject a Pandit application with a mandatory reason
   */
  async rejectPandit(id: string, reason: string) {
    if (!reason || reason.trim().length === 0) {
      throw new BadRequestException('Rejection reason is mandatory.');
    }

    const pandit = await this.prisma.panditProfile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!pandit) {
      throw new NotFoundException('Pandit profile not found.');
    }

    // Update status to REJECTED and save reason
    const updated = await this.prisma.panditProfile.update({
      where: { id },
      data: {
        verificationStatus: VerificationStatus.REJECTED,
        rejectionReason: reason.trim(),
      },
    });

    // Create notification for the Pandit
    await this.prisma.notification.create({
      data: {
        userId: pandit.userId,
        title: 'Pandit Verification Action Required',
        message: `Your Pandit application requires attention: ${reason.trim()}. Please update your profile or documents and resubmit for review.`,
        type: 'PANDIT_VERIFICATION_REJECTED',
        link: '/pandit/verification',
      },
    });

    return updated;
  }

  /**
   * Get complete live platform analytics and counts for the Admin Dashboard Overview
   */
  async getDashboardStats() {
    const [
      totalCustomers,
      totalPandits,
      pendingPandits,
      approvedPandits,
      totalPujas,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      successfulPayments,
      pendingPayments,
      failedPayments,
      paymentsWithAmount,
    ] = await Promise.all([
      this.prisma.customerProfile.count({ where: { user: { isDeleted: false } } }),
      this.prisma.panditProfile.count({ where: { user: { isDeleted: false } } }),
      this.prisma.panditProfile.count({
        where: { verificationStatus: VerificationStatus.PENDING, user: { isDeleted: false } },
      }),
      this.prisma.panditProfile.count({
        where: { verificationStatus: VerificationStatus.VERIFIED, user: { isDeleted: false } },
      }),
      this.prisma.puja.count({ where: { isActive: true } }),
      this.prisma.booking.count(),
      this.prisma.booking.count({ where: { status: 'PENDING' } }),
      this.prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      this.prisma.booking.count({ where: { status: 'COMPLETED' } }),
      this.prisma.booking.count({ where: { status: 'CANCELLED' } }),
      this.prisma.payment.count({ where: { paymentStatus: 'SUCCESS' } }),
      this.prisma.payment.count({ where: { paymentStatus: 'PENDING' } }),
      this.prisma.payment.count({ where: { paymentStatus: 'FAILED' } }),
      this.prisma.payment.findMany({
        where: { paymentStatus: 'SUCCESS' },
        select: { amount: true },
      }),
    ]);

    const totalRevenue = paymentsWithAmount.reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0
    );

    return {
      customers: {
        total: totalCustomers,
      },
      pandits: {
        total: totalPandits,
        pending: pendingPandits,
        approved: approvedPandits,
      },
      pujas: {
        total: totalPujas,
      },
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        confirmed: confirmedBookings,
        completed: completedBookings,
        cancelled: cancelledBookings,
      },
      payments: {
        total: successfulPayments + pendingPayments + failedPayments,
        successful: successfulPayments,
        pending: pendingPayments,
        failed: failedPayments,
        totalRevenue,
      },
    };
  }

  /**
   * Get all registered customers with search and booking statistics
   */
  async getCustomers(query: { search?: string; page?: number; limit?: number }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerProfileWhereInput = {
      user: { isDeleted: false },
    };

    if (query.search) {
      const s = query.search.trim();
      where.OR = [
        { firstName: { contains: s, mode: 'insensitive' } },
        { lastName: { contains: s, mode: 'insensitive' } },
        { user: { email: { contains: s, mode: 'insensitive' } } },
        { user: { phoneNumber: { contains: s, mode: 'insensitive' } } },
      ];
    }

    const [total, customers] = await Promise.all([
      this.prisma.customerProfile.count({ where }),
      this.prisma.customerProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phoneNumber: true,
              isActive: true,
              createdAt: true,
            },
          },
          _count: {
            select: { bookings: true, orders: true },
          },
        },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      customers,
    };
  }

  /**
   * Get all bookings across the platform with filtering
   */
  async getBookings(query: {
    status?: string;
    search?: string;
    date?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.BookingWhereInput = {};

    if (query.status && query.status.toUpperCase() !== 'ALL') {
      where.status = query.status.toUpperCase() as any;
    }

    if (query.search) {
      const s = query.search.trim();
      where.OR = [
        { bookingNumber: { contains: s, mode: 'insensitive' } },
        { city: { contains: s, mode: 'insensitive' } },
        { customerProfile: { firstName: { contains: s, mode: 'insensitive' } } },
        { customerProfile: { lastName: { contains: s, mode: 'insensitive' } } },
        { panditProfile: { fullName: { contains: s, mode: 'insensitive' } } },
        { puja: { title: { contains: s, mode: 'insensitive' } } },
      ];
    }

    const [total, bookings] = await Promise.all([
      this.prisma.booking.count({ where }),
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customerProfile: {
            include: { user: { select: { email: true, phoneNumber: true } } },
          },
          panditProfile: {
            include: { user: { select: { email: true, phoneNumber: true } } },
          },
          puja: true,
          payments: { orderBy: { createdAt: 'desc' } },
        },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      bookings,
    };
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(id: string, status: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      throw new NotFoundException(`Booking '${id}' not found.`);
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status: status.toUpperCase() as any },
      include: {
        customerProfile: true,
        panditProfile: true,
        puja: true,
        payments: true,
      },
    });
  }

  /**
   * Reassign a Pandit to a booking
   */
  async assignPandit(bookingId: string, panditProfileId: string) {
    const [booking, pandit] = await Promise.all([
      this.prisma.booking.findUnique({ where: { id: bookingId } }),
      this.prisma.panditProfile.findUnique({ where: { id: panditProfileId } }),
    ]);

    if (!booking) throw new NotFoundException('Booking not found.');
    if (!pandit) throw new NotFoundException('Pandit profile not found.');

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { panditProfileId },
      include: {
        customerProfile: true,
        panditProfile: true,
        puja: true,
      },
    });
  }

  /**
   * Get all payments and transaction overview
   */
  async getPayments(query: { status?: string; page?: number; limit?: number }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentWhereInput = {};
    if (query.status && query.status.toUpperCase() !== 'ALL') {
      where.paymentStatus = query.status.toUpperCase() as any;
    }

    const [total, payments] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          booking: {
            include: {
              customerProfile: true,
              panditProfile: true,
              puja: true,
            },
          },
        },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      payments,
    };
  }

  /**
   * Get all Pujas with category relations
   */
  async getPujas(query?: { search?: string; page?: number; limit?: number }) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 50;
    const skip = (page - 1) * limit;

    const where: Prisma.PujaWhereInput = {};
    if (query?.search) {
      where.OR = [
        { title: { contains: query.search.trim(), mode: 'insensitive' } },
        { description: { contains: query.search.trim(), mode: 'insensitive' } },
      ];
    }

    const [total, pujas] = await Promise.all([
      this.prisma.puja.count({ where }),
      this.prisma.puja.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { category: true },
      }),
    ]);

    return { total, pujas };
  }

  /**
   * Create a new Puja
   */
  async createPuja(data: any) {
    let categoryId = data.categoryId;
    if (!categoryId) {
      const firstCat = await this.prisma.pujaCategory.findFirst();
      categoryId = firstCat ? firstCat.id : undefined;
    }

    const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    return this.prisma.puja.create({
      data: {
        title: data.title,
        slug,
        categoryId,
        description: data.description || '',
        basePrice: data.basePrice || 3501,
        samagriPrice: data.samagriPrice || 1100,
        durationMinutes: data.durationMinutes || 120,
        requiredPandits: data.requiredPandits || 1,
        languages: data.languages || ['Hindi', 'Sanskrit', 'Marathi'],
        requiredSamagri: data.requiredSamagri || [],
        imageUrl: data.imageUrl || '/images/pujas/satyanarayan.jpg',
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
  }

  /**
   * Update an existing Puja
   */
  async updatePuja(id: string, data: any) {
    return this.prisma.puja.update({
      where: { id },
      data,
    });
  }

  /**
   * Comprehensive Reports and Business Analytics
   */
  async getReports() {
    const [recentBookings, topPujas, payments] = await Promise.all([
      this.prisma.booking.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { puja: true, customerProfile: true, panditProfile: true },
      }),
      this.prisma.puja.findMany({
        take: 5,
        orderBy: { bookings: { _count: 'desc' } },
        include: { _count: { select: { bookings: true } } },
      }),
      this.prisma.payment.findMany({
        where: { paymentStatus: 'SUCCESS' },
        select: { amount: true, createdAt: true },
      }),
    ]);

    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

    return {
      totalRevenue,
      totalPaidTransactions: payments.length,
      topPujas: topPujas.map((p) => ({
        id: p.id,
        title: p.title,
        bookingsCount: p._count.bookings,
        basePrice: p.basePrice,
      })),
      recentBookings,
    };
  }
}
