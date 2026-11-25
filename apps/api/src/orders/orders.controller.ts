import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';

import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CUSTOMER)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Checkout and place order from cart with payment recording' })
  async createOrder(
    @CurrentUser() user: any,
    @Body() body: { shippingAddressId?: string; paymentDetails?: any; items?: Array<{ productId: string; quantity: number }> },
  ) {
    return this.ordersService.createOrderFromCart(
      user.id,
      body.shippingAddressId,
      body.paymentDetails,
      body.items,
    );
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current customer orders' })
  async getMyOrders(@CurrentUser() user: any) {
    return this.ordersService.getMyOrders(user.id);
  }
}
