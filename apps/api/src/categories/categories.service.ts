import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.pujaCategory.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
      include: {
        _count: {
          select: { pujas: true },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.pujaCategory.findUnique({
      where: { slug },
      include: {
        pujas: {
          where: { isActive: true, isDeleted: false },
        },
      },
    });
  }
}
