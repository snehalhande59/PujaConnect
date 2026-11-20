import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({ example: '+919822012345', description: 'Indian mobile number (+91 or 10 digits)' })
  @IsString()
  @IsNotEmpty({ message: 'Mobile number is required.' })
  phoneNumber: string;

  @ApiProperty({ example: '123456', description: '6-digit OTP code' })
  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits.' })
  otp: string;

  @ApiPropertyOptional({ example: 'Rahul Sharma', description: 'Full name for new customer registration' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: 'rahul.sharma@example.com', description: 'Email address' })
  @IsOptional()
  @IsString()
  email?: string;
}
