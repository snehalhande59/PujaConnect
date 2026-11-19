import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentOrderDto, CashPaymentDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-order')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create Razorpay payment order for a booking' })
  @ApiResponse({ status: 200, description: 'Order created successfully' })
  async createPaymentOrder(@Body() dto: CreatePaymentOrderDto) {
    return this.paymentsService.createPaymentOrder(dto);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify Razorpay payment signature and confirm booking' })
  @ApiResponse({ status: 200, description: 'Payment verified and booking confirmed' })
  async verifyPayment(@Body() dto: VerifyPaymentDto) {
    return this.paymentsService.verifyPayment(dto);
  }

  @Post('cash-after-puja')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm booking with Cash After Puja payment option' })
  @ApiResponse({ status: 200, description: 'Booking confirmed with pending cash payment' })
  async confirmCashAfterPuja(@Body() dto: CashPaymentDto) {
    return this.paymentsService.confirmCashAfterPuja(dto);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Razorpay webhook callback endpoint' })
  async handleWebhook(
    @Body() body: any,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    return this.paymentsService.handleWebhook(body, signature);
  }

  @Get('booking/:bookingId')
  @ApiOperation({ summary: 'Get payment status and records for a booking' })
  async getPaymentForBooking(@Param('bookingId') bookingId: string) {
    return this.paymentsService.getPaymentForBooking(bookingId);
  }
}
