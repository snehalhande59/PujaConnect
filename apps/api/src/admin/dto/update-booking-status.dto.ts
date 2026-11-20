import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BookingStatus } from '@prisma/client';

export class UpdateBookingStatusDto {
  @ApiProperty({
    description: 'Target booking status',
    enum: BookingStatus,
    example: BookingStatus.CONFIRMED,
  })
  @IsEnum(BookingStatus, { message: 'Invalid booking status provided' })
  @IsNotEmpty({ message: 'status is required' })
  status: BookingStatus;

  @ApiPropertyOptional({
    description: 'Reason for status update (mandatory if CANCELLED or REJECTED)',
    example: 'Devotee requested rescheduling due to family travel',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
