import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';

import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RejectPanditDto } from './dto/reject-pandit.dto';
import { QueryPanditsDto } from './dto/query-pandits.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ==========================================
  // DASHBOARD OVERVIEW STATS
  // ==========================================

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get complete platform overview statistics from real database' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // ==========================================
  // PANDIT MANAGEMENT
  // ==========================================

  @Get('pandits/stats')
  @ApiOperation({ summary: 'Get Pandit verification analytics and counts' })
  async getPanditStats() {
    return this.adminService.getPanditStats();
  }

  @Get('pandits')
  @ApiOperation({ summary: 'Get paginated list of Pandits with filters' })
  async getPandits(@Query() query: QueryPanditsDto) {
    return this.adminService.getPandits(query);
  }

  @Get('pandits/pending')
  @ApiOperation({ summary: 'Get all pending Pandit applications' })
  async getPendingPandits() {
    return this.adminService.getPendingPandits();
  }

  @Get('pandits/:id')
  @ApiOperation({ summary: 'Get full Pandit details and documents' })
  async getPanditDetails(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.getPanditDetails(id);
  }

  @Patch('pandits/:id/verify')
  @ApiOperation({ summary: 'Approve and verify a Pandit' })
  async verifyPandit(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.verifyPandit(id);
  }

  @Patch('pandits/:id/reject')
  @ApiOperation({ summary: 'Reject a Pandit application' })
  async rejectPandit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectPanditDto,
  ) {
    return this.adminService.rejectPandit(id, dto.reason);
  }

  // ==========================================
  // CUSTOMER MANAGEMENT
  // ==========================================

  @Get('customers')
  @ApiOperation({ summary: 'Get registered customers with booking count' })
  async getCustomers(@Query() query: any) {
    return this.adminService.getCustomers(query);
  }

  // ==========================================
  // BOOKINGS MANAGEMENT
  // ==========================================

  @Get('bookings')
  @ApiOperation({ summary: 'Get all bookings across the platform' })
  async getBookings(@Query() query: any) {
    return this.adminService.getBookings(query);
  }

  @Patch('bookings/:id/status')
  @ApiOperation({ summary: 'Update status of a booking' })
  async updateBookingStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.adminService.updateBookingStatus(id, status);
  }

  @Patch('bookings/:id/assign-pandit')
  @ApiOperation({ summary: 'Assign or reassign a Pandit to a booking' })
  async assignPandit(
    @Param('id') id: string,
    @Body('panditProfileId') panditProfileId: string,
  ) {
    return this.adminService.assignPandit(id, panditProfileId);
  }

  // ==========================================
  // PAYMENT MANAGEMENT
  // ==========================================

  @Get('payments')
  @ApiOperation({ summary: 'Get all payment transactions' })
  async getPayments(@Query() query: any) {
    return this.adminService.getPayments(query);
  }

  // ==========================================
  // PUJA SERVICES MANAGEMENT
  // ==========================================

  @Get('pujas')
  @ApiOperation({ summary: 'Get all Pujas with category' })
  async getPujas(@Query() query: any) {
    return this.adminService.getPujas(query);
  }

  @Post('pujas')
  @ApiOperation({ summary: 'Create a new Puja service' })
  async createPuja(@Body() data: any) {
    return this.adminService.createPuja(data);
  }

  @Patch('pujas/:id')
  @ApiOperation({ summary: 'Update a Puja service' })
  async updatePuja(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updatePuja(id, data);
  }

  // ==========================================
  // REPORTS & ANALYTICS
  // ==========================================

  @Get('reports')
  @ApiOperation({ summary: 'Get system analytics and reports' })
  async getReports() {
    return this.adminService.getReports();
  }
}
