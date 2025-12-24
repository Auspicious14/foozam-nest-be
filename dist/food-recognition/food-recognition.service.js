"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoodRecognitionService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const gemini_service_1 = require("./services/gemini.service");
const location_service_1 = require("./services/location.service");
const feedback_service_1 = require("./services/feedback.service");
const recognition_schema_1 = require("./schemas/recognition.schema");
const user_history_schema_1 = require("./schemas/user-history.schema");
let FoodRecognitionService = class FoodRecognitionService {
    constructor(geminiService, locationService, feedbackService, recognitionModel, userHistoryModel) {
        this.geminiService = geminiService;
        this.locationService = locationService;
        this.feedbackService = feedbackService;
        this.recognitionModel = recognitionModel;
        this.userHistoryModel = userHistoryModel;
    }
    async recognizeFood(imageBuffer, latitude, longitude, city, userId) {
        const imageHash = this.geminiService.generateImageHash(imageBuffer);
        const recentRecognition = await this.recognitionModel
            .findOne({ imageHash })
            .sort({ createdAt: -1 })
            .exec();
        let recognition;
        if (recentRecognition && Date.now() - recentRecognition.createdAt.getTime() < 3600000) {
            recognition = recentRecognition;
        }
        else {
            const feedbackContext = await this.feedbackService.getFeedbackContext('');
            const recognitionResult = await this.geminiService.recognizeFood(imageBuffer, feedbackContext);
            recognition = new this.recognitionModel({
                ...recognitionResult,
                imageHash,
                location: latitude && longitude ? { latitude, longitude, city } : undefined,
                userId,
            });
            await recognition.save();
        }
        const similarRecognitions = await this.feedbackService.getSimilarRecognitions(recognition.foodName, 3);
        if (userId) {
            const historyEntry = new this.userHistoryModel({
                userId,
                recognitionId: recognition._id,
                foodName: recognition.foodName,
                origin: recognition.origin.country,
                location: recognition.location,
            });
            await historyEntry.save();
        }
        let nearbyPlaces = [];
        try {
            nearbyPlaces = await this.locationService.findNearbyRestaurants(recognition.foodName, latitude, longitude, city);
        }
        catch (error) {
            console.error('Error finding nearby places:', error);
        }
        return {
            success: true,
            data: {
                recognition: {
                    recognitionId: recognition.recognitionId,
                    foodName: recognition.foodName,
                    confidence: recognition.confidence,
                    alternativeNames: recognition.alternativeNames,
                    origin: recognition.origin,
                    ingredients: recognition.ingredients,
                    description: recognition.description,
                    culturalContext: recognition.culturalContext,
                    nutritionalInfo: recognition.nutritionalInfo,
                    similarDishes: recognition.similarDishes,
                },
                nearbyPlaces,
                similarRecognitions: similarRecognitions.map(r => ({
                    recognitionId: r.recognitionId,
                    foodName: r.foodName,
                    confidence: r.confidence,
                    alternativeNames: r.alternativeNames,
                    origin: r.origin,
                    ingredients: r.ingredients,
                    description: r.description,
                    culturalContext: r.culturalContext,
                    nutritionalInfo: r.nutritionalInfo,
                    similarDishes: r.similarDishes,
                })),
            },
            timestamp: new Date().toISOString(),
        };
    }
    async submitFeedback(recognitionId, correctFoodName, correctOrigin, userId, additionalNotes) {
        await this.feedbackService.storeFeedback(recognitionId, correctFoodName, correctOrigin, userId, additionalNotes);
    }
    async getUserHistory(userId, limit = 20, offset = 0) {
        return this.userHistoryModel
            .find({ userId })
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit)
            .populate('recognitionId')
            .exec();
    }
    async updateUserHistory(historyId, updates) {
        return this.userHistoryModel.findByIdAndUpdate(historyId, updates, { new: true }).exec();
    }
    async getUserStats(userId) {
        const totalScans = await this.userHistoryModel.countDocuments({ userId });
        const uniqueFoods = await this.userHistoryModel.distinct('foodName', { userId });
        const uniqueOrigins = await this.userHistoryModel.distinct('origin', { userId });
        const favorites = await this.userHistoryModel.countDocuments({ userId, isFavorite: true });
        const topFoods = await this.userHistoryModel.aggregate([
            { $match: { userId } },
            { $group: { _id: '$foodName', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
        ]);
        return {
            totalScans,
            uniqueFoods: uniqueFoods.length,
            uniqueOrigins: uniqueOrigins.length,
            favorites,
            topFoods: topFoods.map(f => ({ food: f._id, count: f.count })),
        };
    }
    async getSystemStats() {
        return this.feedbackService.getAccuracyStats();
    }
};
exports.FoodRecognitionService = FoodRecognitionService;
exports.FoodRecognitionService = FoodRecognitionService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, mongoose_1.InjectModel)(recognition_schema_1.Recognition.name)),
    __param(4, (0, mongoose_1.InjectModel)(user_history_schema_1.UserHistory.name)),
    __metadata("design:paramtypes", [gemini_service_1.GeminiService,
        location_service_1.LocationService,
        feedback_service_1.FeedbackService,
        mongoose_2.Model,
        mongoose_2.Model])
], FoodRecognitionService);
//# sourceMappingURL=food-recognition.service.js.map