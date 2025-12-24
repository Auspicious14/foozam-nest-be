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
exports.FeedbackService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const feedback_schema_1 = require("../schemas/feedback.schema");
const recognition_schema_1 = require("../schemas/recognition.schema");
let FeedbackService = class FeedbackService {
    constructor(feedbackModel, recognitionModel) {
        this.feedbackModel = feedbackModel;
        this.recognitionModel = recognitionModel;
    }
    async storeFeedback(recognitionId, correctFoodName, correctOrigin, userId, additionalNotes) {
        const recognition = await this.recognitionModel.findOne({ recognitionId });
        if (!recognition) {
            throw new Error('Recognition not found');
        }
        const feedback = new this.feedbackModel({
            recognitionId: recognition._id,
            originalPrediction: recognition.foodName,
            correctFoodName,
            correctOrigin,
            userId,
            additionalNotes,
        });
        await feedback.save();
        await this.recognitionModel.updateOne({ recognitionId }, { wasCorrected: true });
        return feedback;
    }
    async getFeedbackContext(foodName) {
        const feedbacks = await this.feedbackModel
            .find({
            $or: [
                { originalPrediction: new RegExp(foodName, 'i') },
                { correctFoodName: new RegExp(foodName, 'i') },
            ],
        })
            .limit(5)
            .sort({ createdAt: -1 });
        if (feedbacks.length === 0) {
            return '';
        }
        const context = feedbacks.map(f => `Previous users corrected "${f.originalPrediction}" to "${f.correctFoodName}" from ${f.correctOrigin}`).join('. ');
        return context;
    }
    async getSimilarRecognitions(foodName, limit = 5) {
        return this.recognitionModel
            .find({
            $or: [
                { foodName: new RegExp(foodName, 'i') },
                { alternativeNames: new RegExp(foodName, 'i') },
            ],
        })
            .limit(limit)
            .sort({ createdAt: -1 })
            .exec();
    }
    async getAccuracyStats() {
        const total = await this.recognitionModel.countDocuments();
        const corrected = await this.recognitionModel.countDocuments({ wasCorrected: true });
        const accuracyByConfidence = await this.recognitionModel.aggregate([
            {
                $group: {
                    _id: '$confidence',
                    total: { $sum: 1 },
                    corrected: {
                        $sum: { $cond: ['$wasCorrected', 1, 0] }
                    },
                },
            },
        ]);
        return {
            totalRecognitions: total,
            correctedRecognitions: corrected,
            accuracyRate: total > 0 ? ((total - corrected) / total * 100).toFixed(2) : 0,
            byConfidence: accuracyByConfidence,
        };
    }
};
exports.FeedbackService = FeedbackService;
exports.FeedbackService = FeedbackService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(feedback_schema_1.Feedback.name)),
    __param(1, (0, mongoose_1.InjectModel)(recognition_schema_1.Recognition.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], FeedbackService);
//# sourceMappingURL=feedback.service.js.map