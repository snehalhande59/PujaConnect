import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';

import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CUSTOMER)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current customer profile with addresses' })
  async getProfile(@CurrentUser() user: any) {
    return this.customersService.getProfile(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update customer profile' })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() body: { firstName?: string; lastName?: string; city?: string; state?: string },
  ) {
    return this.customersService.updateProfile(user.id, body);
  }

  @Get('addresses')
  @ApiOperation({ summary: 'Get saved customer addresses' })
  async getAddresses(@CurrentUser() user: any) {
    return this.customersService.getAddresses(user.id);
  }

  @Post('addresses')
  @ApiOperation({ summary: 'Add a new delivery / puja address' })
  async addAddress(
    @CurrentUser() user: any,
    @Body() body: {
      fullName: string;
      phoneNumber: string;
      addressLine1: string;
      addressLine2?: string;
      landmark?: string;
      city: string;
      state: string;
      pincode: string;
      isDefault?: boolean;
    },
  ) {
    return this.customersService.addAddress(user.id, body);
  }

  @Delete('addresses/:id')
  @ApiOperation({ summary: 'Delete a saved address' })
  async deleteAddress(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.customersService.deleteAddress(user.id, id);
  }
}
