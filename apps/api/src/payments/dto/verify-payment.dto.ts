import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class VerifyPaymentDto {
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @IsString()
  @IsNotEmpty()
  razorpayOrderId: string;

  @IsString()
  @IsNotEmpty()
  razorpayPaymentId: string;

  @IsString()
  @IsOptional()
  razorpaySignature?: string;
}
