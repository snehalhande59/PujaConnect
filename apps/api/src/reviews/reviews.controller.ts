import { Controller, Post, Get, Body, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a new customer review for a completed puja' })
  async createReview(@Req() req: any, @Body() dto: CreateReviewDto) {
    const userId = this.reviewsService.extractUserIdFromAuthHeader(req.headers?.authorization);
    return this.reviewsService.createReview(userId, dto);
  }

  @Get('public')
  @ApiOperation({ summary: 'Get published reviews for display on mobile app or website' })
  async getPublicReviews(@Query('panditProfileId') panditProfileId?: string) {
    return this.reviewsService.getPublicReviews(panditProfileId);
  }
}
