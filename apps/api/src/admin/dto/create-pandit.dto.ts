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
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePanditDto {
  @ApiPropertyOptional({ example: 'Pt. Devendra Shastri', description: 'Full Name of the Pandit' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: 'Devendra', description: 'First name' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Shastri', description: 'Last name' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: 'Shivaji Nagar, Pune', description: 'Address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'devendra.shastri@devsutra.in', description: 'Email address' })
  @IsEmail({}, { message: 'Valid email address is required.' })
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: '+919822011111', description: 'Mobile phone number' })
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

  @ApiPropertyOptional({ example: 'Pune', description: 'City of residence' })
  @IsString()
  @IsNotEmpty({ message: 'City is required.' })
  city: string;

  @ApiPropertyOptional({ example: 'Maharashtra', description: 'State' })
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

  @ApiPropertyOptional({ example: 2100, description: 'Standard Dakshina base fee' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @ApiPropertyOptional({ example: true, description: 'Active availability in marketplace' })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ description: 'Puja IDs to associate with this Pandit' })
  @IsOptional()
  @IsArray()
  pujaIds?: string[];
}
