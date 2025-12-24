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
exports.LocationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
let LocationService = class LocationService {
    constructor(configService) {
        this.configService = configService;
        this.foursquareBaseUrl = "https://api.foursquare.com/v3/places";
        this.foursquareApiKey =
            this.configService.get("FOURSQUARE_API_KEY");
    }
    async findNearbyRestaurants(foodName, latitude, longitude, city) {
        try {
            if (!this.foursquareApiKey) {
                console.warn("FOURSQUARE_API_KEY not configured, using OSM fallback");
                return this.findNearbyRestaurantsOSM(foodName, latitude, longitude, city);
            }
            let query = foodName;
            const originMatch = foodName.match(/nigerian|ghanaian|ethiopian|kenyan|indian|chinese|mexican|italian/i);
            if (originMatch) {
                query = `${originMatch[0]} restaurant`;
            }
            const params = {
                query,
                categories: "13065",
                limit: 10,
            };
            if (latitude && longitude) {
                params.ll = `${latitude},${longitude}`;
                params.radius = 10000;
            }
            else if (city) {
                params.near = city;
            }
            const response = await axios_1.default.get(`${this.foursquareBaseUrl}/search`, {
                headers: {
                    Authorization: this.foursquareApiKey,
                    Accept: "application/json",
                },
                params,
            });
            return this.mapFoursquareResults(response.data.results || []);
        }
        catch (error) {
            const status = error.response?.status;
            if (status === 401) {
                console.warn("Foursquare API Key is invalid or unauthorized (401). Falling back to OSM.");
            }
            else if (status === 429) {
                console.warn("Foursquare API rate limit exceeded (429). Falling back to OSM.");
            }
            else {
                console.error("Foursquare Error:", error.message || error);
            }
            return this.findNearbyRestaurantsOSM(foodName, latitude, longitude, city);
        }
    }
    mapFoursquareResults(results) {
        return results.map((place) => ({
            name: place.name,
            address: place.location?.formatted_address ||
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
    async findNearbyRestaurantsOSM(foodName, latitude, longitude, city) {
        try {
            let query = `${foodName} restaurant`.trim();
            let results = await this.executeOSMSearch(query, latitude, longitude);
            if (results.length === 0) {
                query = "restaurant";
                results = await this.executeOSMSearch(query, latitude, longitude, city);
            }
            if (results.length === 0 && city) {
                query = `${foodName} ${city}`;
                results = await this.executeOSMSearch(query, latitude, longitude);
            }
            const mappedResults = this.mapOSMResults(results, latitude, longitude);
            return mappedResults.sort((a, b) => a.distance - b.distance);
        }
        catch (error) {
            console.error("OSM Location Error:", error.message || error);
            return [];
        }
    }
    async executeOSMSearch(query, latitude, longitude, city, isFallback = false) {
        const finalQuery = city ? `${query} in ${city}` : query;
        const params = {
            q: finalQuery,
            format: "json",
            limit: 15,
            addressdetails: 1,
            extratags: 1,
        };
        if (latitude && longitude) {
            const delta = isFallback ? 0.2 : 0.05;
            params.viewbox = `${longitude - delta},${latitude + delta},${longitude + delta},${latitude - delta}`;
            params.bounded = 1;
        }
        const response = await axios_1.default.get("https://nominatim.openstreetmap.org/search", {
            params,
            headers: {
                "User-Agent": "FoozamFoodRecognitionApp/1.0 (https://github.com/auspicious14/foozam-nest-be; contact@foozam-app.com)",
                "Accept-Language": "en-US,en;q=0.9",
            },
        });
        let results = response.data || [];
        if (results.length === 0 && latitude && longitude && !isFallback) {
            return this.executeOSMSearch(query, latitude, longitude, city, true);
        }
        return results;
    }
    mapOSMResults(results, userLat, userLon) {
        return results.map((place) => {
            const lat = parseFloat(place.lat);
            const lon = parseFloat(place.lon);
            const distance = userLat && userLon
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
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3;
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
};
exports.LocationService = LocationService;
exports.LocationService = LocationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LocationService);
//# sourceMappingURL=location.service.js.map