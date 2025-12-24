import { Model } from 'mongoose';
import { GeminiService } from './services/gemini.service';
import { LocationService } from './services/location.service';
import { FeedbackService } from './services/feedback.service';
import { Recognition } from './schemas/recognition.schema';
import { UserHistory } from './schemas/user-history.schema';
import { FoozamResponse } from './interfaces/food.interface';
export declare class FoodRecognitionService {
    private geminiService;
    private locationService;
    private feedbackService;
    private recognitionModel;
    private userHistoryModel;
    constructor(geminiService: GeminiService, locationService: LocationService, feedbackService: FeedbackService, recognitionModel: Model<Recognition>, userHistoryModel: Model<UserHistory>);
    recognizeFood(imageBuffer: Buffer, latitude?: number, longitude?: number, city?: string, userId?: string): Promise<FoozamResponse>;
    submitFeedback(recognitionId: string, correctFoodName: string, correctOrigin: string, userId?: string, additionalNotes?: any): Promise<void>;
    getUserHistory(userId: string, limit?: number, offset?: number): Promise<(import("mongoose").Document<unknown, {}, UserHistory, {}, {}> & UserHistory & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    updateUserHistory(historyId: string, updates: any): Promise<import("mongoose").Document<unknown, {}, UserHistory, {}, {}> & UserHistory & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getUserStats(userId: string): Promise<{
        totalScans: number;
        uniqueFoods: number;
        uniqueOrigins: number;
        favorites: number;
        topFoods: {
            food: any;
            count: any;
        }[];
    }>;
    getSystemStats(): Promise<any>;
}
