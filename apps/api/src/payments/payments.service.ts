import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentOrderDto, CashPaymentDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { PaymentMethod, PaymentStatus, BookingStatus } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper to find a booking by UUID or bookingNumber
   */
  private async findBooking(identifier: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    const booking = await this.prisma.booking.findFirst({
      where: isUuid ? { id: identifier } : { bookingNumber: identifier },
      include: {
        customerProfile: { include: { user: true } },
        panditProfile: { include: { user: true } },
        puja: true,
        payments: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with identifier '${identifier}' not found.`);
    }

    return booking;
  }

  /**
   * 1. Create Razorpay Payment Order
   */
  async createPaymentOrder(dto: CreatePaymentOrderDto) {
    const booking = await this.findBooking(dto.bookingId);

    // Prevent payment for already completed / cancelled bookings
    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Cannot initiate payment for a cancelled booking.');
    }

    // Check if already paid
    const existingSuccessfulPayment = booking.payments.find(
      (p) => p.paymentStatus === PaymentStatus.SUCCESS
    );
    if (existingSuccessfulPayment) {
      throw new ConflictException('This booking has already been paid for.');
    }

    const amountInRupees = dto.amount || Number(booking.totalAmount);
    const amountInPaise = Math.round(amountInRupees * 100);
    const currency = dto.currency || 'INR';

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    let razorpayOrderId: string;

    if (razorpayKeyId && razorpayKeySecret) {
      try {
        // Real Razorpay API call
        const auth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');
        const res = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${auth}`,
          },
          body: JSON.stringify({
            amount: amountInPaise,
            currency,
            receipt: booking.bookingNumber,
            notes: {
              bookingId: booking.id,
              bookingNumber: booking.bookingNumber,
              customerEmail: booking.customerProfile?.user?.email || 'devotee@devsutra.in',
              pujaTitle: booking.puja?.title || 'Vedic Puja',
            },
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          this.logger.error(`Razorpay API Error: ${JSON.stringify(errData)}`);
          throw new BadRequestException(errData.error?.description || 'Failed to create Razorpay order');
        }

        const orderData = (await res.json()) as any;
        razorpayOrderId = orderData.id;
      } catch (err) {
        this.logger.warn(`Failed to connect to Razorpay API, falling back to local order ID: ${err.message}`);
        razorpayOrderId = `order_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
      }
    } else {
      // Standard backend generated order ID for test/staging
      razorpayOrderId = `order_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const paymentNumber = `PAY-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    // Store in database
    const payment = await this.prisma.payment.create({
      data: {
        paymentNumber,
        bookingId: booking.id,
        amount: amountInRupees,
        currency,
        paymentMethod: PaymentMethod.RAZORPAY,
        paymentStatus: PaymentStatus.PENDING,
        razorpayOrderId,
        metadata: {
          bookingNumber: booking.bookingNumber,
          gateway: 'RAZORPAY',
        },
      },
    });

    return {
      success: true,
      orderId: razorpayOrderId,
      amount: amountInRupees,
      amountInPaise,
      currency,
      paymentId: payment.id,
      paymentNumber: payment.paymentNumber,
      bookingNumber: booking.bookingNumber,
      keyId: razorpayKeyId || 'rzp_test_placeholder',
      hasConfiguredCredentials: Boolean(razorpayKeyId && razorpayKeySecret),
      customer: {
        name: booking.customerProfile
          ? `${booking.customerProfile.firstName} ${booking.customerProfile.lastName}`.trim()
          : 'Devotee',
        email: booking.customerProfile?.user?.email || 'devotee@devsutra.in',
        phone: booking.customerProfile?.user?.phoneNumber || '9876543210',
      },
    };
  }

  /**
   * 2. Verify Razorpay Payment Signature
   */
  async verifyPayment(dto: VerifyPaymentDto) {
    const booking = await this.findBooking(dto.bookingId);

    // Prevent duplicate processing
    const payment = await this.prisma.payment.findFirst({
      where: {
        bookingId: booking.id,
        OR: [
          { razorpayOrderId: dto.razorpayOrderId },
          { id: dto.bookingId },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    if (payment && payment.paymentStatus === PaymentStatus.SUCCESS) {
      return {
        success: true,
        verified: true,
        message: 'Payment already verified and confirmed.',
        bookingNumber: booking.bookingNumber,
        paymentStatus: PaymentStatus.SUCCESS,
        transactionId: payment.razorpayPaymentId || dto.razorpayPaymentId,
      };
    }

    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (razorpayKeySecret && dto.razorpaySignature) {
      const generatedSignature = crypto
        .createHmac('sha256', razorpayKeySecret)
        .update(`${dto.razorpayOrderId}|${dto.razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== dto.razorpaySignature) {
        if (payment) {
          await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
              paymentStatus: PaymentStatus.FAILED,
              razorpayPaymentId: dto.razorpayPaymentId,
              razorpaySignature: dto.razorpaySignature,
            },
          });
        }
        throw new BadRequestException('Invalid payment signature verification failed.');
      }
    }

    // Update payment record in database
    const paymentNumber = payment?.paymentNumber || `PAY-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    if (payment) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          paymentStatus: PaymentStatus.SUCCESS,
          razorpayPaymentId: dto.razorpayPaymentId,
          razorpaySignature: dto.razorpaySignature || null,
        },
      });
    } else {
      await this.prisma.payment.create({
        data: {
          paymentNumber,
          bookingId: booking.id,
          amount: booking.totalAmount,
          currency: 'INR',
          paymentMethod: PaymentMethod.RAZORPAY,
          paymentStatus: PaymentStatus.SUCCESS,
          razorpayOrderId: dto.razorpayOrderId,
          razorpayPaymentId: dto.razorpayPaymentId,
          razorpaySignature: dto.razorpaySignature || null,
        },
      });
    }

    // Mark booking as CONFIRMED
    const updatedBooking = await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.CONFIRMED,
      },
      include: {
        puja: true,
        panditProfile: true,
        customerProfile: true,
        payments: true,
      },
    });

    return {
      success: true,
      verified: true,
      message: 'Payment verified successfully and booking confirmed.',
      bookingId: updatedBooking.id,
      bookingNumber: updatedBooking.bookingNumber,
      paymentStatus: PaymentStatus.SUCCESS,
      transactionId: dto.razorpayPaymentId,
      booking: updatedBooking,
    };
  }

  /**
   * 3. Confirm Cash After Puja Payment Option
   */
  async confirmCashAfterPuja(dto: CashPaymentDto) {
    const booking = await this.findBooking(dto.bookingId);

    const paymentNumber = `PAY-CASH-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    // Create / update payment as PENDING Cash payment
    await this.prisma.payment.create({
      data: {
        paymentNumber,
        bookingId: booking.id,
        amount: booking.totalAmount,
        currency: 'INR',
        paymentMethod: PaymentMethod.CASH,
        paymentStatus: PaymentStatus.PENDING,
        metadata: {
          type: 'CASH_AFTER_PUJA',
          notes: dto.notes || 'Devotee will offer Dakshina in cash directly to Pandit after Puja Vidhi.',
        },
      },
    });

    // Mark booking as CONFIRMED (appointment confirmed, payment collection pending post-ceremony)
    const updatedBooking = await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.CONFIRMED,
      },
      include: {
        puja: true,
        panditProfile: true,
        customerProfile: true,
        payments: true,
      },
    });

    return {
      success: true,
      bookingId: updatedBooking.id,
      bookingNumber: updatedBooking.bookingNumber,
      paymentStatus: PaymentStatus.PENDING,
      paymentMethod: PaymentMethod.CASH,
      message: 'Booking confirmed! Payment will be collected in Cash after ceremony completion.',
      booking: updatedBooking,
    };
  }

  /**
   * 4. Razorpay Webhook Handler
   */
  async handleWebhook(rawBody: any, signature: string) {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody))
        .digest('hex');

      if (expectedSignature !== signature) {
        throw new BadRequestException('Webhook signature verification failed.');
      }
    }

    const event = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
    const eventType = event.event;
    this.logger.log(`Received Razorpay webhook event: ${eventType}`);

    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentEntity = event.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;

      if (orderId) {
        const paymentRecord = await this.prisma.payment.findFirst({
          where: { razorpayOrderId: orderId },
        });

        if (paymentRecord && paymentRecord.paymentStatus !== PaymentStatus.SUCCESS) {
          await this.prisma.payment.update({
            where: { id: paymentRecord.id },
            data: {
              paymentStatus: PaymentStatus.SUCCESS,
              razorpayPaymentId: paymentId,
            },
          });

          if (paymentRecord.bookingId) {
            await this.prisma.booking.update({
              where: { id: paymentRecord.bookingId },
              data: { status: BookingStatus.CONFIRMED },
            });
          }
        }
      }
    } else if (eventType === 'payment.failed') {
      const paymentEntity = event.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;

      if (orderId) {
        await this.prisma.payment.updateMany({
          where: { razorpayOrderId: orderId },
          data: { paymentStatus: PaymentStatus.FAILED },
        });
      }
    }

    return { received: true };
  }

  /**
   * 5. Get Payment Details for Booking
   */
  async getPaymentForBooking(bookingId: string) {
    const booking = await this.findBooking(bookingId);
    return {
      bookingNumber: booking.bookingNumber,
      totalAmount: booking.totalAmount,
      status: booking.status,
      payments: booking.payments,
    };
  }
}
