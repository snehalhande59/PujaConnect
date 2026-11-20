import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsArray,
  IsBoolean,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePanditDto {
  @ApiPropertyOptional({ example: 'Pt. Devendra Shastri' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: 'Devendra' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Shastri' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: 'Shivaji Nagar, Pune' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'devendra.shastri@pujaconnect.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+919822011111' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  experienceYears?: number;

  @ApiPropertyOptional({ example: ['Marathi', 'Hindi', 'Sanskrit'] })
  @IsOptional()
  @IsArray()
  languages?: string[];

  @ApiPropertyOptional({ example: ['Satyanarayan', 'Griha Pravesh'] })
  @IsOptional()
  @IsArray()
  specializations?: string[];

  @ApiPropertyOptional({ example: 'Pune' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Maharashtra' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: ['Kothrud', 'Aundh'] })
  @IsOptional()
  @IsArray()
  serviceAreas?: string[];

  @ApiPropertyOptional({ example: 'Vedic scholar with 12+ years experience.' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: 2100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ description: 'Puja IDs to associate with this Pandit' })
  @IsOptional()
  @IsArray()
  pujaIds?: string[];
}
