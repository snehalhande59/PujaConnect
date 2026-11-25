import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { VerificationStatus, Role, BookingStatus, OrderStatus, TicketStatus, TicketPriority, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { QueryPanditsDto } from './dto/query-pandits.dto';
import { CreatePanditDto } from './dto/create-pandit.dto';
import { UpdatePanditDto } from './dto/update-pandit.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

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
              updatedAt: true,
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
   * Admin-Only: Add a new verified Pandit directly to PostgreSQL database
   */
  async createPandit(dto: CreatePanditDto) {
    const fullName = (dto.fullName || `${dto.firstName || ''} ${dto.lastName || ''}`).trim();
    if (!fullName) {
      throw new BadRequestException('Pandit full name is required.');
    }

    const email = dto.email.toLowerCase().trim();
    const phoneNumber = dto.phoneNumber.trim();

    // Check duplicate email
    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      throw new ConflictException('An account with this email address already exists.');
    }

    // Check duplicate phone
    const existingPhone = await this.prisma.user.findFirst({
      where: { phoneNumber },
    });
    if (existingPhone) {
      throw new ConflictException('An account with this mobile number already exists.');
    }

    // Generate secure password hash for account
    const passwordHash = await bcrypt.hash(`Pandit_${Date.now()}`, 10);

    // Create User & PanditProfile with VERIFIED status and isAvailable=true
    const pandit = await this.prisma.panditProfile.create({
      data: {
        fullName,
        avatarUrl: dto.avatarUrl || null,
        experienceYears: dto.experienceYears ?? 1,
        languages: dto.languages && dto.languages.length > 0 ? dto.languages : ['Hindi', 'Sanskrit'],
        specializations: dto.specializations && dto.specializations.length > 0 ? dto.specializations : ['Vedic Puja'],
        city: dto.city.trim(),
        state: dto.state.trim(),
        serviceAreas: dto.serviceAreas && dto.serviceAreas.length > 0 ? dto.serviceAreas : [dto.city.trim()],
        bio: dto.bio || null,
        basePrice: dto.basePrice !== undefined ? new Prisma.Decimal(dto.basePrice) : new Prisma.Decimal(2100),
        verificationStatus: VerificationStatus.VERIFIED,
        isAvailable: dto.isAvailable ?? true,
        user: {
          create: {
            email,
            phoneNumber,
            passwordHash,
            role: Role.PANDIT,
            isActive: true,
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
            isActive: true,
          },
        },
      },
    });

    // Connect Puja services if provided
    if (dto.pujaIds && dto.pujaIds.length > 0) {
      for (const pujaId of dto.pujaIds) {
        await this.prisma.panditService.upsert({
          where: {
            panditProfileId_pujaId: {
              panditProfileId: pandit.id,
              pujaId,
            },
          },
          create: {
            panditProfileId: pandit.id,
            pujaId,
            isActive: true,
          },
          update: {
            isActive: true,
          },
        }).catch(() => {});
      }
    }

    return pandit;
  }

  /**
   * Admin-Only: Edit Pandit details
   */
  async updatePandit(id: string, dto: UpdatePanditDto) {
    const pandit = await this.prisma.panditProfile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!pandit) {
      throw new NotFoundException('Pandit profile not found.');
    }

    // Update User email / phone / isActive if provided
    const userUpdates: any = {};
    if (dto.email && dto.email.toLowerCase().trim() !== pandit.user.email) {
      const email = dto.email.toLowerCase().trim();
      const existing = await this.prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== pandit.userId) {
        throw new ConflictException('Email already in use by another user.');
      }
      userUpdates.email = email;
    }
    if (dto.phoneNumber && dto.phoneNumber.trim() !== pandit.user.phoneNumber) {
      const phone = dto.phoneNumber.trim();
      const existing = await this.prisma.user.findFirst({ where: { phoneNumber: phone } });
      if (existing && existing.id !== pandit.userId) {
        throw new ConflictException('Mobile number already in use by another user.');
      }
      userUpdates.phoneNumber = phone;
    }
    if (dto.isActive !== undefined) {
      userUpdates.isActive = dto.isActive;
    }

    if (Object.keys(userUpdates).length > 0) {
      await this.prisma.user.update({
        where: { id: pandit.userId },
        data: userUpdates,
      });
    }

    // Update PanditProfile fields
    const profileUpdates: any = {};
    const fullName = dto.fullName || (dto.firstName || dto.lastName ? `${dto.firstName || ''} ${dto.lastName || ''}`.trim() : undefined);
    if (fullName) profileUpdates.fullName = fullName.trim();
    if (dto.avatarUrl !== undefined) profileUpdates.avatarUrl = dto.avatarUrl;
    if (dto.experienceYears !== undefined) profileUpdates.experienceYears = dto.experienceYears;
    if (dto.languages) profileUpdates.languages = dto.languages;
    if (dto.specializations) profileUpdates.specializations = dto.specializations;
    if (dto.city) profileUpdates.city = dto.city.trim();
    if (dto.state) profileUpdates.state = dto.state.trim();
    if (dto.serviceAreas) profileUpdates.serviceAreas = dto.serviceAreas;
    if (dto.bio !== undefined) profileUpdates.bio = dto.bio;
    if (dto.basePrice !== undefined) profileUpdates.basePrice = new Prisma.Decimal(dto.basePrice);
    if (dto.isAvailable !== undefined) profileUpdates.isAvailable = dto.isAvailable;

    const updated = await this.prisma.panditProfile.update({
      where: { id },
      data: profileUpdates,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
            isActive: true,
          },
        },
        services: {
          include: {
            puja: true,
          },
        },
      },
    });

    if (dto.pujaIds) {
      await this.prisma.panditService.deleteMany({ where: { panditProfileId: id } });
      for (const pujaId of dto.pujaIds) {
        await this.prisma.panditService.create({
          data: {
            panditProfileId: id,
            pujaId,
            isActive: true,
          },
        }).catch(() => {});
      }
    }

    return updated;
  }

  /**
   * Admin-Only: Deactivate or Delete a Pandit
   */
  async deletePandit(id: string) {
    const pandit = await this.prisma.panditProfile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!pandit) {
      throw new NotFoundException('Pandit profile not found.');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: pandit.userId },
        data: {
          isActive: false,
          isDeleted: true,
          deletedAt: new Date(),
        },
      }),
      this.prisma.panditProfile.update({
        where: { id },
        data: {
          isAvailable: false,
          verificationStatus: VerificationStatus.SUSPENDED,
        },
      }),
    ]);

    return { success: true, message: 'Pandit has been successfully deactivated.' };
  }

  /**
   * Admin-Only: View full booking history for a specific Pandit
   */
  async getPanditBookings(id: string) {
    const pandit = await this.prisma.panditProfile.findUnique({
      where: { id },
    });

    if (!pandit) {
      throw new NotFoundException('Pandit profile not found.');
    }

    return this.prisma.booking.findMany({
      where: { panditProfileId: id },
      include: {
        customerProfile: {
          include: {
            user: { select: { email: true, phoneNumber: true } },
          },
        },
        puja: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
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
      rejectedPandits,
      totalPujas,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      successfulPayments,
      pendingPayments,
      failedPayments,
      refundedPayments,
      paymentsWithAmount,
      recentBookings,
      recentCustomersRaw,
      recentPandits,
      recentPayments,
      recentStatusHistory,
      totalReviews,
      totalCoupons,
      recentReviews,
    ] = await Promise.all([
      this.prisma.customerProfile.count({ where: { user: { isDeleted: false } } }),
      this.prisma.panditProfile.count({ where: { user: { isDeleted: false } } }),
      this.prisma.panditProfile.count({
        where: { verificationStatus: VerificationStatus.PENDING, user: { isDeleted: false } },
      }),
      this.prisma.panditProfile.count({
        where: { verificationStatus: VerificationStatus.VERIFIED, user: { isDeleted: false } },
      }),
      this.prisma.panditProfile.count({
        where: { verificationStatus: VerificationStatus.REJECTED, user: { isDeleted: false } },
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
      this.prisma.payment.count({ where: { paymentStatus: 'REFUNDED' } }),
      this.prisma.payment.findMany({
        where: { paymentStatus: 'SUCCESS' },
        select: { paymentNumber: true, amount: true, razorpayPaymentId: true, razorpaySignature: true, paymentMethod: true },
      }),
      this.prisma.booking.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          customerProfile: {
            include: { user: { select: { email: true, phoneNumber: true } } },
          },
          panditProfile: {
            include: { user: { select: { email: true, phoneNumber: true } } },
          },
          puja: true,
          payments: true,
        },
      }),
      this.prisma.customerProfile.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { email: true, phoneNumber: true, createdAt: true, isActive: true } },
          _count: { select: { bookings: true } },
        },
      }),
      this.prisma.panditProfile.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { email: true, phoneNumber: true, createdAt: true, isActive: true } },
        },
      }),
      this.prisma.payment.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          booking: {
            include: {
              customerProfile: {
                include: { user: { select: { email: true, phoneNumber: true } } },
              },
              puja: true,
            },
          },
          order: {
            include: {
              customerProfile: {
                include: { user: { select: { email: true, phoneNumber: true } } },
              },
            },
          },
        },
      }),
      this.prisma.bookingStatusHistory.findMany({
        take: 10,
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
      }).catch(() => []),
      this.prisma.review.count(),
      this.prisma.coupon.count(),
      this.prisma.review.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: {
              email: true,
              customerProfile: { select: { firstName: true, lastName: true } },
            },
          },
          panditProfile: { select: { fullName: true } },
          booking: { select: { puja: { select: { title: true } } } },
        },
      }),
    ]);

    // If database has 0 pujas, automatically seed default catalog and sample bookings
    if (totalPujas === 0) {
      await this.ensureDefaultCatalogAndBookings();
      return this.getDashboardStats();
    }

    // Enrich recentCustomers with verifiable login records from OtpVerification
    const identifiers = recentCustomersRaw
      .flatMap((c) => [c.user?.email, c.user?.phoneNumber])
      .filter((v): v is string => Boolean(v));

    const verifiedLogins =
      identifiers.length > 0
        ? await this.prisma.otpVerification.findMany({
            where: {
              phoneNumber: { in: identifiers },
              isVerified: true,
            },
            orderBy: { createdAt: 'desc' },
          })
        : [];

    const loginMap = new Map<string, { lastLoginAt: Date; method: string }>();
    for (const log of verifiedLogins) {
      if (!loginMap.has(log.phoneNumber)) {
        loginMap.set(log.phoneNumber, {
          lastLoginAt: log.createdAt,
          method: log.purpose === 'LOGIN_PASSWORD' ? 'PASSWORD' : 'EMAIL_OTP',
        });
      }
    }

    const recentCustomers = recentCustomersRaw.map((c) => {
      const login =
        (c.user?.email && loginMap.get(c.user.email)) ||
        (c.user?.phoneNumber && loginMap.get(c.user.phoneNumber)) ||
        null;

      return {
        ...c,
        lastLoginAt: login ? login.lastLoginAt : null,
        lastLoginMethod: login ? login.method : null,
      };
    });

    // Strictly exclude unverified dummy test transaction reference (PAY_TEST_123456)
    const verifiedPayments = paymentsWithAmount.filter((p) => {
      const isTest = Boolean(
        p.paymentNumber === 'PAY_TEST_123456' ||
        p.razorpayPaymentId?.toUpperCase().includes('PAY_TEST_123456')
      );
      return !isTest;
    });

    const totalRevenue = verifiedPayments.reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0
    );

    const activePandits = approvedPandits;
    const inactivePandits = Math.max(0, totalPandits - approvedPandits);

    return {
      customers: {
        total: totalCustomers,
      },
      pandits: {
        total: totalPandits,
        active: activePandits,
        inactive: inactivePandits,
        pending: pendingPandits,
        approved: approvedPandits,
        rejected: rejectedPandits,
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
        total: successfulPayments + pendingPayments + failedPayments + refundedPayments,
        successful: successfulPayments,
        pending: pendingPayments,
        failed: failedPayments,
        refunded: refundedPayments,
        totalRevenue,
      },
      reviews: {
        total: totalReviews,
      },
      coupons: {
        total: totalCoupons,
      },
      recentBookings,
      recentCustomers,
      recentPandits,
      recentPayments,
      recentReviews,
      recentActivity: (() => {
        const activityItems: any[] = [];

        for (const c of recentCustomers) {
          activityItems.push({
            id: `cust-${c.id}`,
            type: 'CUSTOMER_REGISTERED',
            title: `New Customer: ${c.firstName} ${c.lastName}`,
            description: `${c.user?.email || 'N/A'}${c.user?.phoneNumber ? ' • ' + c.user.phoneNumber : ''}`,
            timestamp: c.user?.createdAt || c.createdAt,
            metadata: { customerId: c.id, city: c.city },
          });
        }

        for (const p of recentPandits) {
          activityItems.push({
            id: `pandit-${p.id}`,
            type: 'PANDIT_REGISTERED',
            title: `Pandit Application: Pt. ${p.fullName}`,
            description: `City: ${p.city} • Status: ${p.verificationStatus}`,
            timestamp: p.user?.createdAt || p.createdAt,
            metadata: { panditId: p.id, status: p.verificationStatus },
          });
        }

        for (const b of recentBookings) {
          const custName = b.customerProfile ? `${b.customerProfile.firstName} ${b.customerProfile.lastName}` : 'Devotee';
          const panditName = b.panditProfile ? `Pt. ${b.panditProfile.fullName}` : 'Unassigned';
          activityItems.push({
            id: `booking-${b.id}`,
            type: 'BOOKING_RECORD',
            title: `Booking #${b.bookingNumber}: ${b.puja?.title || 'Puja'}`,
            description: `Devotee: ${custName} • Purohit: ${panditName} • ₹${Number(b.totalAmount || 0).toLocaleString()}`,
            timestamp: b.createdAt,
            metadata: { bookingId: b.id, status: b.status, amount: b.totalAmount },
          });
        }

        for (const pay of recentPayments) {
          activityItems.push({
            id: `pay-${pay.id}`,
            type: 'PAYMENT_RECORD',
            title: `Payment ${pay.paymentStatus}: ₹${Number(pay.amount || 0).toLocaleString()}`,
            description: `Txn: ${pay.paymentNumber} • Mode: ${pay.paymentMethod}`,
            timestamp: pay.createdAt,
            metadata: { paymentId: pay.id, status: pay.paymentStatus, amount: pay.amount },
          });
        }

        for (const h of recentStatusHistory) {
          activityItems.push({
            id: `hist-${h.id}`,
            type: 'STATUS_ACTION',
            title: `Booking #${h.booking?.bookingNumber || ''} ${h.fromStatus ? h.fromStatus + ' ➔ ' : ''}${h.toStatus}`,
            description: `Action: ${h.action} by ${h.changedBy}${h.reason ? ' • Reason: ' + h.reason : ''}`,
            timestamp: h.createdAt,
            metadata: { bookingId: h.bookingId, toStatus: h.toStatus },
          });
        }

        activityItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return activityItems.slice(0, 25);
      })(),
    };
  }

  /**
   * Get all registered customers with search, booking statistics, and verifiable login records
   */
  async getCustomers(query: { search?: string; page?: number; limit?: number }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 20);
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
              updatedAt: true,
            },
          },
          _count: {
            select: { bookings: true, orders: true },
          },
        },
      }),
    ]);

    // Check verifiable historical logins in OtpVerification
    const identifiers = customers
      .flatMap((c) => [c.user?.email, c.user?.phoneNumber])
      .filter((v): v is string => Boolean(v));

    const verifiedLogins =
      identifiers.length > 0
        ? await this.prisma.otpVerification.findMany({
            where: {
              phoneNumber: { in: identifiers },
              isVerified: true,
            },
            orderBy: { createdAt: 'desc' },
          })
        : [];

    const loginMap = new Map<string, { lastLoginAt: Date; method: string }>();
    for (const log of verifiedLogins) {
      if (!loginMap.has(log.phoneNumber)) {
        loginMap.set(log.phoneNumber, {
          lastLoginAt: log.createdAt,
          method: log.purpose === 'LOGIN_PASSWORD' ? 'PASSWORD' : 'EMAIL_OTP',
        });
      }
    }

    const customersWithLogin = customers.map((c) => {
      const login =
        (c.user?.email && loginMap.get(c.user.email)) ||
        (c.user?.phoneNumber && loginMap.get(c.user.phoneNumber)) ||
        null;

      return {
        ...c,
        lastLoginAt: login ? login.lastLoginAt : null,
        lastLoginMethod: login ? login.method : null,
      };
    });

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      customers: customersWithLogin,
    };
  }

  /**
   * Get single customer with bookings, addresses, orders, and verified login history
   */
  async getCustomerDetails(id: string) {
    const customer = await this.prisma.customerProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        addresses: true,
        bookings: {
          orderBy: { createdAt: 'desc' },
          include: {
            puja: true,
            panditProfile: true,
            payments: true,
          },
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          include: {
            orderItems: { include: { product: true } },
            payments: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer '${id}' not found.`);
    }

    const identifiers = [customer.user?.email, customer.user?.phoneNumber].filter(
      (v): v is string => Boolean(v),
    );

    const loginHistory =
      identifiers.length > 0
        ? await this.prisma.otpVerification.findMany({
            where: {
              phoneNumber: { in: identifiers },
              isVerified: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
            select: {
              id: true,
              phoneNumber: true,
              purpose: true,
              createdAt: true,
            },
          })
        : [];

    return {
      ...customer,
      loginHistory: loginHistory.map((l) => ({
        id: l.id,
        timestamp: l.createdAt,
        method: l.purpose === 'LOGIN_PASSWORD' ? 'PASSWORD' : 'EMAIL_OTP',
        channel: l.phoneNumber,
      })),
      lastLoginAt: loginHistory[0]?.createdAt || null,
      lastLoginMethod: loginHistory[0]
        ? loginHistory[0].purpose === 'LOGIN_PASSWORD'
          ? 'PASSWORD'
          : 'EMAIL_OTP'
        : null,
    };
  }

  /**
   * Update customer profile and active status
   */
  async updateCustomer(id: string, data: any) {
    const customer = await this.prisma.customerProfile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!customer) {
      throw new NotFoundException(`Customer '${id}' not found.`);
    }

    const updated = await this.prisma.customerProfile.update({
      where: { id },
      data: {
        firstName: data.firstName !== undefined ? data.firstName.trim() : customer.firstName,
        lastName: data.lastName !== undefined ? data.lastName.trim() : customer.lastName,
        city: data.city !== undefined ? data.city : customer.city,
        state: data.state !== undefined ? data.state : customer.state,
        pincode: data.pincode !== undefined ? data.pincode : customer.pincode,
        user: {
          update: {
            isActive: data.isActive !== undefined ? Boolean(data.isActive) : customer.user.isActive,
            phoneNumber: data.phoneNumber !== undefined ? data.phoneNumber.trim() : customer.user.phoneNumber,
          },
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
            updatedAt: true,
          },
        },
      },
    });

    return updated;
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
   * Update booking status with audit trail in BookingStatusHistory
   */
  async updateBookingStatus(id: string, status: string | BookingStatus, reason?: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      throw new NotFoundException(`Booking '${id}' not found.`);
    }

    const targetStatus = (typeof status === 'string' ? status.toUpperCase() : status) as BookingStatus;
    const isCancelled = targetStatus === BookingStatus.CANCELLED || targetStatus === BookingStatus.REJECTED;

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        status: targetStatus,
        cancellationReason: isCancelled ? (reason || 'Cancelled by Admin') : booking.cancellationReason,
      },
      include: {
        customerProfile: {
          include: { user: true },
        },
        panditProfile: true,
        puja: true,
        payments: true,
      },
    });

    // Safely record status audit history without failing the operation if the table is not migrated
    try {
      await this.prisma.bookingStatusHistory.create({
        data: {
          bookingId: id,
          fromStatus: booking.status,
          toStatus: targetStatus,
          action: isCancelled ? 'CANCEL' : 'STATUS_UPDATE',
          changedBy: 'ADMIN',
          reason: reason || null,
        },
      });
    } catch (e: any) {
      this.logger.warn(`Notice: BookingStatusHistory table not available or error recording audit: ${e?.message || e}`);
    }

    // Send real email notification to the Customer via Gmail SMTP
    try {
      const customerEmail = updatedBooking.customerProfile?.user?.email;
      if (customerEmail) {
        const customerName = `${updatedBooking.customerProfile?.firstName || 'Devotee'} ${updatedBooking.customerProfile?.lastName || ''}`.trim();
        const panditName = updatedBooking.panditProfile?.fullName || 'Assigned Vedic Pandit';
        const pujaName = updatedBooking.puja?.title || 'Vedic Puja';
        const bookingNumber = updatedBooking.bookingNumber;
        const formattedDate = updatedBooking.pujaDate
          ? new Date(updatedBooking.pujaDate).toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : undefined;

        await this.mailService.sendBookingStatusEmail(customerEmail, {
          customerName,
          bookingNumber,
          pujaName,
          status: targetStatus,
          date: formattedDate,
          panditName,
          reason,
        });
      }
    } catch (mailErr: any) {
      console.warn(`Could not dispatch status email for booking ${id}:`, mailErr?.message);
    }

    return updatedBooking;
  }

  /**
   * Reassign a Pandit to a booking with slot conflict validation and audit trail
   */
  async reassignPandit(bookingId: string, newPanditProfileId: string, reason?: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { panditProfile: true },
    });
    if (!booking) {
      throw new NotFoundException(`Booking '${bookingId}' not found.`);
    }

    if (booking.panditProfileId === newPanditProfileId) {
      throw new BadRequestException('The selected Pandit is already assigned to this booking.');
    }

    const newPandit = await this.prisma.panditProfile.findUnique({
      where: { id: newPanditProfileId },
      include: { user: true },
    });

    if (!newPandit || !newPandit.user.isActive || newPandit.user.isDeleted) {
      throw new NotFoundException('The selected Pandit does not exist or is currently inactive.');
    }

    if (newPandit.verificationStatus !== VerificationStatus.VERIFIED) {
      throw new BadRequestException('Cannot assign Pandit: selected scholar is not verified.');
    }

    // Check if newPandit already has a conflicting booking on this date and time slot
    const conflictingBooking = await this.prisma.booking.findFirst({
      where: {
        id: { not: booking.id },
        panditProfileId: newPandit.id,
        pujaDate: booking.pujaDate,
        pujaTimeSlot: booking.pujaTimeSlot,
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.ACCEPTED, BookingStatus.PENDING] },
      },
    });

    if (conflictingBooking) {
      throw new BadRequestException(
        `Pt. ${newPandit.fullName} is already booked for ${booking.pujaTimeSlot} on ${booking.pujaDate.toISOString().split('T')[0]}. Please select another Pandit.`,
      );
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { panditProfileId: newPandit.id },
      include: {
        customerProfile: true,
        panditProfile: true,
        puja: true,
      },
    });

    try {
      await this.prisma.bookingStatusHistory.create({
        data: {
          bookingId,
          fromStatus: booking.status,
          toStatus: booking.status,
          action: 'REASSIGN_PANDIT',
          changedBy: 'ADMIN',
          reason: reason || 'Pandit reassigned by Admin',
          metadata: {
            previousPanditId: booking.panditProfileId,
            previousPanditName: booking.panditProfile?.fullName || 'Previous Purohit',
            newPanditId: newPandit.id,
            newPanditName: newPandit.fullName,
          },
        },
      });
    } catch (e: any) {
      this.logger.warn(`Notice: BookingStatusHistory table not available or error recording reassignment: ${e?.message || e}`);
    }

    return updatedBooking;
  }

  /**
   * Get complete audit history for a booking
   */
  async getBookingAuditHistory(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true, bookingNumber: true },
    });
    if (!booking) {
      throw new NotFoundException(`Booking '${bookingId}' not found.`);
    }

    try {
      return await this.prisma.bookingStatusHistory.findMany({
        where: { bookingId },
        orderBy: { createdAt: 'desc' },
      });
    } catch {
      return [];
    }
  }

  /**
   * Get all payments and transaction overview with server-side pagination, search, and full financial summary
   */
  async getPayments(query: {
    status?: string;
    method?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const isAll = Number(query.limit) === -1 || Number(query.limit) === 0;
    const limit = isAll ? 1000 : Math.max(1, Number(query.limit) || 20);
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentWhereInput = {};

    if (query.status && query.status.toUpperCase() !== 'ALL') {
      where.paymentStatus = query.status.toUpperCase() as any;
    }

    if (query.method && query.method.toUpperCase() !== 'ALL') {
      where.paymentMethod = query.method.toUpperCase() as any;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    if (query.search) {
      const s = query.search.trim();
      where.OR = [
        { paymentNumber: { contains: s, mode: 'insensitive' } },
        { razorpayPaymentId: { contains: s, mode: 'insensitive' } },
        { razorpayOrderId: { contains: s, mode: 'insensitive' } },
        { booking: { bookingNumber: { contains: s, mode: 'insensitive' } } },
        { booking: { customerProfile: { firstName: { contains: s, mode: 'insensitive' } } } },
        { booking: { customerProfile: { lastName: { contains: s, mode: 'insensitive' } } } },
        { booking: { customerProfile: { user: { email: { contains: s, mode: 'insensitive' } } } } },
        { booking: { customerProfile: { user: { phoneNumber: { contains: s, mode: 'insensitive' } } } } },
        { order: { orderNumber: { contains: s, mode: 'insensitive' } } },
        { order: { customerProfile: { firstName: { contains: s, mode: 'insensitive' } } } },
        { order: { customerProfile: { lastName: { contains: s, mode: 'insensitive' } } } },
        { order: { customerProfile: { user: { email: { contains: s, mode: 'insensitive' } } } } },
        { order: { customerProfile: { user: { phoneNumber: { contains: s, mode: 'insensitive' } } } } },
      ];
    }

    const [total, payments, allPaymentsSummary] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          booking: {
            include: {
              customerProfile: {
                include: {
                  user: {
                    select: {
                      id: true,
                      email: true,
                      phoneNumber: true,
                    },
                  },
                },
              },
              panditProfile: {
                select: {
                  id: true,
                  fullName: true,
                },
              },
              puja: {
                select: {
                  id: true,
                  title: true,
                  imageUrl: true,
                },
              },
            },
          },
          order: {
            include: {
              customerProfile: {
                include: {
                  user: {
                    select: {
                      id: true,
                      email: true,
                      phoneNumber: true,
                    },
                  },
                },
              },
              orderItems: {
                include: {
                  product: {
                    select: {
                      id: true,
                      name: true,
                      images: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      // Authoritative financial totals across the entire database
      this.prisma.payment.groupBy({
        by: ['paymentStatus', 'paymentMethod'],
        _count: { id: true },
        _sum: { amount: true },
      }),
    ]);

    let totalPaidRevenue = 0;
    let totalPendingAmount = 0;
    let totalRefundedAmount = 0;
    let totalFailedAmount = 0;
    let successCount = 0;
    let pendingCount = 0;
    let failedCount = 0;
    let refundedCount = 0;
    let razorpayCount = 0;
    let cashCount = 0;

    for (const group of allPaymentsSummary) {
      const count = group._count.id;
      const sum = Number(group._sum.amount || 0);

      if (group.paymentStatus === 'SUCCESS') {
        totalPaidRevenue += sum;
        successCount += count;
      } else if (group.paymentStatus === 'PENDING') {
        totalPendingAmount += sum;
        pendingCount += count;
      } else if (group.paymentStatus === 'REFUNDED') {
        totalRefundedAmount += sum;
        refundedCount += count;
      } else if (group.paymentStatus === 'FAILED') {
        totalFailedAmount += sum;
        failedCount += count;
      }

      if (group.paymentMethod === 'RAZORPAY') {
        razorpayCount += count;
      } else if (group.paymentMethod === 'CASH') {
        cashCount += count;
      }
    }

    const totalRecordsInDb = successCount + pendingCount + failedCount + refundedCount;

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      summary: {
        totalRecordsInDb,
        totalPaidRevenue,
        totalPendingAmount,
        totalRefundedAmount,
        totalFailedAmount,
        successCount,
        pendingCount,
        failedCount,
        refundedCount,
        razorpayCount,
        cashCount,
      },
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
      let firstCat = await this.prisma.pujaCategory.findFirst();
      if (!firstCat) {
        const catName = data.categoryName || 'Vedic Rituals';
        const catSlug = (data.categorySlug || catName)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') || 'vedic-rituals';

        firstCat = await this.prisma.pujaCategory.create({
          data: {
            name: catName,
            slug: `${catSlug}-${Date.now().toString().slice(-4)}`,
            description: 'Authentic Shastric rituals & ceremonies',
          },
        });
      }
      categoryId = firstCat.id;
    }

    const baseSlug = (data.slug || data.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'sacred-puja';
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

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
      include: {
        category: true,
      },
    });
  }

  /**
   * Safe Seeder: Ensure default authentic Puja catalog, categories, and sample bookings exist
   */
  async ensureDefaultCatalogAndBookings() {
    try {
      // 1. Categories
      let catGanesh = await this.prisma.pujaCategory.findFirst({ where: { slug: 'ganesh-auspicious' } });
      if (!catGanesh) {
        catGanesh = await this.prisma.pujaCategory.create({
          data: {
            name: 'Ganesh & Auspicious Rites',
            slug: 'ganesh-auspicious',
            description: 'Vighnaharta invocation, Sankalp, and auspicious beginnings',
          },
        });
      }

      let catSatya = await this.prisma.pujaCategory.findFirst({ where: { slug: 'satyanarayan-katha' } });
      if (!catSatya) {
        catSatya = await this.prisma.pujaCategory.create({
          data: {
            name: 'Satyanarayan & Katha',
            slug: 'satyanarayan-katha',
            description: 'Traditional Katha, family prosperity vows, and Mahapuja',
          },
        });
      }

      let catGriha = await this.prisma.pujaCategory.findFirst({ where: { slug: 'griha-pravesh-vastu' } });
      if (!catGriha) {
        catGriha = await this.prisma.pujaCategory.create({
          data: {
            name: 'Griha Pravesh & Vastu',
            slug: 'griha-pravesh-vastu',
            description: 'Vastu Shanti, Navgraha, and new home consecration',
          },
        });
      }

      let catShiva = await this.prisma.pujaCategory.findFirst({ where: { slug: 'shiva-rudrabhishek' } });
      if (!catShiva) {
        catShiva = await this.prisma.pujaCategory.create({
          data: {
            name: 'Shiva & Rudrabhishek',
            slug: 'shiva-rudrabhishek',
            description: 'Panchamrit Abhishek, Rudra chanting, and peace rituals',
          },
        });
      }

      let catHawan = await this.prisma.pujaCategory.findFirst({ where: { slug: 'hawan-yagya' } });
      if (!catHawan) {
        catHawan = await this.prisma.pujaCategory.create({
          data: {
            name: 'Hawan & Maha Yagya',
            slug: 'hawan-yagya',
            description: 'Maha Mrityunjaya, Navgraha, and sacred fire purification',
          },
        });
      }

      // 2. Default Authentic Pujas
      const defaultPujas = [
        {
          title: 'Satyanarayan Mahapuja & Katha',
          slug: 'satyanarayan-mahapuja',
          categoryId: catSatya.id,
          description: 'Auspicious Vishnu Katha and Mahapuja performed with complete Vidhi for family harmony and prosperity.',
          basePrice: 3501,
          samagriPrice: 1100,
          durationMinutes: 120,
          languages: ['Marathi', 'Hindi', 'Sanskrit'],
          imageUrl: '/images/pujas/satyanarayan.jpg',
        },
        {
          title: 'Griha Pravesh Vastu Puja',
          slug: 'griha-pravesh-vastu-puja',
          categoryId: catGriha.id,
          description: 'Complete new home entering ceremony including Vastu Shanti, Navgraha Hawan, and Kalash Sthapana.',
          basePrice: 5100,
          samagriPrice: 1899,
          durationMinutes: 180,
          languages: ['Marathi', 'Hindi', 'Sanskrit'],
          imageUrl: '/images/pujas/griha-pravesh.jpg',
        },
        {
          title: 'Ganesh Puja & Sankalp',
          slug: 'ganesh-puja-sankalp',
          categoryId: catGanesh.id,
          description: 'Vighnaharta invocation to eliminate hurdles before commencing any new venture or business.',
          basePrice: 2500,
          samagriPrice: 900,
          durationMinutes: 90,
          languages: ['Marathi', 'Hindi', 'Sanskrit'],
          imageUrl: '/images/pujas/ganesh.jpg',
        },
        {
          title: 'Rudrabhishek Mahapuja',
          slug: 'rudrabhishek-mahapuja',
          categoryId: catShiva.id,
          description: 'Sacred Shiva Abhishek with Panchamrit, Belpatra, and authentic Vedic Rudram chantings.',
          basePrice: 3100,
          samagriPrice: 1100,
          durationMinutes: 120,
          languages: ['Hindi', 'Sanskrit', 'Marathi'],
          imageUrl: '/images/pujas/rudrabhishek.jpg',
        },
        {
          title: 'Maha Mrityunjaya Hawan',
          slug: 'maha-mrityunjaya-hawan',
          categoryId: catHawan.id,
          description: 'Powerful Vedic healing ceremony for longevity, overcoming obstacles, and divine grace.',
          basePrice: 5500,
          samagriPrice: 2100,
          durationMinutes: 180,
          languages: ['Hindi', 'Sanskrit'],
          imageUrl: '/images/pujas/mrityunjaya.jpg',
        },
        {
          title: 'Navgraha Shanti Puja',
          slug: 'navgraha-shanti-puja',
          categoryId: catGriha.id,
          description: 'Harmonization of 9 celestial planetary deities to mitigate astrological doshas and bring peace.',
          basePrice: 3500,
          samagriPrice: 1200,
          durationMinutes: 120,
          languages: ['Marathi', 'Hindi', 'Sanskrit'],
          imageUrl: '/images/pujas/navgraha.jpg',
        },
      ];

      for (const p of defaultPujas) {
        const existing = await this.prisma.puja.findFirst({ where: { slug: p.slug } });
        if (!existing) {
          await this.prisma.puja.create({
            data: {
              title: p.title,
              slug: p.slug,
              categoryId: p.categoryId,
              description: p.description,
              basePrice: p.basePrice,
              samagriPrice: p.samagriPrice,
              durationMinutes: p.durationMinutes,
              requiredPandits: 1,
              languages: p.languages,
              requiredSamagri: [],
              imageUrl: p.imageUrl,
              isActive: true,
            },
          });
        }
      }

      // 3. Connect Pandits to Pujas
      const allPujas = await this.prisma.puja.findMany();
      const allPandits = await this.prisma.panditProfile.findMany();
      for (const pandit of allPandits) {
        for (const puja of allPujas) {
          await this.prisma.panditService.upsert({
            where: {
              panditProfileId_pujaId: {
                panditProfileId: pandit.id,
                pujaId: puja.id,
              },
            },
            create: {
              panditProfileId: pandit.id,
              pujaId: puja.id,
              isActive: true,
            },
            update: {
              isActive: true,
            },
          }).catch(() => {});
        }
      }

      // 4. Default Bookings & Payments if none exist
      const bookingsCount = await this.prisma.booking.count();
      if (bookingsCount === 0 && allPujas.length > 0 && allPandits.length > 0) {
        const customer = await this.prisma.customerProfile.findFirst({ where: { user: { isDeleted: false } } });
        if (customer) {
          const booking1 = await this.prisma.booking.create({
            data: {
              bookingNumber: 'DS-206181-624',
              customerProfileId: customer.id,
              panditProfileId: allPandits[0].id,
              pujaId: allPujas[0].id,
              pujaDate: new Date(Date.now() + 86400000 * 3),
              pujaTimeSlot: '09:00 AM (Shubh Choghadiya)',
              pujaLanguage: 'Marathi',
              venueAddress: 'Flat 101, Shivam Heights, Kothrud',
              city: 'Pune',
              pincode: '411038',
              includeSamagri: true,
              pujaFee: new Prisma.Decimal(3501),
              samagriFee: new Prisma.Decimal(1100),
              platformFee: new Prisma.Decimal(99),
              discountAmount: new Prisma.Decimal(0),
              totalAmount: new Prisma.Decimal(4700),
              status: 'CONFIRMED',
            },
          });

          await this.prisma.payment.create({
            data: {
              paymentNumber: `PAY-${Date.now()}`,
              bookingId: booking1.id,
              amount: new Prisma.Decimal(4700),
              paymentMethod: 'RAZORPAY',
              paymentStatus: 'SUCCESS',
              razorpayPaymentId: `pay_sample_${Date.now()}`,
            },
          });
        }
      }
    } catch (e) {
      console.warn('ensureDefaultCatalogAndBookings warning:', e);
    }
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

  // ==========================================
  // CATEGORIES MANAGEMENT
  // ==========================================
  async getCategories(query?: { search?: string }) {
    const where: Prisma.PujaCategoryWhereInput = {};
    if (query?.search) {
      where.OR = [
        { name: { contains: query.search.trim(), mode: 'insensitive' } },
        { slug: { contains: query.search.trim(), mode: 'insensitive' } },
      ];
    }
    return this.prisma.pujaCategory.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { pujas: true },
        },
      },
    });
  }

  async createCategory(data: { name: string; slug?: string; description?: string; imageUrl?: string; isActive?: boolean }) {
    const slug = data.slug?.trim() || data.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    return this.prisma.pujaCategory.create({
      data: {
        name: data.name.trim(),
        slug,
        description: data.description?.trim(),
        imageUrl: data.imageUrl,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
  }

  async updateCategory(id: string, data: any) {
    return this.prisma.pujaCategory.update({
      where: { id },
      data,
    });
  }

  async deleteCategory(id: string) {
    return this.prisma.pujaCategory.delete({
      where: { id },
    });
  }

  // ==========================================
  // PRODUCTS / SAMAGRI MANAGEMENT
  // ==========================================
  async getProducts(query?: { search?: string; category?: string; page?: number; limit?: number }) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      isDeleted: false,
    };

    if (query?.category && query.category !== 'ALL') {
      where.category = query.category;
    }

    if (query?.search) {
      where.OR = [
        { name: { contains: query.search.trim(), mode: 'insensitive' } },
        { category: { contains: query.search.trim(), mode: 'insensitive' } },
        { slug: { contains: query.search.trim(), mode: 'insensitive' } },
      ];
    }

    const [total, products] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: products,
    };
  }

  async createProduct(data: any) {
    const slug = data.slug?.trim() || data.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);
    return this.prisma.product.create({
      data: {
        name: data.name.trim(),
        slug,
        description: data.description || '',
        category: data.category || 'Puja Samagri',
        price: new Prisma.Decimal(data.price),
        discountPrice: data.discountPrice ? new Prisma.Decimal(data.discountPrice) : null,
        stockQuantity: Number(data.stockQuantity || 0),
        images: Array.isArray(data.images) ? data.images : [],
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
  }

  async updateProduct(id: string, data: any) {
    const updateData: any = { ...data };
    if (updateData.price !== undefined) {
      updateData.price = new Prisma.Decimal(updateData.price);
    }
    if (updateData.discountPrice !== undefined) {
      updateData.discountPrice = updateData.discountPrice ? new Prisma.Decimal(updateData.discountPrice) : null;
    }
    if (updateData.stockQuantity !== undefined) {
      updateData.stockQuantity = Number(updateData.stockQuantity);
    }
    return this.prisma.product.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteProduct(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  // ==========================================
  // ORDERS MANAGEMENT
  // ==========================================
  async getOrders(query?: { status?: string; search?: string; page?: number; limit?: number }) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    if (query?.status && query.status !== 'ALL') {
      where.status = query.status as OrderStatus;
    }

    if (query?.search) {
      const s = query.search.trim();
      where.OR = [
        { orderNumber: { contains: s, mode: 'insensitive' } },
        { trackingNumber: { contains: s, mode: 'insensitive' } },
        { customerProfile: { firstName: { contains: s, mode: 'insensitive' } } },
        { customerProfile: { lastName: { contains: s, mode: 'insensitive' } } },
        { customerProfile: { user: { email: { contains: s, mode: 'insensitive' } } } },
      ];
    }

    const [total, orders] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customerProfile: {
            include: {
              user: { select: { email: true, phoneNumber: true } },
            },
          },
          shippingAddress: true,
          orderItems: {
            include: { product: true },
          },
          payments: true,
        },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: orders,
    };
  }

  async updateOrderStatus(id: string, status: OrderStatus) {
    return this.prisma.order.update({
      where: { id },
      data: { status },
    });
  }

  async updateOrderTracking(id: string, trackingNumber: string) {
    return this.prisma.order.update({
      where: { id },
      data: { trackingNumber: trackingNumber.trim() },
    });
  }

  // ==========================================
  // REVIEWS MANAGEMENT
  // ==========================================
  async getReviews(query?: { rating?: number; isPublished?: boolean; search?: string; page?: number; limit?: number }) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ReviewWhereInput = {};

    if (query?.rating) {
      where.rating = Number(query.rating);
    }
    if (query?.isPublished !== undefined) {
      where.isPublished = query.isPublished;
    }

    const [total, reviews] = await Promise.all([
      this.prisma.review.count({ where }),
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, email: true, phoneNumber: true, customerProfile: true },
          },
          panditProfile: {
            select: { id: true, fullName: true, city: true, avatarUrl: true },
          },
          booking: {
            select: { id: true, bookingNumber: true, puja: { select: { title: true } } },
          },
        },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: reviews,
    };
  }

  async toggleReviewPublish(id: string, isPublished: boolean) {
    return this.prisma.review.update({
      where: { id },
      data: { isPublished },
    });
  }

  async deleteReview(id: string) {
    return this.prisma.review.delete({
      where: { id },
    });
  }

  // ==========================================
  // SUPPORT TICKETS DESK
  // ==========================================
  async getSupportTickets(query?: { status?: string; priority?: string; page?: number; limit?: number }) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.SupportTicketWhereInput = {};

    if (query?.status && query.status !== 'ALL') {
      where.status = query.status as TicketStatus;
    }
    if (query?.priority && query.priority !== 'ALL') {
      where.priority = query.priority as TicketPriority;
    }

    const [total, tickets] = await Promise.all([
      this.prisma.supportTicket.count({ where }),
      this.prisma.supportTicket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, phoneNumber: true, role: true, customerProfile: true, panditProfile: true },
          },
          assignedTo: {
            select: { id: true, email: true },
          },
          booking: {
            select: { id: true, bookingNumber: true },
          },
        },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: tickets,
    };
  }

  async updateSupportTicket(id: string, data: { status?: TicketStatus; priority?: TicketPriority; assignedToId?: string }) {
    return this.prisma.supportTicket.update({
      where: { id },
      data,
    });
  }

  // ==========================================
  // COUPONS MANAGEMENT
  // ==========================================
  async getCoupons() {
    return this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCoupon(data: any) {
    return this.prisma.coupon.create({
      data: {
        code: data.code.toUpperCase().trim(),
        discountPct: data.discountPct ? new Prisma.Decimal(data.discountPct) : null,
        discountAmount: data.discountAmount ? new Prisma.Decimal(data.discountAmount) : null,
        minSpend: data.minSpend ? new Prisma.Decimal(data.minSpend) : null,
        maxDiscount: data.maxDiscount ? new Prisma.Decimal(data.maxDiscount) : null,
        validFrom: new Date(data.validFrom),
        validUntil: new Date(data.validUntil),
        usageLimit: data.usageLimit ? Number(data.usageLimit) : null,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
  }

  async updateCoupon(id: string, data: any) {
    const updateData: any = { ...data };
    if (updateData.discountPct !== undefined) updateData.discountPct = updateData.discountPct ? new Prisma.Decimal(updateData.discountPct) : null;
    if (updateData.discountAmount !== undefined) updateData.discountAmount = updateData.discountAmount ? new Prisma.Decimal(updateData.discountAmount) : null;
    if (updateData.validFrom) updateData.validFrom = new Date(updateData.validFrom);
    if (updateData.validUntil) updateData.validUntil = new Date(updateData.validUntil);
    return this.prisma.coupon.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteCoupon(id: string) {
    return this.prisma.coupon.delete({
      where: { id },
    });
  }
}
