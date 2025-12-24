"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoodRecognitionModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const food_recognition_controller_1 = require("./food-recognition.controller");
const food_recognition_service_1 = require("./food-recognition.service");
const gemini_service_1 = require("./services/gemini.service");
const location_service_1 = require("./services/location.service");
const feedback_service_1 = require("./services/feedback.service");
const recognition_schema_1 = require("./schemas/recognition.schema");
const feedback_schema_1 = require("./schemas/feedback.schema");
const user_history_schema_1 = require("./schemas/user-history.schema");
let FoodRecognitionModule = class FoodRecognitionModule {
};
exports.FoodRecognitionModule = FoodRecognitionModule;
exports.FoodRecognitionModule = FoodRecognitionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: recognition_schema_1.Recognition.name, schema: recognition_schema_1.RecognitionSchema },
                { name: feedback_schema_1.Feedback.name, schema: feedback_schema_1.FeedbackSchema },
                { name: user_history_schema_1.UserHistory.name, schema: user_history_schema_1.UserHistorySchema },
            ]),
        ],
        controllers: [food_recognition_controller_1.FoodRecognitionController],
        providers: [
            food_recognition_service_1.FoodRecognitionService,
            gemini_service_1.GeminiService,
            location_service_1.LocationService,
            feedback_service_1.FeedbackService,
        ],
    })
], FoodRecognitionModule);
//# sourceMappingURL=food-recognition.module.js.map