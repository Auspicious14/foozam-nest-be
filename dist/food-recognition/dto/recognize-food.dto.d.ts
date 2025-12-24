export declare class RecognizeFoodDto {
    image?: any;
    latitude?: number;
    longitude?: number;
    city?: string;
    userId?: string;
}
export declare class FeedbackDto {
    recognitionId: string;
    correctFoodName: string;
    correctOrigin: string;
    userId?: string;
    correctIngredients?: string[];
    correctDescription?: string;
}
export declare class UpdateHistoryDto {
    historyId: string;
    isFavorite?: boolean;
    tags?: string[];
}
export declare class GetUserHistoryDto {
    userId: string;
    limit?: number;
    offset?: number;
}
