import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({ example: '+919822012345', description: 'Indian mobile number (+91 or 10 digits)' })
  @IsString()
  @IsNotEmpty({ message: 'Mobile number is required.' })
  phoneNumber: string;

  @ApiPropertyOptional({ example: 'REGISTER', enum: ['LOGIN', 'REGISTER'] })
  @IsOptional()
  @IsString()
  purpose?: string;
}
