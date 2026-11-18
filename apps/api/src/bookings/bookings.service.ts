import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus, VerificationStatus, Role } from '@prisma/client';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new Puja booking request by Customer
   */
  async createBooking(userId: string, dto: CreateBookingDto) {
    // 1. Get customer profile
    let customerProfile = await this.prisma.customerProfile.findUnique({
      where: { userId },
    });

    if (!customerProfile) {
      // Auto-create CustomerProfile if missing
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      customerProfile = await this.prisma.customerProfile.create({
        data: {
          userId,
          firstName: user?.email.split('@')[0] || 'Devotee',
          lastName: '',
        },
      });
    }

    // 2. Validate Pandit exists and is VERIFIED
    const pandit = await this.prisma.panditProfile.findUnique({
      where: { id: dto.panditProfileId },
      include: { user: true },
    });

    if (!pandit) {
      throw new NotFoundException('Selected Pandit profile not found.');
    }

    if (pandit.verificationStatus !== VerificationStatus.VERIFIED) {
      throw new BadRequestException('Selected Pandit is not verified to accept bookings.');
    }

    // 3. Validate Puja
    const puja = await this.prisma.puja.findUnique({
      where: { id: dto.pujaId },
    });

    if (!puja || !puja.isActive || puja.isDeleted) {
      throw new NotFoundException('Selected Puja service not found or inactive.');
    }

    // 4. Calculate fees
    const pujaFee = Number(puja.basePrice);
    const samagriFee = dto.includeSamagri ? Number(puja.samagriPrice) : 0;
    const platformFee = 99; // Standard platform protection fee
    const totalAmount = pujaFee + samagriFee + platformFee;

    const bookingNumber = `DS-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // 5. Create Booking
    const booking = await this.prisma.booking.create({
      data: {
        bookingNumber,
        customerProfileId: customerProfile.id,
        panditProfileId: pandit.id,
        pujaId: puja.id,
        pujaDate: new Date(dto.pujaDate),
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
        status: BookingStatus.PENDING,
        specialInstructions: dto.specialInstructions?.trim() || null,
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
        panditProfile: true,
      },
    });

    // 6. Notify Pandit
    await this.prisma.notification.create({
      data: {
        userId: pandit.userId,
        title: 'New Booking Request',
        message: `You have received a new booking request for ${puja.title} on ${dto.pujaDate} at ${dto.pujaTimeSlot}.`,
        type: 'BOOKING',
        link: '/pandit/dashboard',
      },
    });

    // 7. Notify Customer
    await this.prisma.notification.create({
      data: {
        userId,
        title: 'Booking Placed Successfully',
        message: `Your booking request #${bookingNumber} for ${puja.title} has been placed. Waiting for Pandit confirmation.`,
        type: 'BOOKING',
        link: '/bookings',
      },
    });

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
