import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'System Health Check' })
  async checkHealth() {
    let dbStatus = 'healthy';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'disconnected';
    }

    return {
      status: 'ok',
      service: 'DevSutra API Service',
      version: '2.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: dbStatus,
      smtp: this.mailService.getSmtpStatus(),
    };
  }
}
