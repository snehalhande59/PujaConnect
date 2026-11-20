import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus, VerificationStatus, Role, PaymentMethod, PaymentStatus } from '@prisma/client';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Helper to extract userId from Bearer token
   */
  extractUserIdFromAuthHeader(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    try {
      const token = authHeader.replace('Bearer ', '').trim();
      const payload: any = this.jwtService.decode(token);
      return payload?.sub || payload?.id || null;
    } catch {
      return null;
    }
  }

  /**
   * Create a new Puja booking request by Customer or Guest Devotee
   */
  async createBooking(userId: string | null | undefined, dto: CreateBookingDto) {
    // 1. Resolve Customer Profile
    let customerProfile: any = null;

    if (userId) {
      customerProfile = await this.prisma.customerProfile.findUnique({
        where: { userId },
        include: { user: true },
      });
    }

    if (!customerProfile && (dto.customerPhone || dto.customerEmail)) {
      // Look for existing user by phone or email
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            ...(dto.customerPhone ? [{ phoneNumber: dto.customerPhone }] : []),
            ...(dto.customerEmail ? [{ email: dto.customerEmail }] : []),
          ],
        },
        include: { customerProfile: true },
      });

      if (existingUser?.customerProfile) {
        customerProfile = existingUser.customerProfile;
      }
    }

    if (!customerProfile) {
      // Find default or first customer in DB, or auto-create a dedicated customer profile
      const firstCustomer = await this.prisma.customerProfile.findFirst({
        include: { user: true },
      });

      if (firstCustomer) {
        customerProfile = firstCustomer;
      } else {
        // Create demo customer user
        const newCustomerUser = await this.prisma.user.create({
          data: {
            email: dto.customerEmail || `devotee.${Date.now()}@devsutra.in`,
            phoneNumber: dto.customerPhone || '9822012345',
            passwordHash: 'dummy_hash',
            role: Role.CUSTOMER,
            customerProfile: {
              create: {
                firstName: dto.customerName?.split(' ')[0] || 'Devotee',
                lastName: dto.customerName?.split(' ').slice(1).join(' ') || '',
              },
            },
          },
          include: { customerProfile: true },
        });
        customerProfile = newCustomerUser.customerProfile;
      }
    }

    // 2. Resolve Puja (by UUID, slug, title, or fallback)
    let puja: any = null;
    const isPujaUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dto.pujaId);

    if (isPujaUuid) {
      puja = await this.prisma.puja.findUnique({ where: { id: dto.pujaId } });
    }

    if (!puja) {
      // Search by slug or title
      puja = await this.prisma.puja.findFirst({
        where: {
          OR: [
            { slug: dto.pujaId },
            { slug: { contains: dto.pujaId } },
            { title: { contains: dto.pujaId, mode: 'insensitive' } },
          ],
        },
      });
    }

    if (!puja) {
      // Fallback to first active puja
      puja = await this.prisma.puja.findFirst({
        where: { isActive: true, isDeleted: false },
      });
    }

    if (!puja) {
      throw new NotFoundException('No active Puja service available.');
    }

    // 3. Resolve Pandit: Customer must manually select a specific verified Pandit
    if (!dto.panditProfileId) {
      throw new BadRequestException('Please select a verified Vedic Pandit for this ceremony. Manual pandit selection is required.');
    }

    let pandit: any = null;
    const isPanditUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dto.panditProfileId);

    if (isPanditUuid) {
      pandit = await this.prisma.panditProfile.findUnique({
        where: { id: dto.panditProfileId },
        include: { user: true },
      });
    } else {
      // Find by exact name if text passed
      pandit = await this.prisma.panditProfile.findFirst({
        where: {
          fullName: { equals: dto.panditProfileId.trim(), mode: 'insensitive' },
          user: { isActive: true, isDeleted: false },
        },
        include: { user: true },
      });
    }

    if (!pandit || !pandit.user.isActive || pandit.user.isDeleted || pandit.verificationStatus !== VerificationStatus.VERIFIED) {
      throw new BadRequestException('The selected Pandit is currently unavailable or unverified. Please choose an active verified Pandit from the directory.');
    }

    // Parse booking date
    let parsedDate: Date;
    try {
      const parsed = new Date(dto.pujaDate);
      parsedDate = isNaN(parsed.getTime()) ? new Date() : parsed;
    } catch {
      parsedDate = new Date();
    }

    // Prevent double booking for the same Pandit, date and time slot
    const conflictingBooking = await this.prisma.booking.findFirst({
      where: {
        panditProfileId: pandit.id,
        pujaDate: parsedDate,
        pujaTimeSlot: dto.pujaTimeSlot,
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.ACCEPTED, BookingStatus.PENDING] },
      },
    });

    if (conflictingBooking) {
      throw new BadRequestException(
        `Selected Pandit (${pandit.fullName}) is already booked for ${dto.pujaTimeSlot} on ${dto.pujaDate}. Please choose a different time slot or select another Pandit.`,
      );
    }

    // 4. Calculate fees & parse amounts
    const pujaFee = Number(puja.basePrice);
    const samagriFee = dto.includeSamagri ? Number(puja.samagriPrice) : 0;
    const platformFee = 99;
    const calculatedTotal = pujaFee + samagriFee + platformFee;
    const totalAmount = dto.totalAmount ? Number(dto.totalAmount) : calculatedTotal;

    const bookingNumber = `DS-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const isPaid = dto.paymentStatus === 'PAID' || Boolean(dto.transactionId);
    const bookingStatus = isPaid ? BookingStatus.CONFIRMED : BookingStatus.PENDING;

    // 5. Create Booking in database
    const booking = await this.prisma.booking.create({
      data: {
        bookingNumber,
        customerProfileId: customerProfile.id,
        panditProfileId: pandit.id,
        pujaId: puja.id,
        pujaDate: parsedDate,
        pujaTimeSlot: dto.pujaTimeSlot,
        pujaLanguage: dto.pujaLanguage,
        venueAddress: dto.venueAddress.trim(),
        city: dto.city.trim(),
        pincode: dto.pincode.trim(),
        includeSamagri: Boolean(dto.includeSamagri),
        pujaFee,
        samagriFee,
        platformFee,
        totalAmount,
        status: bookingStatus,
        specialInstructions: dto.specialInstructions?.trim() || null,
        statusHistory: {
          create: {
            fromStatus: null,
            toStatus: bookingStatus,
            action: 'BOOKING_CREATED',
            changedBy: 'CUSTOMER',
            reason: 'Devotee created ceremony booking request',
          },
        },
        bookingItems: {
          create: [
            {
              itemType: 'PUJA',
              name: puja.title,
              quantity: 1,
              unitPrice: pujaFee,
              totalPrice: pujaFee,
            },
            ...(dto.includeSamagri
              ? [
                  {
                    itemType: 'SAMAGRI_KIT',
                    name: `${puja.title} - Complete Samagri Kit`,
                    quantity: 1,
                    unitPrice: samagriFee,
                    totalPrice: samagriFee,
                  },
                ]
              : []),
          ],
        },
      },
      include: {
        puja: true,
        panditProfile: {
          include: { user: true },
        },
        customerProfile: {
          include: { user: true },
        },
      },
    });

    // 6. Record Payment if paid
    if (isPaid) {
      try {
        await this.prisma.payment.create({
          data: {
            paymentNumber: `PAY-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
            bookingId: booking.id,
            amount: totalAmount,
            currency: 'INR',
            paymentMethod: dto.paymentMethod === 'CASH' ? PaymentMethod.CASH : PaymentMethod.RAZORPAY,
            paymentStatus: PaymentStatus.SUCCESS,
            razorpayPaymentId: dto.transactionId || `PAY_${Date.now()}`,
            razorpayOrderId: bookingNumber,
          },
        });
      } catch (err) {
        console.warn('Payment record notice:', err);
      }
    }

    // 7. Notify Pandit & Customer
    try {
      if (pandit.userId) {
        await this.prisma.notification.create({
          data: {
            userId: pandit.userId,
            title: 'New Booking Request',
            message: `New sacred booking #${bookingNumber} for ${puja.title} on ${dto.pujaDate}.`,
            type: 'BOOKING',
            link: '/pandit/dashboard',
          },
        });
      }

      if (customerProfile.userId) {
        await this.prisma.notification.create({
          data: {
            userId: customerProfile.userId,
            title: isPaid ? 'Puja Booking Confirmed!' : 'Booking Placed Successfully',
            message: `Your booking #${bookingNumber} for ${puja.title} has been placed.`,
            type: 'BOOKING',
            link: '/bookings',
          },
        });
      }
    } catch {
      // non-fatal
    }

    return booking;
  }

  /**
   * Get bookings for currently authenticated Customer
   */
  async getMyCustomerBookings(userId: string) {
    const customer = await this.prisma.customerProfile.findUnique({
      where: { userId },
    });

    if (!customer) {
      return [];
    }

    return this.prisma.booking.findMany({
      where: { customerProfileId: customer.id },
      include: {
        puja: {
          select: { id: true, title: true, slug: true, imageUrl: true, durationMinutes: true },
        },
        panditProfile: {
          select: { id: true, fullName: true, avatarUrl: true, city: true, averageRating: true },
        },
        bookingItems: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get bookings for currently authenticated Pandit
   */
  async getMyPanditBookings(userId: string) {
    const pandit = await this.prisma.panditProfile.findUnique({
      where: { userId },
    });

    if (!pandit) {
      return [];
    }

    return this.prisma.booking.findMany({
      where: { panditProfileId: pandit.id },
      include: {
        puja: {
          select: { id: true, title: true, slug: true, durationMinutes: true },
        },
        customerProfile: {
          select: { id: true, firstName: true, lastName: true },
        },
        bookingItems: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get single booking details
   */
  async getBookingDetails(userId: string, userRole: Role, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        puja: true,
        panditProfile: {
          include: {
            user: { select: { email: true, phoneNumber: true } },
          },
        },
        customerProfile: {
          include: {
            user: { select: { email: true, phoneNumber: true } },
          },
        },
        bookingItems: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    // Role check
    if (
      userRole !== Role.ADMIN &&
      booking.customerProfile.userId !== userId &&
      booking.panditProfile.userId !== userId
    ) {
      throw new ForbiddenException('You do not have access to this booking.');
    }

    return booking;
  }

  /**
   * Pandit accepts booking
   */
  async acceptBooking(userId: string, bookingId: string) {
    const pandit = await this.prisma.panditProfile.findUnique({ where: { userId } });
    if (!pandit) throw new NotFoundException('Pandit profile not found.');

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { customerProfile: true, puja: true },
    });

    if (!booking) throw new NotFoundException('Booking not found.');
    if (booking.panditProfileId !== pandit.id) {
      throw new ForbiddenException('You are not authorized to accept this booking.');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException(`Cannot accept booking in ${booking.status} status.`);
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.ACCEPTED },
    });

    // Notify Customer
    await this.prisma.notification.create({
      data: {
        userId: booking.customerProfile.userId,
        title: 'Booking Accepted! 🎉',
        message: `${pandit.fullName} has accepted your booking #${booking.bookingNumber} for ${booking.puja.title}.`,
        type: 'BOOKING',
        link: '/bookings',
      },
    });

    return updated;
  }

  /**
   * Pandit declines booking
   */
  async rejectBooking(userId: string, bookingId: string, reason?: string) {
    const pandit = await this.prisma.panditProfile.findUnique({ where: { userId } });
    if (!pandit) throw new NotFoundException('Pandit profile not found.');

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { customerProfile: true, puja: true },
    });

    if (!booking) throw new NotFoundException('Booking not found.');
    if (booking.panditProfileId !== pandit.id) {
      throw new ForbiddenException('You are not authorized to decline this booking.');
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.REJECTED,
        cancellationReason: reason || 'Pandit unavailable for selected slot.',
      },
    });

    // Notify Customer
    await this.prisma.notification.create({
      data: {
        userId: booking.customerProfile.userId,
        title: 'Booking Request Declined',
        message: `Your booking #${booking.bookingNumber} was declined by the Pandit. Please select an alternate slot or another Pandit.`,
        type: 'BOOKING',
        link: '/bookings',
      },
    });

    return updated;
  }

  /**
   * Customer cancels booking
   */
  async cancelBooking(userId: string, bookingId: string, reason?: string) {
    const customer = await this.prisma.customerProfile.findUnique({ where: { userId } });
    if (!customer) throw new NotFoundException('Customer profile not found.');

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { panditProfile: true, puja: true },
    });

    if (!booking) throw new NotFoundException('Booking not found.');
    if (booking.customerProfileId !== customer.id) {
      throw new ForbiddenException('You are not authorized to cancel this booking.');
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CANCELLED,
        cancellationReason: reason || 'Cancelled by devotee.',
      },
    });

    // Notify Pandit
    await this.prisma.notification.create({
      data: {
        userId: booking.panditProfile.userId,
        title: 'Booking Cancelled',
        message: `Booking #${booking.bookingNumber} for ${booking.puja.title} was cancelled by the devotee.`,
        type: 'BOOKING',
        link: '/pandit/dashboard',
      },
    });

    return updated;
  }
}
