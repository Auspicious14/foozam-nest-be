import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Feedback } from '../schemas/feedback.schema';
import { Recognition } from '../schemas/recognition.schema';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(Feedback.name) private feedbackModel: Model<Feedback>,
    @InjectModel(Recognition.name) private recognitionModel: Model<Recognition>,
  ) {}

  async storeFeedback(
    recognitionId: string,
    correctFoodName: string,
    correctOrigin: string,
    userId?: string,
    additionalNotes?: any,
  ): Promise<Feedback> {
    // Find the recognition by recognitionId string
    const recognition = await this.recognitionModel.findOne({ recognitionId });
    
    if (!recognition) {
      throw new Error('Recognition not found');
    }

    const feedback = new this.feedbackModel({
      recognitionId: recognition._id,
      originalPrediction: recognition.foodName,
      correctFoodName,
      correctOrigin,
      userId,
      additionalNotes,
    });

    await feedback.save();

    // Mark recognition as corrected
    await this.recognitionModel.updateOne(
      { recognitionId },
      { wasCorrected: true }
    );

    return feedback;
  }

  async getFeedbackContext(foodName: string): Promise<string> {
    const feedbacks = await this.feedbackModel
      .find({
        $or: [
          { originalPrediction: new RegExp(foodName, 'i') },
          { correctFoodName: new RegExp(foodName, 'i') },
        ],
      })
      .limit(5)
      .sort({ createdAt: -1 });

    if (feedbacks.length === 0) {
      return '';
    }

    const context = feedbacks.map(f => 
      `Previous users corrected "${f.originalPrediction}" to "${f.correctFoodName}" from ${f.correctOrigin}`
    ).join('. ');

    return context;
  }

  async getSimilarRecognitions(foodName: string, limit: number = 5): Promise<Recognition[]> {
    return this.recognitionModel
      .find({
        $or: [
          { foodName: new RegExp(foodName, 'i') },
          { alternativeNames: new RegExp(foodName, 'i') },
        ],
      })
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
  }

  async getAccuracyStats(): Promise<any> {
    const total = await this.recognitionModel.countDocuments();
    const corrected = await this.recognitionModel.countDocuments({ wasCorrected: true });
    
    const accuracyByConfidence = await this.recognitionModel.aggregate([
      {
        $group: {
          _id: '$confidence',
          total: { $sum: 1 },
          corrected: {
            $sum: { $cond: ['$wasCorrected', 1, 0] }
          },
        },
      },
    ]);

    return {
      totalRecognitions: total,
      correctedRecognitions: corrected,
      accuracyRate: total > 0 ? ((total - corrected) / total * 100).toFixed(2) : 0,
      byConfidence: accuracyByConfidence,
    };
  }
}
