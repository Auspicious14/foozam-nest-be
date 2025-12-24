import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FoodRecognitionController } from './food-recognition.controller';
import { FoodRecognitionService } from './food-recognition.service';
import { GeminiService } from './services/gemini.service';
import { LocationService } from './services/location.service';
import { FeedbackService } from './services/feedback.service';
import { Recognition, RecognitionSchema } from './schemas/recognition.schema';
import { Feedback, FeedbackSchema } from './schemas/feedback.schema';
import { UserHistory, UserHistorySchema } from './schemas/user-history.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Recognition.name, schema: RecognitionSchema },
      { name: Feedback.name, schema: FeedbackSchema },
      { name: UserHistory.name, schema: UserHistorySchema },
    ]),
  ],
  controllers: [FoodRecognitionController],
  providers: [
    FoodRecognitionService,
    GeminiService,
    LocationService,
    FeedbackService,
  ],
})
export class FoodRecognitionModule {}
