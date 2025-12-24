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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserHistorySchema = exports.UserHistory = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let UserHistory = class UserHistory extends mongoose_2.Document {
};
exports.UserHistory = UserHistory;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], UserHistory.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Recognition', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], UserHistory.prototype, "recognitionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], UserHistory.prototype, "foodName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], UserHistory.prototype, "origin", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], UserHistory.prototype, "location", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], UserHistory.prototype, "isFavorite", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], UserHistory.prototype, "tags", void 0);
exports.UserHistory = UserHistory = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], UserHistory);
exports.UserHistorySchema = mongoose_1.SchemaFactory.createForClass(UserHistory);
exports.UserHistorySchema.index({ userId: 1, createdAt: -1 });
exports.UserHistorySchema.index({ userId: 1, foodName: 1 });
exports.UserHistorySchema.index({ userId: 1, isFavorite: 1 });
//# sourceMappingURL=user-history.schema.js.map