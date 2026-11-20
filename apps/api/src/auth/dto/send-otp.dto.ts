import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiPropertyOptional({ example: 'monica20@gmail.com', description: 'Customer email address for Email OTP' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: '+919822012345', description: 'Indian mobile number (+91 or 10 digits)' })
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

  @ApiPropertyOptional({ example: 'email', enum: ['email', 'sms'], description: 'Delivery channel' })
  @IsOptional()
  @IsString()
  channel?: string;

  @ApiPropertyOptional({ example: 'LOGIN', enum: ['LOGIN', 'REGISTER'] })
  @IsOptional()
  @IsString()
  purpose?: string;
}
