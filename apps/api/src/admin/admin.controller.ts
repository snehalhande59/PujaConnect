import {
  Controller,
  Get,
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
}
