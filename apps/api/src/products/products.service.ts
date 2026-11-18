import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params?: { category?: string; search?: string }) {
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      isDeleted: false,
    };

    if (params?.category && params.category !== 'All Categories') {
      where.category = params.category;
    }

    if (params?.search) {
      where.OR = [
        { name: { contains: params.search.trim(), mode: 'insensitive' } },
        { description: { contains: params.search.trim(), mode: 'insensitive' } },
      ];
    }

    return this.prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByIdOrSlug(idOrSlug: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

    const product = await this.prisma.product.findFirst({
      where: isUuid
        ? { id: idOrSlug, isActive: true, isDeleted: false }
        : { slug: idOrSlug, isActive: true, isDeleted: false },
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    return product;
  }
}
