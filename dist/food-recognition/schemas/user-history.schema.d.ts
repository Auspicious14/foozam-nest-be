import { Document, Types } from 'mongoose';
export declare class UserHistory extends Document {
    userId: string;
    recognitionId: Types.ObjectId;
    foodName: string;
    origin: string;
    location?: {
        latitude: number;
        longitude: number;
        city?: string;
    };
    isFavorite: boolean;
    tags: string[];
}
export declare const UserHistorySchema: import("mongoose").Schema<UserHistory, import("mongoose").Model<UserHistory, any, any, any, Document<unknown, any, UserHistory, any, {}> & UserHistory & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, UserHistory, Document<unknown, {}, import("mongoose").FlatRecord<UserHistory>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<UserHistory> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
