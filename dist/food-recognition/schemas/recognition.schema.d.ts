import { Document } from 'mongoose';
export declare class Recognition extends Document {
    createdAt: Date;
    updatedAt: Date;
    recognitionId: string;
    foodName: string;
    confidence: string;
    alternativeNames: string[];
    origin: {
        country: string;
        region?: string;
    };
    ingredients: string[];
    description: string;
    culturalContext: string;
    nutritionalInfo: {
        calories?: string;
        mainNutrients?: string[];
    };
    similarDishes: Array<{
        name: string;
        origin: string;
    }>;
    imageHash?: string;
    location?: {
        latitude: number;
        longitude: number;
        city?: string;
    };
    userId?: string;
    wasCorrected: boolean;
}
export declare const RecognitionSchema: import("mongoose").Schema<Recognition, import("mongoose").Model<Recognition, any, any, any, Document<unknown, any, Recognition, any, {}> & Recognition & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Recognition, Document<unknown, {}, import("mongoose").FlatRecord<Recognition>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Recognition> & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
