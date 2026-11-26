import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyWidgetTokenDto {
  @ApiProperty({
    example: '+917219036260',
    description: 'Indian mobile number (+91XXXXXXXXXX or 10-digit number)',
  })
  @IsNotEmpty({ message: 'Phone number or identifier is required.' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiJ9...',
    description: 'MSG91 JWT access token returned by OTPWidget.verifyOTP()',
  })
  @IsNotEmpty({ message: 'MSG91 access token is required.' })
  @IsString()
  accessToken: string;

  @ApiPropertyOptional({
    example: 'Sacred Devotee',
    description: 'Optional full name for first-time customer registration',
  })
  @IsOptional()
  @IsString()
  fullName?: string;
}
