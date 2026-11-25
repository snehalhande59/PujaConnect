import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiPropertyOptional({ example: 'monica20@gmail.com', description: 'Customer email address' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: '+919822012345', description: 'Indian mobile number' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: '+919822012345', description: 'Alternative mobile number field' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'monica20@gmail.com', description: 'Unified identifier (email or phone number)' })
  @IsOptional()
  @IsString()
  identifier?: string;

  @ApiProperty({ example: '123456', description: '6-digit verification code' })
  @IsNotEmpty({ message: 'Verification code is required.' })
  @IsString({ message: 'Verification code must be a string.' })
  @Length(6, 6, { message: 'Verification code must be exactly 6 digits.' })
  otp: string;

  @ApiPropertyOptional({ example: 'Monica Pardeshi', description: 'Full name for new customer registration' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: 'email', enum: ['email', 'sms'], description: 'Delivery channel' })
  @IsOptional()
  @IsString()
  channel?: string;

  @ApiPropertyOptional({ example: '336767676...', description: 'MSG91 Widget Request ID for OTP verification' })
  @IsOptional()
  @IsString()
  reqId?: string;

  @ApiPropertyOptional({ example: 'LOGIN', enum: ['LOGIN', 'REGISTER'] })
  @IsOptional()
  @IsString()
  purpose?: string;
}
