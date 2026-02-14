/**
 * Environment Service — Barrel export + orchestrator
 *
 * Fetches weather + nearby places in parallel with graceful degradation.
 * Returns an EnvironmentContext that can be passed to the LLM prompt.
 */

export { fetchWeather, type WeatherData } from "./weather";
export { fetchNearbyPlaces, type PlaceResult } from "./places";
export {
  searchCities,
  geocodePlace,
  type CitySuggestion,
  type GeocodedLocation,
} from "./geocoding";

import { fetchWeather } from "./weather";
import { fetchNearbyPlaces } from "./places";

export interface EnvironmentContext {
  city: string;
  weather?: {
    temp: number;
    feelsLike: number;
    description: string;
    icon: string;
    humidity: number;
    windSpeed: number;
  };
  nearbyPlaces: Array<{
    name: string;
    placeId: string;
    vicinity: string;
    rating?: number;
    types: string[];
    staticMapUrl?: string;
    lat?: number;
    lng?: number;
  }>;
}

/**
 * Fetch all environmental context for a given location.
 * Uses Promise.allSettled so failure of one API doesn't block the other.
 * Returns null if location is not provided.
 */
export async function fetchEnvironmentContext(
  lat: number,
  lng: number,
): Promise<EnvironmentContext | null> {
  const [weatherResult, placesResult] = await Promise.allSettled([
    fetchWeather(lat, lng),
    fetchNearbyPlaces(lat, lng),
  ]);

  const weatherData =
    weatherResult.status === "fulfilled" ? weatherResult.value : null;
  const placesData =
    placesResult.status === "fulfilled" ? placesResult.value : null;

  // If we couldn't get the city name from weather, we can't build a useful context
  const cityName = weatherData?.cityName;
  if (!cityName) {
    // Even without weather, if we have places we can still return something
    if (placesData && placesData.length > 0) {
      return {
        city: "Unknown",
        nearbyPlaces: placesData,
      };
    }
    return null;
  }

  return {
    city: cityName,
    weather: weatherData
      ? {
          temp: weatherData.temp,
          feelsLike: weatherData.feelsLike,
          description: weatherData.description,
          icon: weatherData.icon,
          humidity: weatherData.humidity,
          windSpeed: weatherData.windSpeed,
        }
      : undefined,
    nearbyPlaces: placesData ?? [],
  };
}
