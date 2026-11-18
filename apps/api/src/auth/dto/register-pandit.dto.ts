import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsInt,
  Min,
  IsArray,
  ArrayNotEmpty,
  Matches,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterPanditDto {
  @ApiProperty({ example: 'pandit@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Pandit@2026', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  @Matches(/^[6-9]\d{9}$/, {
    message: 'Please provide a valid 10-digit Indian mobile number.',
  })
  phoneNumber: string;

  @ApiProperty({ example: 'Pandit Ramesh Sharma' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;

  @ApiPropertyOptional({ example: 5, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  experienceYears?: number;

  @ApiProperty({ example: ['Hindi', 'Marathi'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  languages: string[];

  @ApiProperty({ example: ['Ganesh Puja', 'Satyanarayan Puja'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  specializations: string[];

  @ApiProperty({ example: 'Pune' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Maharashtra' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: ['Pune', 'Pimpri-Chinchwad'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  serviceAreas: string[];

  @ApiPropertyOptional({ example: 'Experienced Vedic ritual specialist.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @ApiPropertyOptional({ example: 1500 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  basePrice?: number;
}
