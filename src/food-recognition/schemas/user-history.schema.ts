import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class UserHistory extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ type: Types.ObjectId, ref: 'Recognition', required: true })
  recognitionId: Types.ObjectId;

  @Prop({ required: true })
  foodName: string;

  @Prop({ required: true })
  origin: string;

  @Prop({ type: Object })
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
  };

  @Prop({ default: false })
  isFavorite: boolean;

  @Prop({ type: [String], default: [] })
  tags: string[];
}

export const UserHistorySchema = SchemaFactory.createForClass(UserHistory);

// Indexes
UserHistorySchema.index({ userId: 1, createdAt: -1 });
UserHistorySchema.index({ userId: 1, foodName: 1 });
UserHistorySchema.index({ userId: 1, isFavorite: 1 });
