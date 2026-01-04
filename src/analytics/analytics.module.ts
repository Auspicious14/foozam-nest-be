import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { LoginActivity, LoginActivitySchema } from './schemas/login-activity.schema';
import { AnonymousEvent, AnonymousEventSchema } from './schemas/anonymous-event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LoginActivity.name, schema: LoginActivitySchema },
      { name: AnonymousEvent.name, schema: AnonymousEventSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
