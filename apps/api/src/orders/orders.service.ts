import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrderFromCart(userId: string, shippingAddressId: string) {
    const customer = await this.prisma.customerProfile.findUnique({ where: { userId } });
    if (!customer) throw new NotFoundException('Customer profile not found.');

    const address = await this.prisma.address.findUnique({ where: { id: shippingAddressId } });
    if (!address || address.customerProfileId !== customer.id) {
      throw new NotFoundException('Shipping address not found.');
    }

    const cart = await this.prisma.cart.findUnique({
      where: { customerProfileId: customer.id },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Shopping cart is empty.');
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.product.discountPrice || item.product.price) * item.quantity,
      0,
    );
    const shippingFee = subtotal >= 999 ? 0 : 79;
    const totalAmount = subtotal + shippingFee;
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        customerProfileId: customer.id,
        shippingAddressId,
        subtotal,
        shippingFee,
        totalAmount,
        status: OrderStatus.CONFIRMED,
        orderItems: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: Number(item.product.discountPrice || item.product.price),
            totalPrice: Number(item.product.discountPrice || item.product.price) * item.quantity,
          })),
        },
      },
      include: {
        orderItems: {
          include: { product: true },
        },
        shippingAddress: true,
      },
    });

    // Clear cart after checkout
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    // Notification
    await this.prisma.notification.create({
      data: {
        userId,
        title: 'Samagri Order Placed',
        message: `Your order #${orderNumber} for ₹${totalAmount} has been placed successfully.`,
        type: 'ORDER',
        link: '/orders',
      },
    });

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
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
