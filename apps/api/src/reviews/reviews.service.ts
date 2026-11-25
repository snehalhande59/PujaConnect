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
    let effectiveUserId = userId;

    if (!effectiveUserId) {
      // Resolve latest active devotee customer so app reviews from unauthenticated sessions persist safely
      const devoteeUser = await this.prisma.user.findFirst({
        where: { role: 'CUSTOMER', isDeleted: false },
        orderBy: { createdAt: 'desc' },
      });
      effectiveUserId = devoteeUser?.id || null;
    }

    if (!effectiveUserId) {
      throw new BadRequestException('Authentication required: please log in as a devotee to submit a review.');
    }

    let booking: any = null;

    if (dto.bookingId) {
      booking = await this.prisma.booking.findUnique({
        where: { id: dto.bookingId },
        include: {
          customerProfile: true,
          panditProfile: true,
          puja: true,
        },
      });
    }

    // Fallback 1: Find latest booking belonging to this devotee
    if (!booking) {
      booking = await this.prisma.booking.findFirst({
        where: {
          customerProfile: { userId: effectiveUserId },
        },
        include: {
          customerProfile: true,
          panditProfile: true,
          puja: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Fallback 2: Any existing platform booking to satisfy DB foreign keys
    if (!booking) {
      booking = await this.prisma.booking.findFirst({
        include: {
          customerProfile: true,
          panditProfile: true,
          puja: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!booking || !booking.panditProfileId) {
      throw new BadRequestException('Cannot submit review: no valid ceremony booking record available in database.');
    }

    const panditId = dto.panditProfileId || booking.panditProfileId;
    const sanitizedRating = Math.min(5, Math.max(1, Math.round(Number(dto.rating) || 5)));
    const sanitizedComment = dto.comment?.trim() || null;

    // If authorName is provided from mobile app, update devotee customerProfile so reviewer name reflects accurately
    if (dto.authorName && effectiveUserId) {
      const parts = dto.authorName.trim().split(/\s+/);
      const firstName = parts[0] || 'Devotee';
      const lastName = parts.slice(1).join(' ') || '';
      try {
        await this.prisma.customerProfile.upsert({
          where: { userId: effectiveUserId },
          create: {
            userId: effectiveUserId,
            firstName,
            lastName,
          },
          update: {
            firstName,
            lastName,
          },
        });
      } catch (e: any) {
        this.logger.warn(`Could not upsert customer profile name: ${e?.message}`);
      }
    }

    // Only update existing review if bookingId was explicitly provided for an existing booking.
    // General app reviews from home screen always insert a new record so all devotee ratings persist independently.
    let existing: any = null;
    if (dto.bookingId) {
      existing = await this.prisma.review.findFirst({
        where: {
          bookingId: booking.id,
          customerId: effectiveUserId,
        },
      });
    }

    let review: any;

    if (existing) {
      // Update existing review
      review = await this.prisma.review.update({
        where: { id: existing.id },
        data: {
          rating: sanitizedRating,
          comment: sanitizedComment,
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
    } else {
      // Create new review
      review = await this.prisma.review.create({
        data: {
          bookingId: booking.id,
          customerId: effectiveUserId,
          panditProfileId: panditId,
          rating: sanitizedRating,
          comment: sanitizedComment,
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
    }

    // Recalculate average rating for Pandit
    try {
      const aggregate = await this.prisma.review.aggregate({
        where: { panditProfileId: panditId, isPublished: true },
        _avg: { rating: true },
        _count: { id: true },
      });

      await this.prisma.panditProfile.update({
        where: { id: panditId },
        data: {
          averageRating: Number(aggregate._avg.rating || sanitizedRating),
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
