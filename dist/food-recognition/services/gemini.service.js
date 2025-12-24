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
exports.GeminiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const genai_1 = require("@google/genai");
const crypto = require("crypto");
let GeminiService = class GeminiService {
    constructor(configService) {
        this.configService = configService;
        const apiKey = this.configService.get("GEMINI_API_KEY");
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not configured");
        }
        this.client = new genai_1.GoogleGenAI({ apiKey });
    }
    async recognizeFood(imageBuffer, contextFromFeedback) {
        try {
            const model = "gemini-2.5-flash";
            let prompt = `Analyze this food image in detail and provide a comprehensive JSON response with the following structure:

{
  "foodName": "Primary name of the dish",
  "confidence": "high|medium|low",
  "alternativeNames": ["alternative name 1", "alternative name 2"],
  "origin": {
    "country": "Country of origin",
    "region": "Specific region if applicable"
  },
  "ingredients": ["ingredient 1", "ingredient 2", "ingredient 3"],
  "description": "A brief 2-3 sentence description of the dish",
  "culturalContext": "Cultural significance and traditional context",
  "nutritionalInfo": {
    "calories": "Approximate calorie range",
    "mainNutrients": ["nutrient 1", "nutrient 2"]
  },
  "similarDishes": [
    {"name": "Similar dish name", "origin": "Country"}
  ]
}

Important guidelines:
- Be extremely precise with African cuisines, particularly Nigerian, Ghanaian, Ethiopian, etc.
- Distinguish carefully between similar-looking Nigerian soups:
  * Amala and Ewedu: Amala is dark brown/black; Ewedu is green and slimy; often served with yellow Gbegiri.
  * Egusi Soup: Yellow/orange with distinct clumps of melon seeds.
  * Pounded Yam vs Fufu: Pounded yam is smoother and whiter; Fufu can be slightly off-white and denser.
- If you see a dark brown swallow with a green soup, it is likely Amala and Ewedu, NOT Egusi.
- If you're uncertain, provide multiple possibilities with different confidence levels
- Include local/regional names when applicable
- If the image doesn't clearly show food, indicate low confidence`;
            if (contextFromFeedback) {
                prompt += `\n\nPrevious feedback context: ${contextFromFeedback}`;
            }
            prompt +=
                "\n\nReturn ONLY valid JSON, no markdown formatting or additional text.";
            const response = await this.client.models.generateContent({
                model,
                contents: [
                    {
                        role: "user",
                        parts: [
                            { text: prompt },
                            {
                                inlineData: {
                                    data: imageBuffer.toString("base64"),
                                    mimeType: "image/jpeg",
                                },
                            },
                        ],
                    },
                ],
            });
            const text = response.candidates[0].content.parts[0].text;
            const cleanedText = text
                .replace(/```json\n?/g, "")
                .replace(/```\n?/g, "")
                .trim();
            const parsed = JSON.parse(cleanedText);
            return {
                recognitionId: this.generateRecognitionId(),
                foodName: parsed.foodName,
                confidence: parsed.confidence || "medium",
                alternativeNames: parsed.alternativeNames || [],
                origin: parsed.origin,
                ingredients: parsed.ingredients || [],
                description: parsed.description,
                culturalContext: parsed.culturalContext,
                nutritionalInfo: parsed.nutritionalInfo,
                similarDishes: parsed.similarDishes || [],
            };
        }
        catch (error) {
            console.error("Gemini API Error:", error);
            throw new common_1.InternalServerErrorException("Failed to recognize food image");
        }
    }
    generateImageHash(imageBuffer) {
        return crypto.createHash("sha256").update(imageBuffer).digest("hex");
    }
    generateRecognitionId() {
        return `rec_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
    }
};
exports.GeminiService = GeminiService;
exports.GeminiService = GeminiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GeminiService);
//# sourceMappingURL=gemini.service.js.map