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
exports.RecognitionSchema = exports.Recognition = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Recognition = class Recognition extends mongoose_2.Document {
};
exports.Recognition = Recognition;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], Recognition.prototype, "recognitionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Recognition.prototype, "foodName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['high', 'medium', 'low'] }),
    __metadata("design:type", String)
], Recognition.prototype, "confidence", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Recognition.prototype, "alternativeNames", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, required: true }),
    __metadata("design:type", Object)
], Recognition.prototype, "origin", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Recognition.prototype, "ingredients", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Recognition.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Recognition.prototype, "culturalContext", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Recognition.prototype, "nutritionalInfo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Object], default: [] }),
    __metadata("design:type", Array)
], Recognition.prototype, "similarDishes", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Recognition.prototype, "imageHash", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Recognition.prototype, "location", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Recognition.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Recognition.prototype, "wasCorrected", void 0);
exports.Recognition = Recognition = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Recognition);
exports.RecognitionSchema = mongoose_1.SchemaFactory.createForClass(Recognition);
exports.RecognitionSchema.index({ foodName: 'text', 'origin.country': 'text' });
exports.RecognitionSchema.index({ createdAt: -1 });
exports.RecognitionSchema.index({ userId: 1 });
//# sourceMappingURL=recognition.schema.js.map