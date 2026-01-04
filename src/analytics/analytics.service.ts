import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoginActivity } from './schemas/login-activity.schema';
import { AnonymousEvent } from './schemas/anonymous-event.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(LoginActivity.name)
    private readonly loginActivityModel: Model<LoginActivity>,
    @InjectModel(AnonymousEvent.name)
    private readonly anonymousEventModel: Model<AnonymousEvent>,
  ) {}

  async recordLoginActivity(data: any) {
    return this.loginActivityModel.create(data);
  }

  async recordAnonymousEvent(data: any) {
    return this.anonymousEventModel.create(data);
  }

  async getAdminStats() {
    const totalLogins = await this.loginActivityModel.countDocuments({ status: 'success' });
    const failedLogins = await this.loginActivityModel.countDocuments({ status: 'failed' });
    
    const uniqueVisitors = await this.anonymousEventModel.distinct('anonymousId').then(ids => ids.length);
    const totalPageViews = await this.anonymousEventModel.countDocuments({ eventType: 'page_view' });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyEngagement = await this.anonymousEventModel.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          views: { $sum: { $cond: [{ $eq: ['$eventType', 'page_view'] }, 1, 0] } },
          visitors: { $addToSet: '$anonymousId' }
        }
      },
      { $project: { _id: 1, views: 1, visitors: { $size: '$visitors' } } },
      { $sort: { _id: 1 } }
    ]);

    const deviceBreakdown = await this.anonymousEventModel.aggregate([
      { $group: { _id: '$deviceInfo.browser', count: { $sum: 1 } } }
    ]);

    return {
      overview: {
        totalLogins,
        failedLogins,
        uniqueVisitors,
        totalPageViews
      },
      dailyEngagement,
      deviceBreakdown,
      recentLogins: await this.loginActivityModel.find().sort({ createdAt: -1 }).limit(10)
    };
  }
}
