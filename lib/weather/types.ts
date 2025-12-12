// lib/weather/types.ts

export type BodyIndicator = {
  status: "Up" | "Down";
  countdown?: string;
};

export type WeatherData = {
  location: {
    name: string;
    displayName: string;
    lat: number;
    lon: number;
    flag?: string;
  };
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
    moonrise: string; // was string | null
    moonset: string; // was string | null
    moonPhase: number;
    sunIndicator?: BodyIndicator;
    moonIndicator?: BodyIndicator;
    moonPhaseDescription?: string;
  };
  isCached: boolean;
  lastUpdated: string;
};
