import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  private async getOrCreateCart(userId: string) {
    let customer = await this.prisma.customerProfile.findUnique({ where: { userId } });
    if (!customer) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      customer = await this.prisma.customerProfile.create({
        data: {
          userId,
          firstName: user?.email.split('@')[0] || 'Devotee',
          lastName: '',
        },
      });
    }

    let cart = await this.prisma.cart.findUnique({
      where: { customerProfileId: customer.id },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { customerProfileId: customer.id },
      });
    }

    return cart;
  }

  async getCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    const items = await this.prisma.cartItem.findMany({
      where: { cartId: cart.id },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });

    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.product.discountPrice || item.product.price) * item.quantity,
      0,
    );

    return {
      cartId: cart.id,
      items,
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
    };
  }

  async addItem(userId: string, productId: string, quantity: number = 1) {
    if (quantity <= 0) throw new BadRequestException('Quantity must be greater than 0');

    const cart = await this.getOrCreateCart(userId);
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive || product.isDeleted) {
      throw new NotFoundException('Product not found or unavailable.');
    }

    const existingItem = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    return this.getCart(userId);
  }

  async updateItemQuantity(userId: string, cartItemId: string, quantity: number) {
    const cart = await this.getOrCreateCart(userId);
    const item = await this.prisma.cartItem.findUnique({ where: { id: cartItemId } });
    if (!item || item.cartId !== cart.id) {
      throw new NotFoundException('Cart item not found.');
    }

    if (quantity <= 0) {
      await this.prisma.cartItem.delete({ where: { id: cartItemId } });
    } else {
      await this.prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity },
      });
    }

    return this.getCart(userId);
  }

  async removeItem(userId: string, cartItemId: string) {
    const cart = await this.getOrCreateCart(userId);
    const item = await this.prisma.cartItem.findUnique({ where: { id: cartItemId } });
    if (!item || item.cartId !== cart.id) {
      throw new NotFoundException('Cart item not found.');
    }

    await this.prisma.cartItem.delete({ where: { id: cartItemId } });
    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return { success: true, message: 'Cart cleared.' };
  }
}
