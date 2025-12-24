import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { NearbyLocation } from '../interfaces/food.interface';

@Injectable()
export class LocationService {
  private readonly foursquareApiKey: string;
  private readonly foursquareBaseUrl = 'https://api.foursquare.com/v3/places';

  constructor(private configService: ConfigService) {
    this.foursquareApiKey = this.configService.get<string>('FOURSQUARE_API_KEY');
  }

  async findNearbyRestaurants(
    foodName: string,
    latitude?: number,
    longitude?: number,
    city?: string,
  ): Promise<NearbyLocation[]> {
    try {
      if (!this.foursquareApiKey) {
        console.warn('FOURSQUARE_API_KEY not configured, using OSM fallback');
        return this.findNearbyRestaurantsOSM(foodName, latitude, longitude, city);
      }

      let query = foodName;
      const originMatch = foodName.match(/nigerian|ghanaian|ethiopian|kenyan|indian|chinese|mexican|italian/i);
      if (originMatch) {
        query = `${originMatch[0]} restaurant`;
      }

      const params: any = {
        query,
        categories: '13065',
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
          'Authorization': this.foursquareApiKey,
          'Accept': 'application/json',
        },
        params,
      });

      return this.mapFoursquareResults(response.data.results || []);
    } catch (error) {
      const status = error.response?.status;
      if (status === 401) {
        console.warn('Foursquare API Key is invalid or unauthorized (401). Falling back to OSM.');
      } else {
        console.error('Foursquare Error:', error.message || error);
      }
      return this.findNearbyRestaurantsOSM(foodName, latitude, longitude, city);
    }
  }

  private mapFoursquareResults(results: any[]): NearbyLocation[] {
    return results.map(place => ({
      name: place.name,
      address: place.location?.formatted_address || 
               `${place.location?.address || ''}, ${place.location?.locality || ''}`.trim(),
      distance: place.distance || 0,
      rating: place.rating ? place.rating / 2 : undefined,
      priceLevel: place.price ? '$'.repeat(place.price) : undefined,
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
    city?: string,
  ): Promise<NearbyLocation[]> {
    try {
      const query = `restaurant ${foodName} ${city || ''}`.trim();
      
      const params: any = {
        q: query,
        format: 'json',
        limit: 10,
      };

      if (latitude && longitude) {
        params.lat = latitude;
        params.lon = longitude;
        params.bounded = 1;
        params.viewbox = `${longitude - 0.1},${latitude - 0.1},${longitude + 0.1},${latitude + 0.1}`;
      }

      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params,
        headers: {
          'User-Agent': 'Foozam/1.0',
        },
      });

      return this.mapOSMResults(response.data || [], latitude, longitude);
    } catch (error) {
      console.error('OSM Location Error:', error);
      return [];
    }
  }

  private mapOSMResults(results: any[], userLat?: number, userLon?: number): NearbyLocation[] {
    return results.map(place => {
      const lat = parseFloat(place.lat);
      const lon = parseFloat(place.lon);
      const distance = userLat && userLon 
        ? this.calculateDistance(userLat, userLon, lat, lon)
        : 0;

      return {
        name: place.display_name.split(',')[0],
        address: place.display_name,
        distance,
        coordinates: {
          latitude: lat,
          longitude: lon,
        },
      };
    });
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}
