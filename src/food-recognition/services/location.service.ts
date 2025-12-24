import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { NearbyLocation } from "../interfaces/food.interface";

@Injectable()
export class LocationService {
  private readonly foursquareApiKey: string;
  private readonly foursquareBaseUrl = "https://api.foursquare.com/v3/places";

  constructor(private configService: ConfigService) {
    this.foursquareApiKey =
      this.configService.get<string>("FOURSQUARE_API_KEY");
  }

  async findNearbyRestaurants(
    foodName: string,
    latitude?: number,
    longitude?: number,
    city?: string
  ): Promise<NearbyLocation[]> {
    try {
      if (!this.foursquareApiKey) {
        console.warn("FOURSQUARE_API_KEY not configured, using OSM fallback");
        return this.findNearbyRestaurantsOSM(
          foodName,
          latitude,
          longitude,
          city
        );
      }

      let query = foodName;
      const originMatch = foodName.match(
        /nigerian|ghanaian|ethiopian|kenyan|indian|chinese|mexican|italian/i
      );
      if (originMatch) {
        query = `${originMatch[0]} restaurant`;
      }

      const params: any = {
        query,
        categories: "13065",
        limit: 10,
      };

      if (latitude && longitude) {
        params.ll = `${latitude},${longitude}`;
        params.radius = 10000;
      } else if (city) {
        params.near = city;
      }

      const response = await axios.get(`${this.foursquareBaseUrl}/search`, {
        headers: {
          Authorization: this.foursquareApiKey,
          Accept: "application/json",
        },
        params,
      });

      return this.mapFoursquareResults(response.data.results || []);
    } catch (error) {
      const status = error.response?.status;
      if (status === 401) {
        console.warn(
          "Foursquare API Key is invalid or unauthorized (401). Falling back to OSM."
        );
      } else if (status === 429) {
        console.warn(
          "Foursquare API rate limit exceeded (429). Falling back to OSM."
        );
      } else {
        console.error("Foursquare Error:", error.message || error);
      }
      return this.findNearbyRestaurantsOSM(foodName, latitude, longitude, city);
    }
  }

  private mapFoursquareResults(results: any[]): NearbyLocation[] {
    return results.map((place) => ({
      name: place.name,
      address:
        place.location?.formatted_address ||
        `${place.location?.address || ""}, ${place.location?.locality || ""}`.trim(),
      distance: place.distance || 0,
      rating: place.rating ? place.rating / 2 : undefined,
      priceLevel: place.price ? "$".repeat(place.price) : undefined,
      phone: place.tel,
      website: place.website,
      coordinates: {
        latitude: place.geocodes?.main?.latitude || 0,
        longitude: place.geocodes?.main?.longitude || 0,
      },
    }));
  }

  async findNearbyRestaurantsOSM(
    foodName: string,
    latitude?: number,
    longitude?: number,
    city?: string
  ): Promise<NearbyLocation[]> {
    try {
      // 1. Try specific search first: "foodName restaurant"
      let query = `${foodName} restaurant`.trim();
      let results = await this.executeOSMSearch(query, latitude, longitude);

      // 2. If no results, try broader: "restaurant" near location
      if (results.length === 0) {
        query = "restaurant";
        results = await this.executeOSMSearch(query, latitude, longitude, city);
      }

      // 3. If still no results and we have a city, try just the food name in that city
      if (results.length === 0 && city) {
        query = `${foodName} ${city}`;
        results = await this.executeOSMSearch(query, latitude, longitude);
      }

      const mappedResults = this.mapOSMResults(results, latitude, longitude);

      // Sort by distance (closest first)
      return mappedResults.sort((a, b) => a.distance - b.distance);
    } catch (error) {
      console.error("OSM Location Error:", error.message || error);
      return [];
    }
  }

  private async executeOSMSearch(
    query: string,
    latitude?: number,
    longitude?: number,
    city?: string,
    isFallback: boolean = false
  ): Promise<any[]> {
    const params: any = {
      q: city ? `${query} near ${city}` : query,
      format: "json",
      limit: 15,
      addressdetails: 1,
      extratags: 1,
      // Add amenity filter to prioritize restaurants/cafes
      amenity: "restaurant,cafe,fast_food,food_court",
    };

    if (latitude && longitude) {
      // Use a smaller viewbox for initial search, larger for fallback
      const delta = isFallback ? 0.2 : 0.05; // ~5km vs ~20km
      params.viewbox = `${longitude - delta},${latitude + delta},${
        longitude + delta
      },${latitude - delta}`;
      // bounded=1 forces results within the viewbox to avoid global "Restaurant" results
      params.bounded = 1;
    }

    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params,
        headers: {
          "User-Agent":
            "FoozamFoodRecognitionApp/1.0 (https://github.com/auspicious14/foozam-nest-be; contact@foozam-app.com)",
          "Accept-Language": "en-US,en;q=0.9",
        },
      }
    );

    let results = response.data || [];

    // If still no results and we have coordinates but were bounded, try one last time slightly less bounded
    if (results.length === 0 && latitude && longitude && !isFallback) {
      return this.executeOSMSearch(query, latitude, longitude, city, true);
    }

    return results;
  }

  private mapOSMResults(
    results: any[],
    userLat?: number,
    userLon?: number
  ): NearbyLocation[] {
    return results.map((place) => {
      const lat = parseFloat(place.lat);
      const lon = parseFloat(place.lon);
      const distance =
        userLat && userLon
          ? this.calculateDistance(userLat, userLon, lat, lon)
          : 0;

      return {
        name: place.display_name.split(",")[0],
        address: place.display_name,
        distance,
        coordinates: {
          latitude: lat,
          longitude: lon,
        },
      };
    });
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}
