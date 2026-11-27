import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('PostgreSQL database connected successfully via Prisma');

      // Ensure critical tables exist gracefully
      try {
        await this.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "BookingStatusHistory" (
            "id" TEXT NOT NULL,
            "bookingId" TEXT NOT NULL,
            "fromStatus" "BookingStatus",
            "toStatus" "BookingStatus" NOT NULL,
            "action" TEXT NOT NULL,
            "changedBy" TEXT NOT NULL,
            "reason" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "BookingStatusHistory_pkey" PRIMARY KEY ("id")
          );
        `);
      } catch (sqlErr: any) {
        this.logger.warn(`Notice initializing BookingStatusHistory table: ${sqlErr?.message || sqlErr}`);
      }
    } catch (err: any) {
      this.logger.warn(`PostgreSQL connection postponed or pending database setup: ${err.message}`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
