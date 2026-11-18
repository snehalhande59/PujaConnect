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
  @ApiProperty({ description: 'Puja ID to book' })
  @IsUUID()
  pujaId: string;

  @ApiProperty({ description: 'Selected Pandit Profile ID' })
  @IsUUID()
  panditProfileId: string;

  @ApiProperty({ example: '2026-11-25', description: 'Selected puja date (YYYY-MM-DD)' })
  @IsDateString()
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
}
