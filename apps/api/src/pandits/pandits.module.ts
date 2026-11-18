import { Module } from '@nestjs/common';
import { PanditsController } from './pandits.controller';
import { PanditsService } from './pandits.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PanditsController],
  providers: [PanditsService],
  exports: [PanditsService],
})
export class PanditsModule {}
