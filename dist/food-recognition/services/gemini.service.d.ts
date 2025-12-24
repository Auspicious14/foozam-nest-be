import { ConfigService } from "@nestjs/config";
import { FoodRecognitionResult } from "../interfaces/food.interface";
export declare class GeminiService {
    private configService;
    private client;
    constructor(configService: ConfigService);
    recognizeFood(imageBuffer: Buffer, contextFromFeedback?: string): Promise<FoodRecognitionResult>;
    generateImageHash(imageBuffer: Buffer): string;
    private generateRecognitionId;
}
