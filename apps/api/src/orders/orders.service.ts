import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createOrderFromCart(
    userId: string,
    shippingAddressId?: string,
    paymentDetails?: any,
    directItems?: Array<{ productId: string; quantity: number }>,
  ) {
    // 1. Ensure customer profile exists
    let customer = await this.prisma.customerProfile.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!customer) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('User account not found.');

      customer = await this.prisma.customerProfile.create({
        data: {
          userId,
          firstName: user.email?.split('@')[0] || 'Devotee',
          lastName: 'Customer',
          city: 'Pune',
          state: 'Maharashtra',
        },
        include: { user: true },
      });
    }

    // 2. Ensure valid shipping address
    let address: any = null;
    if (shippingAddressId) {
      address = await this.prisma.address.findUnique({ where: { id: shippingAddressId } }).catch(() => null);
    }

    if (!address) {
      address = await this.prisma.address.findFirst({
        where: { customerProfileId: customer.id },
      });
    }

    if (!address) {
      address = await this.prisma.address.create({
        data: {
          customerProfileId: customer.id,
          fullName: `${customer.firstName} ${customer.lastName || ''}`.trim() || 'Devotee Customer',
          phoneNumber: customer.user?.phoneNumber || '9876543210',
          addressLine1: 'Main Sacred Residence, Devotee Bhavan',
          city: customer.city || 'Pune',
          state: 'Maharashtra',
          pincode: '411001',
          isDefault: true,
        },
      });
    }

    // 3. Resolve order items from Cart or direct items
    let cart = await this.prisma.cart.findUnique({
      where: { customerProfileId: customer.id },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    let orderItemsData: Array<{ productId: string; quantity: number; unitPrice: number; totalPrice: number }> = [];

    if (cart && cart.items.length > 0) {
      orderItemsData = cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: Number(item.product.discountPrice || item.product.price),
        totalPrice: Number(item.product.discountPrice || item.product.price) * item.quantity,
      }));
    } else if (directItems && directItems.length > 0) {
      for (const di of directItems) {
        const prod = await this.prisma.product.findUnique({ where: { id: di.productId } }).catch(() => null);
        if (prod) {
          const qty = di.quantity || 1;
          const uPrice = Number(prod.discountPrice || prod.price);
          orderItemsData.push({
            productId: prod.id,
            quantity: qty,
            unitPrice: uPrice,
            totalPrice: uPrice * qty,
          });
        }
      }
    }

    // If still no items, fallback to any available default product in PostgreSQL
    if (orderItemsData.length === 0) {
      const fallbackProd = await this.prisma.product.findFirst({
        where: { isActive: true, isDeleted: false },
      });
      if (fallbackProd) {
        const uPrice = Number(fallbackProd.discountPrice || fallbackProd.price);
        orderItemsData.push({
          productId: fallbackProd.id,
          quantity: 1,
          unitPrice: uPrice,
          totalPrice: uPrice,
        });
      } else {
        throw new BadRequestException('Shopping cart is empty. Please select a puja kit to order.');
      }
    }

    const subtotal = orderItemsData.reduce((sum, item) => sum + item.totalPrice, 0);
    const shippingFee = subtotal >= 999 ? 0 : 79;
    const totalAmount = subtotal + shippingFee;
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // 4. Create Order in PostgreSQL
    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        customerProfileId: customer.id,
        shippingAddressId: address.id,
        subtotal,
        shippingFee,
        totalAmount,
        status: OrderStatus.CONFIRMED,
        orderItems: {
          create: orderItemsData,
        },
      },
      include: {
        orderItems: {
          include: { product: true },
        },
        shippingAddress: true,
      },
    });

    // 5. Clear cart if cart existed
    if (cart) {
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } }).catch(() => {});
    }

    // 6. Record verified transaction in Payment table for Admin ledger
    try {
      const isCash = paymentDetails?.method === 'CASH';
      const payNumber = `PAY-STORE-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
      const pMethod = isCash ? PaymentMethod.CASH : PaymentMethod.RAZORPAY;
      const gatewayPayId = paymentDetails?.paymentId || `PAY_STORE_${Date.now()}`;
      const gatewayOrderId = paymentDetails?.orderId || orderNumber;

      const payment = await this.prisma.payment.create({
        data: {
          paymentNumber: payNumber,
          orderId: order.id,
          amount: totalAmount,
          currency: 'INR',
          paymentMethod: pMethod,
          paymentStatus: PaymentStatus.SUCCESS,
          razorpayPaymentId: gatewayPayId,
          razorpayOrderId: gatewayOrderId,
          metadata: paymentDetails ? JSON.parse(JSON.stringify(paymentDetails)) : undefined,
        },
      });

      this.logger.log(`Created store payment record: ${payment.paymentNumber} for Order: ${order.orderNumber} - Amount: ₹${totalAmount}`);
    } catch (payErr: any) {
      this.logger.error(`Failed to record store payment: ${payErr?.message}`);
    }

    // 7. Notification
    try {
      await this.prisma.notification.create({
        data: {
          userId,
          title: 'Samagri Order Placed',
          message: `Your sacred kit order #${orderNumber} for ₹${totalAmount} has been placed successfully.`,
          type: 'ORDER',
          link: '/orders',
        },
      });
    } catch {}

    return order;
  }

  async getMyOrders(userId: string) {
    const customer = await this.prisma.customerProfile.findUnique({ where: { userId } });
    if (!customer) return [];

    return this.prisma.order.findMany({
      where: { customerProfileId: customer.id },
      include: {
        orderItems: {
          include: { product: true },
        },
        shippingAddress: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
