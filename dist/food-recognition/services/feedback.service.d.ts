import { Model } from 'mongoose';
import { Feedback } from '../schemas/feedback.schema';
import { Recognition } from '../schemas/recognition.schema';
export declare class FeedbackService {
    private feedbackModel;
    private recognitionModel;
    constructor(feedbackModel: Model<Feedback>, recognitionModel: Model<Recognition>);
    storeFeedback(recognitionId: string, correctFoodName: string, correctOrigin: string, userId?: string, additionalNotes?: any): Promise<Feedback>;
    getFeedbackContext(foodName: string): Promise<string>;
    getSimilarRecognitions(foodName: string, limit?: number): Promise<Recognition[]>;
    getAccuracyStats(): Promise<any>;
}
