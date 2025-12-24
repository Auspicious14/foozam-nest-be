import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Feedback extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Recognition', required: true })
  recognitionId: Types.ObjectId;

  @Prop({ required: true })
  originalPrediction: string;

  @Prop({ required: true })
  correctFoodName: string;

  @Prop({ required: true })
  correctOrigin: string;

  @Prop()
  userId?: string;

  @Prop({ type: Object })
  additionalNotes?: {
    correctIngredients?: string[];
    correctDescription?: string;
  };
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);

// Index for analytics
FeedbackSchema.index({ originalPrediction: 1 });
FeedbackSchema.index({ correctFoodName: 1 });
FeedbackSchema.index({ createdAt: -1 });
