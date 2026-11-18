import { Module } from '@nestjs/common';
import { PujasController } from './pujas.controller';
import { PujasService } from './pujas.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PujasController],
  providers: [PujasService],
  exports: [PujasService],
})
export class PujasModule {}
