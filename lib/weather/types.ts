// lib/weather/types.ts
export type LocationKey = "kop-pa" | "brookline-ma" | "williamstown-ma";

export interface LocationInfo {
  key: LocationKey;
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
  timezone: string;
  flag: string;
}

export const LOCATIONS: Record<LocationKey, LocationInfo> = {
  "kop-pa": {
    key: "kop-pa",
    name: "King of Prussia, PA",
    displayName: "King of Prussia, PA",
    latitude: 40.0913,
    longitude: -75.3802,
    timezone: "America/New_York",
    flag: "🇺🇸",
  },
  "brookline-ma": {
    key: "brookline-ma",
    name: "Brookline, MA",
    displayName: "Brookline, MA",
    latitude: 42.3316,
    longitude: -71.1234,
    timezone: "America/New_York",
    flag: "🇺🇸",
  },
  "williamstown-ma": {
    key: "williamstown-ma",
    name: "Williamstown, MA",
    displayName: "Williamstown, MA",
    latitude: 42.7141,
    longitude: -73.1955,
    timezone: "America/New_York",
    flag: "🇺🇸",
  },
};

export interface WeatherData {
  location: LocationInfo;
  current: {
    temperature: number;
    feelsLike: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    windGust: number;
    pressure: number;
    uvIndex: number;
  };
  sun: {
    rise: string;
    set: string;
  };
  moon: {
    rise: string;
    set: string;
    phase: string;
  };
  hourly: Array<{
    time: string;
    temperature: number;
    condition: string;
    precipitation: number;
    windSpeed: number;
  }>;
  daily: Array<{
    date: string;
    high: number;
    low: number;
    condition: string;
    precipitation: number;
    windSpeed: number;
  }>;
  lastUpdated: string;
  isCached: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: boolean;
  timestamp: string;
}
