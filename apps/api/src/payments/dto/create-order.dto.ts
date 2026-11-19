import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreatePaymentOrderDto {
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  currency?: string;
}

export class CashPaymentDto {
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @IsOptional()
  notes?: string;
}
