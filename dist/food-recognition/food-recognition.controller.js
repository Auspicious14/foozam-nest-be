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
exports.FoodRecognitionController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const food_recognition_service_1 = require("./food-recognition.service");
const recognize_food_dto_1 = require("./dto/recognize-food.dto");
let FoodRecognitionController = class FoodRecognitionController {
    constructor(foodRecognitionService) {
        this.foodRecognitionService = foodRecognitionService;
    }
    async recognizeFood(file, body) {
        if (!file) {
            throw new common_1.BadRequestException('Image file is required');
        }
        return this.foodRecognitionService.recognizeFood(file.buffer, body.latitude, body.longitude, body.city, body.userId);
    }
    async submitFeedback(feedbackDto) {
        await this.foodRecognitionService.submitFeedback(feedbackDto.recognitionId, feedbackDto.correctFoodName, feedbackDto.correctOrigin, feedbackDto.userId, {
            correctIngredients: feedbackDto.correctIngredients,
            correctDescription: feedbackDto.correctDescription,
        });
        return { message: 'Feedback submitted successfully. Thank you for helping improve Foozam!' };
    }
    async getUserHistory(userId, limit, offset) {
        return this.foodRecognitionService.getUserHistory(userId, limit || 20, offset || 0);
    }
    async updateHistory(historyId, updateDto) {
        return this.foodRecognitionService.updateUserHistory(historyId, {
            isFavorite: updateDto.isFavorite,
            tags: updateDto.tags,
        });
    }
    async getUserStats(userId) {
        return this.foodRecognitionService.getUserStats(userId);
    }
    async getSystemStats() {
        return this.foodRecognitionService.getSystemStats();
    }
    healthCheck() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
        };
    }
};
exports.FoodRecognitionController = FoodRecognitionController;
__decorate([
    (0, common_1.Post)('recognize'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Recognize food from image' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', {
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
                return cb(new common_1.BadRequestException('Only image files are allowed'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, recognize_food_dto_1.RecognizeFoodDto]),
    __metadata("design:returntype", Promise)
], FoodRecognitionController.prototype, "recognizeFood", null);
__decorate([
    (0, common_1.Post)('feedback'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Submit feedback for recognition correction' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [recognize_food_dto_1.FeedbackDto]),
    __metadata("design:returntype", Promise)
], FoodRecognitionController.prototype, "submitFeedback", null);
__decorate([
    (0, common_1.Get)('history/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user scan history' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'offset', required: false, type: Number }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], FoodRecognitionController.prototype, "getUserHistory", null);
__decorate([
    (0, common_1.Patch)('history/:historyId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user history entry (favorite, tags)' }),
    __param(0, (0, common_1.Param)('historyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, recognize_food_dto_1.UpdateHistoryDto]),
    __metadata("design:returntype", Promise)
], FoodRecognitionController.prototype, "updateHistory", null);
__decorate([
    (0, common_1.Get)('stats/user/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user statistics (food passport)' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FoodRecognitionController.prototype, "getUserStats", null);
__decorate([
    (0, common_1.Get)('stats/system'),
    (0, swagger_1.ApiOperation)({ summary: 'Get system-wide accuracy statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FoodRecognitionController.prototype, "getSystemStats", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Health check endpoint' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], FoodRecognitionController.prototype, "healthCheck", null);
exports.FoodRecognitionController = FoodRecognitionController = __decorate([
    (0, swagger_1.ApiTags)('Food Recognition'),
    (0, common_1.Controller)('food'),
    __metadata("design:paramtypes", [food_recognition_service_1.FoodRecognitionService])
], FoodRecognitionController);
//# sourceMappingURL=food-recognition.controller.js.map