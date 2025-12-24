import { Document, Types } from 'mongoose';
export declare class Feedback extends Document {
    recognitionId: Types.ObjectId;
    originalPrediction: string;
    correctFoodName: string;
    correctOrigin: string;
    userId?: string;
    additionalNotes?: {
        correctIngredients?: string[];
        correctDescription?: string;
    };
}
export declare const FeedbackSchema: import("mongoose").Schema<Feedback, import("mongoose").Model<Feedback, any, any, any, Document<unknown, any, Feedback, any, {}> & Feedback & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Feedback, Document<unknown, {}, import("mongoose").FlatRecord<Feedback>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Feedback> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
