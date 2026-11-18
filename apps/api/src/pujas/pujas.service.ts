import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PujasService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params?: { categoryId?: string; search?: string }) {
    const where: Prisma.PujaWhereInput = {
      isActive: true,
      isDeleted: false,
    };

    if (params?.categoryId) {
      where.categoryId = params.categoryId;
    }

    if (params?.search) {
      where.OR = [
        { title: { contains: params.search.trim(), mode: 'insensitive' } },
        { description: { contains: params.search.trim(), mode: 'insensitive' } },
      ];
    }

    return this.prisma.puja.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { title: 'asc' },
    });
  }

  async findByIdOrSlug(idOrSlug: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    
    const puja = await this.prisma.puja.findFirst({
      where: isUuid
        ? { id: idOrSlug, isActive: true, isDeleted: false }
        : { slug: idOrSlug, isActive: true, isDeleted: false },
      include: {
        category: true,
        panditServices: {
          include: {
            panditProfile: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
                experienceYears: true,
                averageRating: true,
                totalReviews: true,
                city: true,
                languages: true,
                verificationStatus: true,
              },
            },
          },
        },
      },
    });

    if (!puja) {
      throw new NotFoundException('Puja ritual not found.');
    }

    return puja;
  }
}
