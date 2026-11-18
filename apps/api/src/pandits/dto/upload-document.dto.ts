import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadDocumentDto {
  @ApiProperty({
    example: 'AADHAAR',
    description: 'Document type: AADHAAR, PAN, VEDIC_CERTIFICATE, PROFILE_PHOTO, OTHER',
    enum: ['AADHAAR', 'PAN', 'VEDIC_CERTIFICATE', 'PROFILE_PHOTO', 'OTHER'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['AADHAAR', 'PAN', 'VEDIC_CERTIFICATE', 'PROFILE_PHOTO', 'OTHER'], {
    message: 'documentType must be one of: AADHAAR, PAN, VEDIC_CERTIFICATE, PROFILE_PHOTO, OTHER',
  })
  documentType: string;

  @ApiPropertyOptional({
    example: 'XXXX-XXXX-1234',
    description: 'Optional document identification number or identifier',
  })
  @IsOptional()
  @IsString()
  documentNumber?: string;
}
