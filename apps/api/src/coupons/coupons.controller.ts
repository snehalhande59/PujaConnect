import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';

@ApiTags('Coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get('active')
  @ApiOperation({ summary: 'Get active promotional coupons for mobile app and web' })
  async getActiveCoupons() {
    return this.couponsService.getActiveCoupons();
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate a coupon code and return discount amount' })
  async validateCoupon(@Body() body: { code: string; amount?: number; bookingAmount?: number }) {
    const amount = Number(body.amount ?? body.bookingAmount) || 0;
    return this.couponsService.validateCoupon(body.code, amount);
  }
}
