import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsBoolean,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ description: 'Puja ID or slug to book' })
  @IsString()
  @IsNotEmpty()
  pujaId: string;

  @ApiPropertyOptional({ description: 'Selected Pandit Profile ID' })
  @IsOptional()
  @IsString()
  panditProfileId?: string;

  @ApiProperty({ example: '2026-11-25', description: 'Selected puja date' })
  @IsString()
  @IsNotEmpty()
  pujaDate: string;

  @ApiProperty({ example: '09:00 AM', description: 'Selected time slot' })
  @IsString()
  @IsNotEmpty()
  pujaTimeSlot: string;

  @ApiProperty({ example: 'Hindi', description: 'Preferred language for chanting and explanations' })
  @IsString()
  @IsNotEmpty()
  pujaLanguage: string;

  @ApiProperty({ example: 'Flat 402, Shivam Residency, MG Road' })
  @IsString()
  @IsNotEmpty()
  venueAddress: string;

  @ApiProperty({ example: 'Pune' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: '411001' })
  @IsString()
  @IsNotEmpty()
  pincode: string;

  @ApiPropertyOptional({ example: true, default: false })
  @IsOptional()
  @IsBoolean()
  includeSamagri?: boolean;

  @ApiPropertyOptional({ example: 'Please bring extra Gangajal if possible.' })
  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @ApiPropertyOptional({ example: 'Rahul Sharma' })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({ example: '9876543210' })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiPropertyOptional({ example: 'rahul@example.com' })
  @IsOptional()
  @IsString()
  customerEmail?: string;

  @ApiPropertyOptional({ example: 'UPI' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({ example: 'PAID' })
  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @ApiPropertyOptional({ example: 'PAY_12345678' })
  @IsOptional()
  @IsString()
  transactionId?: string;
}
