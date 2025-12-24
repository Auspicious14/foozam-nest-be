import {
  Controller,
  Post,
  Get,
  Patch,
  UseInterceptors,
  UploadedFile,
  Body,
  Query,
  Param,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { FoodRecognitionService } from './food-recognition.service';
import { RecognizeFoodDto, FeedbackDto, UpdateHistoryDto, GetUserHistoryDto } from './dto/recognize-food.dto';
import { FoozamResponse } from './interfaces/food.interface';

@ApiTags('Food Recognition')
@Controller('food')
export class FoodRecognitionController {
  constructor(private readonly foodRecognitionService: FoodRecognitionService) {}

  @Post('recognize')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Recognize food from image' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return cb(new BadRequestException('Only image files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async recognizeFood(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: RecognizeFoodDto,
  ): Promise<FoozamResponse> {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    return this.foodRecognitionService.recognizeFood(
      file.buffer,
      body.latitude,
      body.longitude,
      body.city,
      body.userId,
    );
  }

  @Post('feedback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit feedback for recognition correction' })
  async submitFeedback(@Body() feedbackDto: FeedbackDto): Promise<{ message: string }> {
    await this.foodRecognitionService.submitFeedback(
      feedbackDto.recognitionId,
      feedbackDto.correctFoodName,
      feedbackDto.correctOrigin,
      feedbackDto.userId,
      {
        correctIngredients: feedbackDto.correctIngredients,
        correctDescription: feedbackDto.correctDescription,
      },
    );

    return { message: 'Feedback submitted successfully. Thank you for helping improve Foozam!' };
  }

  @Get('history/:userId')
  @ApiOperation({ summary: 'Get user scan history' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getUserHistory(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.foodRecognitionService.getUserHistory(
      userId,
      limit || 20,
      offset || 0,
    );
  }

  @Patch('history/:historyId')
  @ApiOperation({ summary: 'Update user history entry (favorite, tags)' })
  async updateHistory(
    @Param('historyId') historyId: string,
    @Body() updateDto: UpdateHistoryDto,
  ) {
    return this.foodRecognitionService.updateUserHistory(historyId, {
      isFavorite: updateDto.isFavorite,
      tags: updateDto.tags,
    });
  }

  @Get('stats/user/:userId')
  @ApiOperation({ summary: 'Get user statistics (food passport)' })
  async getUserStats(@Param('userId') userId: string) {
    return this.foodRecognitionService.getUserStats(userId);
  }

  @Get('stats/system')
  @ApiOperation({ summary: 'Get system-wide accuracy statistics' })
  async getSystemStats() {
    return this.foodRecognitionService.getSystemStats();
  }

  @Get('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Health check endpoint' })
  healthCheck(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
