import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GeminiService } from './services/gemini.service';
import { LocationService } from './services/location.service';
import { FeedbackService } from './services/feedback.service';
import { Recognition } from './schemas/recognition.schema';
import { UserHistory } from './schemas/user-history.schema';
import { FoozamResponse } from './interfaces/food.interface';

@Injectable()
export class FoodRecognitionService {
  constructor(
    private geminiService: GeminiService,
    private locationService: LocationService,
    private feedbackService: FeedbackService,
    @InjectModel(Recognition.name) private recognitionModel: Model<Recognition>,
    @InjectModel(UserHistory.name) private userHistoryModel: Model<UserHistory>,
  ) {}

  async recognizeFood(
    imageBuffer: Buffer,
    latitude?: number,
    longitude?: number,
    city?: string,
    userId?: string,
  ): Promise<FoozamResponse> {
    // Generate image hash for deduplication
    const imageHash = this.geminiService.generateImageHash(imageBuffer);

    // Check for similar recent recognitions (optional deduplication)
    const recentRecognition = await this.recognitionModel
      .findOne({ imageHash })
      .sort({ createdAt: -1 })
      .exec();

    let recognition;

    if (recentRecognition && Date.now() - recentRecognition.createdAt.getTime() < 3600000) {
      // Use cached recognition if less than 1 hour old
      recognition = recentRecognition;
    } else {
      // Get feedback context for better recognition
      const feedbackContext = await this.feedbackService.getFeedbackContext('');
      
      // Recognize food using Gemini
      const recognitionResult = await this.geminiService.recognizeFood(imageBuffer, feedbackContext);

      // Save to database
      recognition = new this.recognitionModel({
        ...recognitionResult,
        imageHash,
        location: latitude && longitude ? { latitude, longitude, city } : undefined,
        userId,
      });

      await recognition.save();
    }

    // Find similar past recognitions
    const similarRecognitions = await this.feedbackService.getSimilarRecognitions(
      recognition.foodName,
      3
    );

    // Save to user history if userId provided
    if (userId) {
      const historyEntry = new this.userHistoryModel({
        userId,
        recognitionId: recognition._id,
        foodName: recognition.foodName,
        origin: recognition.origin.country,
        location: recognition.location,
      });
      await historyEntry.save();
    }

    // Find nearby restaurants
    let nearbyPlaces = [];
    try {
      nearbyPlaces = await this.locationService.findNearbyRestaurants(
        recognition.foodName,
        latitude,
        longitude,
        city,
      );
    } catch (error) {
      console.error('Error finding nearby places:', error);
    }

    return {
      success: true,
      data: {
        recognition: {
          recognitionId: recognition.recognitionId,
          foodName: recognition.foodName,
          confidence: recognition.confidence as any,
          alternativeNames: recognition.alternativeNames,
          origin: recognition.origin,
          ingredients: recognition.ingredients,
          description: recognition.description,
          culturalContext: recognition.culturalContext,
          nutritionalInfo: recognition.nutritionalInfo,
          similarDishes: recognition.similarDishes,
        },
        nearbyPlaces,
        similarRecognitions: similarRecognitions.map(r => ({
          recognitionId: r.recognitionId,
          foodName: r.foodName,
          confidence: r.confidence as any,
          alternativeNames: r.alternativeNames,
          origin: r.origin,
          ingredients: r.ingredients,
          description: r.description,
          culturalContext: r.culturalContext,
          nutritionalInfo: r.nutritionalInfo,
          similarDishes: r.similarDishes,
        })),
      },
      timestamp: new Date().toISOString(),
    };
  }

  async submitFeedback(
    recognitionId: string,
    correctFoodName: string,
    correctOrigin: string,
    userId?: string,
    additionalNotes?: any,
  ): Promise<void> {
    await this.feedbackService.storeFeedback(
      recognitionId,
      correctFoodName,
      correctOrigin,
      userId,
      additionalNotes,
    );
  }

  async getUserHistory(userId: string, limit: number = 20, offset: number = 0) {
    return this.userHistoryModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate('recognitionId')
      .exec();
  }

  async updateUserHistory(historyId: string, updates: any) {
    return this.userHistoryModel.findByIdAndUpdate(
      historyId,
      updates,
      { new: true }
    ).exec();
  }

  async getUserStats(userId: string) {
    const totalScans = await this.userHistoryModel.countDocuments({ userId });
    const uniqueFoods = await this.userHistoryModel.distinct('foodName', { userId });
    const uniqueOrigins = await this.userHistoryModel.distinct('origin', { userId });
    const favorites = await this.userHistoryModel.countDocuments({ userId, isFavorite: true });

    const topFoods = await this.userHistoryModel.aggregate([
      { $match: { userId } },
      { $group: { _id: '$foodName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    return {
      totalScans,
      uniqueFoods: uniqueFoods.length,
      uniqueOrigins: uniqueOrigins.length,
      favorites,
      topFoods: topFoods.map(f => ({ food: f._id, count: f.count })),
    };
  }

  async getSystemStats() {
    return this.feedbackService.getAccuracyStats();
  }
}
