import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenAI } from "@google/genai";
import { FoodRecognitionResult } from "../interfaces/food.interface";
import * as crypto from "crypto";

@Injectable()
export class GeminiService {
  private client: GoogleGenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>("GEMINI_API_KEY");
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }
    this.client = new GoogleGenAI({ apiKey });
  }

  async recognizeFood(
    imageBuffer: Buffer,
    contextFromFeedback?: string
  ): Promise<FoodRecognitionResult> {
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
- Distinguish carefully between similar-looking dishes:
  * Ofe Nsala (White Soup): Light-colored, thin consistency, often contains catfish and yam cubes/thickener. NOT to be confused with Groundnut soup (which is thicker and nut-based).
  * Groundnut Soup (Omisagwe): Creamy, brownish/orange, nutty flavor.
  * Amala and Ewedu: Amala is dark brown/black; Ewedu is green and slimy; often served with yellow Gbegiri.
  * Egusi Soup: Yellow/orange with distinct clumps of melon seeds.
  * Pounded Yam vs Fufu: Pounded yam is smoother and whiter; Fufu can be slightly off-white and denser.
- If the dish is Ofe Nsala, ensure you don't misidentify it as Groundnut soup based on color alone.
- Be conservative with "high" confidence. Only use "high" if you are 90%+ certain. Otherwise use "medium" or "low".
- If you're uncertain, provide multiple possibilities in "alternativeNames" and set confidence to "medium" or "low".
- Include local/regional names when applicable.
- If the image doesn't clearly show food, indicate low confidence.`;

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
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new InternalServerErrorException("Failed to recognize food image");
    }
  }

  generateImageHash(imageBuffer: Buffer): string {
    return crypto.createHash("sha256").update(imageBuffer).digest("hex");
  }

  private generateRecognitionId(): string {
    return `rec_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
  }
}
