import { ConfigService } from "@nestjs/config";
import { NearbyLocation } from "../interfaces/food.interface";
export declare class LocationService {
    private configService;
    private readonly foursquareApiKey;
    private readonly foursquareBaseUrl;
    constructor(configService: ConfigService);
    findNearbyRestaurants(foodName: string, latitude?: number, longitude?: number, city?: string): Promise<NearbyLocation[]>;
    private mapFoursquareResults;
    findNearbyRestaurantsOSM(foodName: string, latitude?: number, longitude?: number, city?: string): Promise<NearbyLocation[]>;
    private executeOSMSearch;
    private mapOSMResults;
    private calculateDistance;
}
