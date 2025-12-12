// lib/weather/types.ts

export interface Location {
  name: string;
  displayName: string;
  lat: number;
  lon: number;
  flag?: string;
}

export interface WeatherData {
  location: Location;
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    windGust: number;
    windDirection: number;
    pressure: number;
    uvIndex: number;
    visibility: number;
    cloudCover: number;
    condition: string;
  };
  astronomy: {
    sunrise: string;
    sunset: string;
    moonrise: string | null;
    moonset: string | null;
    moonPhase: number; // 0 = new moon, 0.5 = full moon, 1 = new moon
  };
  forecast?: {
    hourly: Array<{
      time: string;
      temperature: number;
      condition: string;
      precipitation: number;
    }>;
    daily: Array<{
      date: string;
      high: number;
      low: number;
      condition: string;
      precipitation: number;
    }>;
  };
  isCached: boolean;
  lastUpdated: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: boolean;
  timestamp: string;
}

// Predefined locations to monitor
export const LOCATIONS: Location[] = [
  {
    name: "kop",
    displayName: "King of Prussia, PA",
    lat: 40.0893,
    lon: -75.396,
    flag: "🇺🇸", // King of Prussia, PA coordinates[web:85]
  },
  {
    name: "brookline",
    displayName: "Brookline, MA",
    lat: 42.33176,
    lon: -71.12116,
    flag: "🇺🇸", // Brookline, MA coordinates[web:75]
  },
  {
    name: "williamstown",
    displayName: "Williamstown, MA",
    lat: 42.712025,
    lon: -73.203718,
    flag: "🇺🇸", // Williamstown, MA coordinates[web:78]
  },
];

// Helper to get location by name
export function getLocationByName(name: string): Location | undefined {
  return LOCATIONS.find((loc) => loc.name.toLowerCase() === name.toLowerCase());
}

// Helper to get all location names
export function getAllLocationNames(): string[] {
  return LOCATIONS.map((loc) => loc.name);
}

export type LocationKey = (typeof LOCATIONS)[number]["name"];

export const LOCATIONS_BY_KEY: Record<LocationKey, Location> = LOCATIONS.reduce(
  (acc, loc) => {
    acc[loc.name as LocationKey] = loc;
    return acc;
  },
  {} as Record<LocationKey, Location>,
);
