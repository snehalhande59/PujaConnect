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
}
