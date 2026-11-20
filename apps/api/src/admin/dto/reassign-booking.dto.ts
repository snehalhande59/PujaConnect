import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReassignBookingDto {
  @ApiProperty({
    description: 'Target PanditProfile UUID to assign to the booking',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsUUID('4', { message: 'newPanditProfileId must be a valid UUID' })
  @IsNotEmpty({ message: 'newPanditProfileId is required' })
  newPanditProfileId: string;

  @ApiPropertyOptional({
    description: 'Reason for reassignment',
    example: 'Customer requested scholar proficient in Rigveda',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
