import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VerificationStatus, Role } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { UploadDocumentDto } from './dto/upload-document.dto';

@Injectable()
export class PanditsService {
  private readonly logger = new Logger(PanditsService.name);
  private readonly uploadDir: string;

  constructor(private readonly prisma: PrismaService) {
    this.uploadDir = path.resolve(process.cwd(), 'uploads', 'pandit-documents');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Public discovery: Browse verified Pandits with filters
   */
  async findPublicPandits(params?: {
    city?: string;
    search?: string;
    specialization?: string;
    language?: string;
  }) {
    const where: any = {
      verificationStatus: VerificationStatus.VERIFIED,
      isAvailable: true,
      user: { isActive: true, isDeleted: false },
    };

    if (params?.city && params.city !== 'All Cities') {
      where.city = { contains: params.city.trim(), mode: 'insensitive' };
    }

    if (params?.search) {
      where.OR = [
        { fullName: { contains: params.search.trim(), mode: 'insensitive' } },
        { bio: { contains: params.search.trim(), mode: 'insensitive' } },
      ];
    }

    if (params?.specialization && params.specialization !== 'All Rituals') {
      where.specializations = { has: params.specialization.trim() };
    }

    if (params?.language && params.language !== 'All Languages') {
      where.languages = { has: params.language.trim() };
    }

    return this.prisma.panditProfile.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        avatarUrl: true,
        experienceYears: true,
        languages: true,
        specializations: true,
        city: true,
        state: true,
        serviceAreas: true,
        bio: true,
        basePrice: true,
        averageRating: true,
        totalReviews: true,
        verificationStatus: true,
      },
      orderBy: { averageRating: 'desc' },
    });
  }

  /**
   * Public Pandit Details by Profile ID
   */
  async findPublicPanditById(id: string) {
    const pandit = await this.prisma.panditProfile.findFirst({
      where: {
        id,
        verificationStatus: VerificationStatus.VERIFIED,
        user: { isActive: true, isDeleted: false },
      },
      include: {
        services: {
          include: {
            puja: {
              select: { id: true, title: true, slug: true, durationMinutes: true, basePrice: true },
            },
          },
        },
        reviewsReceived: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: {
              select: {
                email: true,
                customerProfile: {
                  select: { firstName: true, lastName: true },
                },
              },
            },
          },
        },
      },
    });

    if (!pandit) {
      throw new NotFoundException('Verified Pandit profile not found.');
    }

    return pandit;
  }

  /**
   * Get the current authenticated Pandit's profile, verification status and documents
   */
  async getMyProfile(userId: string) {
    const profile = await this.prisma.panditProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        },
        documents: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Pandit profile not found for this account.');
    }

    return profile;
  }

  /**
   * Upload a verification document (Aadhaar, PAN, Vedic Certificate, Profile Photo)
   */
  async uploadDocument(
    userId: string,
    file: { originalname: string; mimetype: string; buffer: Buffer; size: number },
    dto: UploadDocumentDto,
  ) {
    if (!file) {
      throw new BadRequestException('Document file is required.');
    }

    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Allowed formats: PDF, JPG, JPEG, PNG, WEBP.',
      );
    }

    const maxSizeBytes = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSizeBytes) {
      throw new BadRequestException('File size must not exceed 5MB.');
    }

    const profile = await this.prisma.panditProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Pandit profile not found.');
    }

    // Generate secure random filename
    const ext = path.extname(file.originalname).toLowerCase() || '.bin';
    const randomName = `${Date.now()}-${crypto.randomBytes(12).toString('hex')}${ext}`;
    const destinationPath = path.join(this.uploadDir, randomName);

    // Save file securely to private storage directory
    fs.writeFileSync(destinationPath, file.buffer);
    this.logger.log(`Document saved to ${destinationPath} for pandit ${profile.id}`);

    // If PROFILE_PHOTO, update avatarUrl on the PanditProfile
    if (dto.documentType === 'PROFILE_PHOTO') {
      await this.prisma.panditProfile.update({
        where: { id: profile.id },
        data: {
          avatarUrl: `/api/v1/pandits/documents/file/${randomName}`,
        },
      });
    }

    // Create document record in database
    const document = await this.prisma.panditDocument.create({
      data: {
        panditProfileId: profile.id,
        documentType: dto.documentType,
        documentNumber: dto.documentNumber?.trim() || null,
        fileUrl: randomName,
        isVerified: false,
      },
    });

    return document;
  }

  /**
   * Get all uploaded documents for the current Pandit
   */
  async getMyDocuments(userId: string) {
    const profile = await this.prisma.panditProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Pandit profile not found.');
    }

    return this.prisma.panditDocument.findMany({
      where: { panditProfileId: profile.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Delete an unverified document
   */
  async deleteDocument(userId: string, documentId: string) {
    const profile = await this.prisma.panditProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Pandit profile not found.');
    }

    const document = await this.prisma.panditDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found.');
    }

    if (document.panditProfileId !== profile.id) {
      throw new ForbiddenException('You are not authorized to delete this document.');
    }

    if (document.isVerified) {
      throw new BadRequestException(
        'Verified documents cannot be deleted. Contact DevSutra admin support.',
      );
    }

    // Delete file from disk if exists
    const filePath = path.join(this.uploadDir, document.fileUrl);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        this.logger.warn(`Could not remove file ${filePath}: ${err}`);
      }
    }

    await this.prisma.panditDocument.delete({
      where: { id: documentId },
    });

    return {
      success: true,
      message: 'Document deleted successfully.',
    };
  }

  /**
   * Resubmit profile for verification after fixing issues / uploading new documents
   */
  async resubmitVerification(userId: string) {
    const profile = await this.prisma.panditProfile.findUnique({
      where: { userId },
      include: {
        documents: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Pandit profile not found.');
    }

    if (profile.verificationStatus === VerificationStatus.VERIFIED) {
      throw new BadRequestException('Your profile is already verified.');
    }

    if (profile.documents.length === 0) {
      throw new BadRequestException(
        'Please upload at least one verification document (e.g., Aadhaar or Vedic Certificate) before resubmitting.',
      );
    }

    const updated = await this.prisma.panditProfile.update({
      where: { id: profile.id },
      data: {
        verificationStatus: VerificationStatus.PENDING,
        rejectionReason: null,
      },
      include: {
        documents: true,
      },
    });

    // Create notification for the Pandit
    await this.prisma.notification.create({
      data: {
        userId,
        title: 'Verification Resubmitted',
        message: 'Your verification documents have been resubmitted. DevSutra administrators will review your profile shortly.',
        type: 'SYSTEM',
        link: '/pandit/verification',
      },
    });

    return updated;
  }

  /**
   * Get file stream securely for preview or download
   */
  async getDocumentFile(userId: string, userRole: Role, documentId: string) {
    const document = await this.prisma.panditDocument.findUnique({
      where: { id: documentId },
      include: {
        panditProfile: true,
      },
    });

    if (!document) {
      throw new NotFoundException('Document record not found.');
    }

    // Check authorization: Admin can view any document; Pandit can view only their own
    if (userRole !== Role.ADMIN && document.panditProfile.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view this document.');
    }

    const filePath = path.join(this.uploadDir, document.fileUrl);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Document file not found on disk.');
    }

    const ext = path.extname(document.fileUrl).toLowerCase();
    let mimeType = 'application/octet-stream';
    if (ext === '.pdf') mimeType = 'application/pdf';
    else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
    else if (ext === '.png') mimeType = 'image/png';
    else if (ext === '.webp') mimeType = 'image/webp';

    return {
      filePath,
      mimeType,
      fileName: document.fileUrl,
      documentType: document.documentType,
    };
  }

  /**
   * Get Pandit Dashboard Overview
   */
  async getMyDashboard(userId: string) {
    const profile = await this.prisma.panditProfile.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!profile) {
      throw new NotFoundException('Pandit profile not found.');
    }

    const [
      totalAssigned,
      pendingRequests,
      upcomingPujas,
      completedPujas,
      cancelledPujas,
      recentBookings,
      completedBookingsFee,
    ] = await Promise.all([
      this.prisma.booking.count({ where: { panditProfileId: profile.id } }),
      this.prisma.booking.count({
        where: { panditProfileId: profile.id, status: 'PENDING' },
      }),
      this.prisma.booking.count({
        where: { panditProfileId: profile.id, status: 'CONFIRMED' },
      }),
      this.prisma.booking.count({
        where: { panditProfileId: profile.id, status: 'COMPLETED' },
      }),
      this.prisma.booking.count({
        where: { panditProfileId: profile.id, status: 'CANCELLED' },
      }),
      this.prisma.booking.findMany({
        where: { panditProfileId: profile.id },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          puja: true,
          customerProfile: { include: { user: true } },
          payments: true,
        },
      }),
      this.prisma.booking.findMany({
        where: {
          panditProfileId: profile.id,
          status: { in: ['CONFIRMED', 'COMPLETED'] },
        },
        select: { pujaFee: true },
      }),
    ]);

    const totalEarnings = completedBookingsFee.reduce(
      (sum, b) => sum + Number(b.pujaFee || 0),
      0
    );

    return {
      profile: {
        id: profile.id,
        fullName: profile.fullName,
        avatarUrl: profile.avatarUrl,
        verificationStatus: profile.verificationStatus,
        isAvailable: profile.isAvailable,
        experienceYears: profile.experienceYears,
        city: profile.city,
      },
      stats: {
        totalAssigned,
        pendingRequests,
        upcomingPujas,
        completedPujas,
        cancelledPujas,
        totalEarnings,
      },
      recentBookings,
    };
  }

  /**
   * Get bookings assigned to current Pandit
   */
  async getMyBookings(userId: string, status?: string) {
    const profile = await this.prisma.panditProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Pandit profile not found.');
    }

    const where: any = { panditProfileId: profile.id };
    if (status && status.toUpperCase() !== 'ALL') {
      where.status = status.toUpperCase();
    }

    return this.prisma.booking.findMany({
      where,
      orderBy: { pujaDate: 'asc' },
      include: {
        puja: true,
        customerProfile: {
          include: {
            user: {
              select: { email: true, phoneNumber: true },
            },
          },
        },
        payments: true,
      },
    });
  }

  /**
   * Accept or reject an assigned booking
   */
  async respondToBooking(userId: string, bookingId: string, action: 'ACCEPT' | 'REJECT', reason?: string) {
    const profile = await this.prisma.panditProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Pandit profile not found.');
    }

    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, panditProfileId: profile.id },
    });

    if (!booking) {
      throw new NotFoundException('Assigned booking not found.');
    }

    const newStatus = action === 'ACCEPT' ? 'CONFIRMED' : 'CANCELLED';

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: newStatus as any,
        cancellationReason: action === 'REJECT' ? (reason || 'Rejected by Pandit') : null,
      },
      include: {
        puja: true,
        customerProfile: true,
      },
    });
  }

  /**
   * Toggle Pandit availability status
   */
  async toggleAvailability(userId: string, isAvailable: boolean) {
    const profile = await this.prisma.panditProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Pandit profile not found.');
    }

    return this.prisma.panditProfile.update({
      where: { id: profile.id },
      data: { isAvailable },
    });
  }
}
