import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PujasService } from './pujas.service';

@ApiTags('Pujas')
@Controller('pujas')
export class PujasController {
  constructor(private readonly pujasService: PujasService) {}

  @Get()
  @ApiOperation({ summary: 'List all active pujas with optional category and search filters' })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
  ) {
    return this.pujasService.findAll({ categoryId, search });
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get puja details by ID or Slug' })
  async findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.pujasService.findByIdOrSlug(idOrSlug);
  }
}
