import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Recognition extends Document {
  createdAt: Date;
  updatedAt: Date;

  @Prop({ required: true, unique: true })
  recognitionId: string;

  @Prop({ required: true })
  foodName: string;

  @Prop({ required: true, enum: ['high', 'medium', 'low'] })
  confidence: string;

  @Prop({ type: [String], default: [] })
  alternativeNames: string[];

  @Prop({ type: Object, required: true })
  origin: {
    country: string;
    region?: string;
  };

  @Prop({ type: [String], default: [] })
  ingredients: string[];

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  culturalContext: string;

  @Prop({ type: Object })
  nutritionalInfo: {
    calories?: string;
    mainNutrients?: string[];
  };

  @Prop({ type: [Object], default: [] })
  similarDishes: Array<{
    name: string;
    origin: string;
  }>;

  @Prop()
  imageHash?: string;

  @Prop({ type: Object })
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
  };

  @Prop()
  userId?: string;

  @Prop({ default: false })
  wasCorrected: boolean;
}

export const RecognitionSchema = SchemaFactory.createForClass(Recognition);

// Index for efficient queries
RecognitionSchema.index({ foodName: 'text', 'origin.country': 'text' });
RecognitionSchema.index({ createdAt: -1 });
RecognitionSchema.index({ userId: 1 });
