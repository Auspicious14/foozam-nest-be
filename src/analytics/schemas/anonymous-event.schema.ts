import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class AnonymousEvent extends Document {
  @Prop({ required: true })
  anonymousId: string;

  @Prop({ required: true })
  eventType: 'page_view' | 'session_start' | 'session_end' | 'interaction';

  @Prop()
  path: string;

  @Prop()
  referrer: string;

  @Prop()
  userAgent: string;

  @Prop()
  ipAddress: string;

  @Prop({ type: Object })
  geoData: {
    city?: string;
    country?: string;
    region?: string;
  };

  @Prop({ type: Object })
  deviceInfo: {
    browser?: string;
    os?: string;
    device?: string;
  };

  @Prop()
  duration?: number; // for sessions in seconds

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const AnonymousEventSchema = SchemaFactory.createForClass(AnonymousEvent);
