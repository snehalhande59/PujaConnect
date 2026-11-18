import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';

import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @Roles(Role.CUSTOMER)
  @ApiOperation({ summary: 'Create a new Puja booking' })
  async createBooking(@CurrentUser() user: any, @Body() dto: CreateBookingDto) {
    return this.bookingsService.createBooking(user.id, dto);
  }

  @Get('my')
  @Roles(Role.CUSTOMER)
  @ApiOperation({ summary: 'Get current customer bookings' })
  async getMyCustomerBookings(@CurrentUser() user: any) {
    return this.bookingsService.getMyCustomerBookings(user.id);
  }

  @Get('pandit')
  @Roles(Role.PANDIT)
  @ApiOperation({ summary: 'Get bookings assigned to current Pandit' })
  async getMyPanditBookings(@CurrentUser() user: any) {
    return this.bookingsService.getMyPanditBookings(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking details by ID' })
  async getBookingDetails(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.bookingsService.getBookingDetails(user.id, user.role, id);
  }

  @Patch(':id/accept')
  @Roles(Role.PANDIT)
  @ApiOperation({ summary: 'Pandit accepts booking request' })
  async acceptBooking(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.bookingsService.acceptBooking(user.id, id);
  }

  @Patch(':id/reject')
  @Roles(Role.PANDIT)
  @ApiOperation({ summary: 'Pandit declines booking request' })
  async rejectBooking(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason?: string,
  ) {
    return this.bookingsService.rejectBooking(user.id, id, reason);
  }

  @Patch(':id/cancel')
  @Roles(Role.CUSTOMER)
  @ApiOperation({ summary: 'Customer cancels booking' })
  async cancelBooking(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason?: string,
  ) {
    return this.bookingsService.cancelBooking(user.id, id, reason);
  }
}
