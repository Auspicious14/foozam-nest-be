import { FoodRecognitionService } from './food-recognition.service';
import { RecognizeFoodDto, FeedbackDto, UpdateHistoryDto } from './dto/recognize-food.dto';
import { FoozamResponse } from './interfaces/food.interface';
export declare class FoodRecognitionController {
    private readonly foodRecognitionService;
    constructor(foodRecognitionService: FoodRecognitionService);
    recognizeFood(file: Express.Multer.File, body: RecognizeFoodDto, user?: any): Promise<FoozamResponse>;
    submitFeedback(feedbackDto: FeedbackDto, user?: any): Promise<{
        message: string;
    }>;
    getUserHistory(user: any, limit?: number, offset?: number): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/user-history.schema").UserHistory, {}, {}> & import("./schemas/user-history.schema").UserHistory & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getUserHistoryLegacy(userId: string, limit?: number, offset?: number): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/user-history.schema").UserHistory, {}, {}> & import("./schemas/user-history.schema").UserHistory & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    updateHistory(historyId: string, updateDto: UpdateHistoryDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/user-history.schema").UserHistory, {}, {}> & import("./schemas/user-history.schema").UserHistory & Required<{
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
    healthCheck(): {
        status: string;
        timestamp: string;
    };
}
