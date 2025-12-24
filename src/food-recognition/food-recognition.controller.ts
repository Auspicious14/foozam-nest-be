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
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { FoodRecognitionService } from './food-recognition.service';
import { RecognizeFoodDto, FeedbackDto, UpdateHistoryDto, GetUserHistoryDto } from './dto/recognize-food.dto';
import { FoozamResponse } from './interfaces/food.interface';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorators/get-user.decorator';

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
    @GetUser() user?: any,
  ): Promise<FoozamResponse> {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const userId = user?.userId || body.userId;

    return this.foodRecognitionService.recognizeFood(
      file.buffer,
      body.latitude,
      body.longitude,
      body.city,
      userId,
    );
  }

  @Post('feedback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit feedback for recognition correction' })
  async submitFeedback(
    @Body() feedbackDto: FeedbackDto,
    @GetUser() user?: any,
  ): Promise<{ message: string }> {
    const userId = user?.userId || feedbackDto.userId;

    await this.foodRecognitionService.submitFeedback(
      feedbackDto.recognitionId,
      feedbackDto.correctFoodName,
      feedbackDto.correctOrigin,
      userId,
      {
        correctIngredients: feedbackDto.correctIngredients,
        correctDescription: feedbackDto.correctDescription,
      },
    );

    return { message: 'Feedback submitted successfully. Thank you for helping improve Foozam!' };
  }

  @Get('history')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user scan history' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getUserHistory(
    @GetUser() user: any,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.foodRecognitionService.getUserHistory(
      user.userId,
      limit || 20,
      offset || 0,
    );
  }

  @Get('history/:userId')
  @ApiOperation({ summary: 'Get user scan history (legacy/public)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getUserHistoryLegacy(
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
