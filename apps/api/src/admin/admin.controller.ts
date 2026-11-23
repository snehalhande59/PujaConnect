import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
import { CreatePanditDto } from './dto/create-pandit.dto';
import { UpdatePanditDto } from './dto/update-pandit.dto';
import { ReassignBookingDto } from './dto/reassign-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

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

  @Post('pandits')
  @ApiOperation({ summary: 'Admin directly adds a new verified Pandit' })
  async createPandit(@Body() dto: CreatePanditDto) {
    return this.adminService.createPandit(dto);
  }

  @Patch('pandits/:id')
  @ApiOperation({ summary: 'Admin edits Pandit profile and status' })
  async updatePandit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePanditDto,
  ) {
    return this.adminService.updatePandit(id, dto);
  }

  @Delete('pandits/:id')
  @ApiOperation({ summary: 'Admin deactivates/deletes a Pandit' })
  async deletePandit(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deletePandit(id);
  }

  @Get('pandits/:id/bookings')
  @ApiOperation({ summary: 'Admin views full booking history for a Pandit' })
  async getPanditBookings(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.getPanditBookings(id);
  }

  // ==========================================
  // CUSTOMER MANAGEMENT
  // ==========================================

  @Get('customers')
  @ApiOperation({ summary: 'Get registered customers with booking count' })
  async getCustomers(@Query() query: any) {
    return this.adminService.getCustomers(query);
  }

  @Get('customers/:id')
  @ApiOperation({ summary: 'Get single customer details, bookings, and addresses' })
  async getCustomerDetails(@Param('id') id: string) {
    return this.adminService.getCustomerDetails(id);
  }

  @Patch('customers/:id')
  @ApiOperation({ summary: 'Update customer details and active status' })
  async updateCustomer(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.adminService.updateCustomer(id, dto);
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
  @ApiOperation({ summary: 'Update status of a booking with audit log' })
  async updateBookingStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.adminService.updateBookingStatus(id, dto.status, dto.reason);
  }

  @Patch('bookings/:id/reassign')
  @ApiOperation({ summary: 'Reassign Pandit to booking with slot conflict validation and audit' })
  async reassignPandit(
    @Param('id') id: string,
    @Body() dto: ReassignBookingDto,
  ) {
    return this.adminService.reassignPandit(id, dto.newPanditProfileId, dto.reason);
  }

  @Patch('bookings/:id/assign-pandit')
  @ApiOperation({ summary: 'Assign or reassign a Pandit to a booking (alias)' })
  async assignPandit(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const newPanditId = body.panditProfileId || body.newPanditProfileId;
    return this.adminService.reassignPandit(id, newPanditId, body.reason);
  }

  @Get('bookings/:id/history')
  @ApiOperation({ summary: 'Get booking status and reassignment audit history' })
  async getBookingAuditHistory(@Param('id') id: string) {
    return this.adminService.getBookingAuditHistory(id);
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

  @Post('catalog/initialize')
  @ApiOperation({ summary: 'Admin manually initializes default Puja catalog and categories' })
  async initializeCatalog() {
    await this.adminService.ensureDefaultCatalogAndBookings();
    return this.adminService.getDashboardStats();
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

  // ==========================================
  // CATEGORIES MANAGEMENT
  // ==========================================

  @Get('categories')
  @ApiOperation({ summary: 'Get all puja categories' })
  async getCategories(@Query() query: any) {
    return this.adminService.getCategories(query);
  }

  @Post('categories')
  @ApiOperation({ summary: 'Create a new puja category' })
  async createCategory(@Body() data: any) {
    return this.adminService.createCategory(data);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update a puja category' })
  async updateCategory(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateCategory(id, data);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete a puja category' })
  async deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(id);
  }

  // ==========================================
  // PRODUCTS / SAMAGRI MANAGEMENT
  // ==========================================

  @Get('products')
  @ApiOperation({ summary: 'Get samagri products' })
  async getProducts(@Query() query: any) {
    return this.adminService.getProducts(query);
  }

  @Post('products')
  @ApiOperation({ summary: 'Create a new samagri product' })
  async createProduct(@Body() data: any) {
    return this.adminService.createProduct(data);
  }

  @Patch('products/:id')
  @ApiOperation({ summary: 'Update product details and stock' })
  async updateProduct(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateProduct(id, data);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Soft-delete a product' })
  async deleteProduct(@Param('id') id: string) {
    return this.adminService.deleteProduct(id);
  }

  // ==========================================
  // ORDERS MANAGEMENT
  // ==========================================

  @Get('orders')
  @ApiOperation({ summary: 'Get all e-commerce customer orders' })
  async getOrders(@Query() query: any) {
    return this.adminService.getOrders(query);
  }

  @Patch('orders/:id/status')
  @ApiOperation({ summary: 'Update order status' })
  async updateOrderStatus(@Param('id') id: string, @Body('status') status: any) {
    return this.adminService.updateOrderStatus(id, status);
  }

  @Patch('orders/:id/tracking')
  @ApiOperation({ summary: 'Update courier tracking number' })
  async updateOrderTracking(@Param('id') id: string, @Body('trackingNumber') trackingNumber: string) {
    return this.adminService.updateOrderTracking(id, trackingNumber);
  }

  // ==========================================
  // REVIEWS MANAGEMENT
  // ==========================================

  @Get('reviews')
  @ApiOperation({ summary: 'Get all customer reviews' })
  async getReviews(@Query() query: any) {
    return this.adminService.getReviews(query);
  }

  @Patch('reviews/:id/publish')
  @ApiOperation({ summary: 'Toggle review published state' })
  async toggleReviewPublish(@Param('id') id: string, @Body('isPublished') isPublished: boolean) {
    return this.adminService.toggleReviewPublish(id, isPublished);
  }

  @Delete('reviews/:id')
  @ApiOperation({ summary: 'Delete inappropriate review' })
  async deleteReview(@Param('id') id: string) {
    return this.adminService.deleteReview(id);
  }

  // ==========================================
  // SUPPORT TICKETS DESK
  // ==========================================

  @Get('support/tickets')
  @ApiOperation({ summary: 'Get all support tickets' })
  async getSupportTickets(@Query() query: any) {
    return this.adminService.getSupportTickets(query);
  }

  @Patch('support/tickets/:id')
  @ApiOperation({ summary: 'Update support ticket status or priority' })
  async updateSupportTicket(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateSupportTicket(id, data);
  }

  // ==========================================
  // COUPONS MANAGEMENT
  // ==========================================

  @Get('coupons')
  @ApiOperation({ summary: 'Get all promotional coupons' })
  async getCoupons() {
    return this.adminService.getCoupons();
  }

  @Post('coupons')
  @ApiOperation({ summary: 'Create a new coupon' })
  async createCoupon(@Body() data: any) {
    return this.adminService.createCoupon(data);
  }

  @Patch('coupons/:id')
  @ApiOperation({ summary: 'Update a coupon' })
  async updateCoupon(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateCoupon(id, data);
  }

  @Delete('coupons/:id')
  @ApiOperation({ summary: 'Delete a coupon' })
  async deleteCoupon(@Param('id') id: string) {
    return this.adminService.deleteCoupon(id);
  }
}
