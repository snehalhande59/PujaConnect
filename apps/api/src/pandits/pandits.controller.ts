import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  Query,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { Response } from 'express';
import * as fs from 'fs';
import { Role } from '@prisma/client';

import { PanditsService } from './pandits.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Pandits')
@Controller('pandits')
export class PanditsController {
  constructor(private readonly panditsService: PanditsService) {}

  /**
   * Public: Browse verified Pandits (Marketplace discovery)
   */
  @Get()
  @ApiOperation({ summary: 'Browse verified Pandits on the public marketplace' })
  async findPublicPandits(
    @Query('city') city?: string,
    @Query('search') search?: string,
    @Query('specialization') specialization?: string,
    @Query('language') language?: string,
  ) {
    return this.panditsService.findPublicPandits({ city, search, specialization, language });
  }

  /**
   * Get authenticated Pandit's own profile and verification documents
   */
  @Get('me/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PANDIT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current Pandit profile with documents' })
  async getMyProfile(@CurrentUser() user: any) {
    return this.panditsService.getMyProfile(user.id);
  }

  /**
   * List all documents uploaded by current Pandit
   */
  @Get('me/documents')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PANDIT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all verification documents uploaded by current Pandit' })
  async getMyDocuments(@CurrentUser() user: any) {
    return this.panditsService.getMyDocuments(user.id);
  }

  /**
   * Upload a verification document (Aadhaar, PAN, Vedic Certificate, Profile Photo)
   */
  @Post('me/documents')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PANDIT)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload verification document (Aadhaar, PAN, Certificate, Photo)' })
  async uploadDocument(
    @CurrentUser() user: any,
    @UploadedFile() file: any,
    @Body() dto: UploadDocumentDto,
  ) {
    return this.panditsService.uploadDocument(user.id, file, dto);
  }

  /**
   * Delete an unverified document
   */
  @Delete('me/documents/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PANDIT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an unverified document' })
  async deleteDocument(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.panditsService.deleteDocument(user.id, id);
  }

  /**
   * Resubmit Pandit profile for admin verification
   */
  @Post('me/resubmit')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PANDIT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resubmit profile for Admin verification' })
  async resubmitVerification(@CurrentUser() user: any) {
    return this.panditsService.resubmitVerification(user.id);
  }

  /**
   * Securely stream/preview a verification document
   * Accessible by the Pandit owner and Admins
   */
  @Get('documents/:id/file')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Stream private verification document securely' })
  async streamDocumentFile(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const fileInfo = await this.panditsService.getDocumentFile(
      user.id,
      user.role,
      id,
    );

    res.setHeader('Content-Type', fileInfo.mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${fileInfo.documentType}-${fileInfo.fileName}"`,
    );

    fs.createReadStream(fileInfo.filePath).pipe(res);
  }

  /**
   * Public: Get verified Pandit profile by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get single verified Pandit profile details' })
  async findPublicPanditById(@Param('id', ParseUUIDPipe) id: string) {
    return this.panditsService.findPublicPanditById(id);
  }
}
