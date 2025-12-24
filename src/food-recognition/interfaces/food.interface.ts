export interface FoodRecognitionResult {
  recognitionId: string;
  foodName: string;
  confidence: 'high' | 'medium' | 'low';
  alternativeNames: string[];
  origin: {
    country: string;
    region?: string;
  };
  ingredients: string[];
  description: string;
  culturalContext: string;
  nutritionalInfo?: {
    calories?: string;
    mainNutrients?: string[];
  };
  similarDishes?: Array<{
    name: string;
    origin: string;
  }>;
}

export interface NearbyLocation {
  name: string;
  address: string;
  distance: number;
  rating?: number;
  priceLevel?: string;
  phone?: string;
  website?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface FoozamResponse {
  success: boolean;
  data: {
    recognition: FoodRecognitionResult;
    nearbyPlaces: NearbyLocation[];
    similarRecognitions?: FoodRecognitionResult[];
  };
  timestamp: string;
}
