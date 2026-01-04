import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class LoginActivity extends Document {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  status: 'success' | 'failed';

  @Prop()
  userAgent: string;

  @Prop()
  ipAddress: string;

  @Prop()
  reason?: string; // e.g., "invalid password", "user not found"
}

export const LoginActivitySchema = SchemaFactory.createForClass(LoginActivity);
