// lib/weather/types.ts

export interface Location {
  name: string;
  displayName: string;
  lat: number;
  lon: number;
  flag?: string;
}

// Indicator type for sun/moon status
export interface BodyIndicator {
  status: 'Up' | 'Down';
  countdown?: string;
}

export interface WeatherData {
  location: LocationKey;
  current: {
    temperature: number;
    timestamp: string;
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
    moonPhaseDescription?: string; // NEW

    rawSunrise?: string;
    rawSunset?: string;
    rawMoonrise?: string;
    rawMoonset?: string;
    sunIndicator?: BodyIndicator; // NEW
    moonIndicator?: BodyIndicator; // NEW
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
    name: 'kop',
    displayName: 'King of Prussia, PA',
    lat: 40.0893,
    lon: -75.396,
    flag: '🇺🇸',
  },
  {
    name: 'brookline',
    displayName: 'Brookline, MA',
    lat: 42.33176,
    lon: -71.12116,
    flag: '🇺🇸',
  },
  {
    name: 'williamstown',
    displayName: 'Williamstown, MA',
    lat: 42.712025,
    lon: -73.203718,
    flag: '🇺🇸',
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

export type LocationKey = (typeof LOCATIONS)[number]['name'];

export const LOCATIONS_BY_KEY: Record<LocationKey, Location> = LOCATIONS.reduce(
  (acc, loc) => {
    acc[loc.name as LocationKey] = loc;
    return acc;
  },
  {} as Record<LocationKey, Location>
);
