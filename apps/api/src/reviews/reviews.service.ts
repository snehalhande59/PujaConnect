import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  extractUserIdFromAuthHeader(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.replace('Bearer ', '').trim();
    try {
      const payload: any = this.jwtService.decode(token);
      return payload?.sub || payload?.id || null;
    } catch {
      return null;
    }
  }

  async createReview(userId: string | null, dto: CreateReviewDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: {
        customerProfile: true,
        panditProfile: true,
        puja: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID '${dto.bookingId}' not found.`);
    }

    if (!booking.panditProfileId) {
      throw new BadRequestException('Cannot submit review: no Pandit is assigned to this ceremony.');
    }

    // 1. Authentication check
    if (!userId) {
      throw new BadRequestException('Authentication required: please log in as the devotee customer who made this booking.');
    }

    // 2. Ownership check: Must be the devotee who booked this ceremony
    if (booking.customerProfile.userId !== userId) {
      throw new BadRequestException('Access denied: you can only submit a review for your own ceremony bookings.');
    }

    // 3. Completed booking check
    if (booking.status !== 'COMPLETED') {
      throw new BadRequestException(`Cannot review a ceremony that is not yet completed (Current status: ${booking.status}).`);
    }

    // 4. Duplicate prevention: Exactly one review per booking
    const existing = await this.prisma.review.findFirst({
      where: { bookingId: dto.bookingId },
    });

    if (existing) {
      throw new BadRequestException('A review has already been submitted for this ceremony booking.');
    }

    const review = await this.prisma.review.create({
      data: {
        bookingId: booking.id,
        customerId: userId,
        panditProfileId: booking.panditProfileId,
        rating: Math.min(5, Math.max(1, Math.round(dto.rating))),
        comment: dto.comment?.trim() || null,
        isPublished: true,
      },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            customerProfile: { select: { firstName: true, lastName: true } },
          },
        },
        panditProfile: { select: { id: true, fullName: true } },
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            puja: { select: { title: true } },
          },
        },
      },
    });

    // Recalculate average rating for Pandit
    try {
      const aggregate = await this.prisma.review.aggregate({
        where: { panditProfileId: booking.panditProfileId, isPublished: true },
        _avg: { rating: true },
        _count: { id: true },
      });

      await this.prisma.panditProfile.update({
        where: { id: booking.panditProfileId },
        data: {
          averageRating: Number(aggregate._avg.rating || dto.rating),
          totalReviews: aggregate._count.id,
        },
      });
    } catch (e: any) {
      this.logger.warn(`Could not recalculate Pandit average rating: ${e?.message}`);
    }

    return review;
  }

  async getPublicReviews(panditProfileId?: string) {
    const where: any = { isPublished: true };
    if (panditProfileId) where.panditProfileId = panditProfileId;

    return this.prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        customer: {
          select: {
            customerProfile: { select: { firstName: true, lastName: true } },
          },
        },
        panditProfile: { select: { fullName: true } },
        booking: { select: { puja: { select: { title: true } } } },
      },
    });
  }
}
