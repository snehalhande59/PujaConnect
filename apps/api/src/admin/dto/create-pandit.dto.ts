import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsNumber,
  IsArray,
  IsBoolean,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePanditDto {
  @ApiProperty({ example: 'Pt. Devendra Shastri', description: 'Full Name of the Pandit' })
  @IsString()
  @IsNotEmpty({ message: 'Pandit full name is required.' })
  fullName: string;

  @ApiProperty({ example: 'devendra.shastri@pujaconnect.com', description: 'Email address' })
  @IsEmail({}, { message: 'Valid email address is required.' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+919822011111', description: 'Mobile phone number' })
  @IsString()
  @IsNotEmpty({ message: 'Mobile number is required.' })
  phoneNumber: string;

  @ApiPropertyOptional({ example: 12, description: 'Years of Vedic experience' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  experienceYears?: number;

  @ApiPropertyOptional({ example: ['Marathi', 'Hindi', 'Sanskrit'], description: 'Languages spoken' })
  @IsOptional()
  @IsArray()
  languages?: string[];

  @ApiPropertyOptional({ example: ['Satyanarayan', 'Griha Pravesh', 'Rudrabhishek'], description: 'Ritual specializations' })
  @IsOptional()
  @IsArray()
  specializations?: string[];

  @ApiProperty({ example: 'Pune', description: 'City of residence' })
  @IsString()
  @IsNotEmpty({ message: 'City is required.' })
  city: string;

  @ApiProperty({ example: 'Maharashtra', description: 'State' })
  @IsString()
  @IsNotEmpty({ message: 'State is required.' })
  state: string;

  @ApiPropertyOptional({ example: ['Kothrud', 'Aundh', 'Baner'], description: 'Service areas' })
  @IsOptional()
  @IsArray()
  serviceAreas?: string[];

  @ApiPropertyOptional({ example: 'Vedic scholar trained at Varanasi Gurukul with 12+ years experience.' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: 2501, description: 'Base Dakshina amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/...', description: 'Profile avatar image URL' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ description: 'Array of Puja IDs this Pandit conducts', example: [] })
  @IsOptional()
  @IsArray()
  pujaIds?: string[];
}
