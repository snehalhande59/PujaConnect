import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RejectPanditDto {
  @ApiProperty({
    example: 'Please upload valid identity documents.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}
