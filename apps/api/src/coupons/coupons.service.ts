import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all active, currently valid promotional coupons for the Mobile App & Store
   */
  async getActiveCoupons() {
    const now = new Date();

    // If zero coupons exist in database, seed default auspicious festive offers
    const count = await this.prisma.coupon.count();
    if (count === 0) {
      await this.seedDefaultCoupons();
    }

    return this.prisma.coupon.findMany({
      where: {
        isActive: true,
        validUntil: { gte: now },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        code: true,
        discountPct: true,
        discountAmount: true,
        minSpend: true,
        maxDiscount: true,
        validFrom: true,
        validUntil: true,
      },
    });
  }

  /**
   * Validate a coupon code for a given booking or cart amount
   */
  async validateCoupon(code: string, amount: number) {
    if (!code || !code.trim()) {
      throw new BadRequestException('Coupon code is required.');
    }

    const cleanCode = code.trim().toUpperCase();
    const now = new Date();

    const coupon = await this.prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (!coupon) {
      throw new NotFoundException(`Coupon '${cleanCode}' is invalid or does not exist.`);
    }

    if (!coupon.isActive) {
      throw new BadRequestException(`Coupon '${cleanCode}' is currently inactive.`);
    }

    if (coupon.validFrom && new Date(coupon.validFrom) > now) {
      throw new BadRequestException(`Coupon '${cleanCode}' is not yet active.`);
    }

    if (coupon.validUntil && new Date(coupon.validUntil) < now) {
      throw new BadRequestException(`Coupon '${cleanCode}' has expired.`);
    }

    if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) {
      throw new BadRequestException(`Coupon '${cleanCode}' usage limit has been reached.`);
    }

    const minSpend = Number(coupon.minSpend || 0);
    if (amount < minSpend) {
      throw new BadRequestException(
        `Coupon '${cleanCode}' requires a minimum booking amount of ₹${minSpend}. (Current: ₹${amount})`,
      );
    }

    let calculatedDiscount = 0;
    if (coupon.discountAmount && Number(coupon.discountAmount) > 0) {
      calculatedDiscount = Number(coupon.discountAmount);
    } else if (coupon.discountPct && Number(coupon.discountPct) > 0) {
      calculatedDiscount = (amount * Number(coupon.discountPct)) / 100;
      if (coupon.maxDiscount && Number(coupon.maxDiscount) > 0) {
        calculatedDiscount = Math.min(calculatedDiscount, Number(coupon.maxDiscount));
      }
    }

    calculatedDiscount = Math.min(calculatedDiscount, amount);
    const finalAmount = Math.max(0, amount - calculatedDiscount);

    return {
      valid: true,
      code: coupon.code,
      discountAmount: Math.round(calculatedDiscount),
      finalAmount: Math.round(finalAmount),
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountPct: coupon.discountPct ? Number(coupon.discountPct) : null,
        discountAmount: coupon.discountAmount ? Number(coupon.discountAmount) : null,
        minSpend: coupon.minSpend ? Number(coupon.minSpend) : null,
      },
    };
  }

  private async seedDefaultCoupons() {
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

    const initialCoupons = [
      {
        code: 'SHUBHARAMBH',
        discountAmount: 501,
        minSpend: 2000,
        validFrom: new Date(),
        validUntil: oneYearLater,
        isActive: true,
      },
      {
        code: 'VEDIC10',
        discountPct: 10,
        maxDiscount: 1000,
        minSpend: 1500,
        validFrom: new Date(),
        validUntil: oneYearLater,
        isActive: true,
      },
      {
        code: 'FESTIVE250',
        discountAmount: 251,
        minSpend: 1000,
        validFrom: new Date(),
        validUntil: oneYearLater,
        isActive: true,
      },
    ];

    for (const c of initialCoupons) {
      await this.prisma.coupon.create({ data: c }).catch(() => null);
    }
  }
}
