// lib/weather/service.ts
import { DateTime } from "luxon";
import {
  LOCATIONS,
  LOCATIONS_BY_KEY,
  LocationKey,
  WeatherData,
} from "@/lib/weather/types";

const TOMORROW_API_KEY = process.env.TOMORROW_API_KEY!;
const BASE_URL = "https://api.tomorrow.io/v4/timelines";

if (!TOMORROW_API_KEY) {
  console.warn("TOMORROW_API_KEY is not set");
}

async function fetchFromTomorrowIO(locationKey: LocationKey): Promise<any> {
  const location = LOCATIONS_BY_KEY[locationKey];

  const body = {
    location: [location.lat, location.lon],
    fields: [
      "temperature",
      "temperatureApparent",
      "humidity",
      "windSpeed",
      "windGust",
      "windDirection",
      "pressureSeaLevel",
      "uvIndex",
      "visibility",
      "cloudCover",
      "weatherCode",
      // astronomy
      "sunriseTime",
      "sunsetTime",
      "moonriseTime",
      "moonsetTime",
      "moonPhase",
    ],
    units: "imperial",
    timesteps: ["current", "1h", "1d"],
    timezone: "America/New_York",
  };

  console.log("[weather] calling Tomorrow.io", {
    locationKey,
    lat: location.lat,
    lon: location.lon,
  });

  const res = await fetch(`${BASE_URL}?apikey=${TOMORROW_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[weather] Tomorrow.io error", {
      locationKey,
      status: res.status,
      statusText: res.statusText,
      body: text,
    });
    throw new Error(
      `Tomorrow.io API error (${locationKey}): ${res.status} ${res.statusText}`,
    );
  }

  return res.json();
}

const weatherCodeMap: Record<number, string> = {
  1000: "Clear",
  1100: "Mostly Clear",
  1101: "Partly Cloudy",
  1102: "Mostly Cloudy",
  1001: "Cloudy",
  2000: "Foggy",
  2100: "Light Fog",
  4000: "Drizzle",
  4001: "Rain",
  4200: "Light Rain",
  4201: "Heavy Rain",
  5000: "Snow",
  5001: "Flurries",
  5100: "Light Snow",
  5101: "Heavy Snow",
  6000: "Freezing Drizzle",
  6001: "Freezing Rain",
  6200: "Light Freezing Rain",
  6201: "Heavy Freezing Rain",
  7000: "Ice Pellets",
  7101: "Heavy Ice Pellets",
  7102: "Light Ice Pellets",
  8000: "Thunderstorm",
};

function formatTime(iso: string | null | undefined): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function mapTomorrowIOToWeatherData(
  rawData: any,
  locationKey: LocationKey,
): WeatherData {
  const location = LOCATIONS_BY_KEY[locationKey];

  const timelines = rawData.data?.timelines ?? [];
  const currentTimeline = timelines.find((t: any) => t.timestep === "current");
  const hourlyTimeline = timelines.find((t: any) => t.timestep === "1h");
  const dailyTimeline = timelines.find((t: any) => t.timestep === "1d");

  if (!currentTimeline?.intervals?.[0]) {
    throw new Error(`No current weather data for ${locationKey}`);
  }

  const currentValues = currentTimeline.intervals[0].values;
  const dailyValues = dailyTimeline?.intervals?.[0]?.values ?? {};

  const hourly = (hourlyTimeline?.intervals ?? [])
    .slice(0, 24)
    .map((i: any) => ({
      time: i.startTime,
      temperature: Math.round(i.values.temperature),
      condition: weatherCodeMap[i.values.weatherCode] ?? "Unknown",
      precipitation: Math.round(i.values.precipitationIntensity ?? 0),
    }));

  const daily = (dailyTimeline?.intervals ?? []).slice(0, 7).map((i: any) => ({
    date: i.startTime,
    high: Math.round(i.values.temperatureMax ?? i.values.temperature),
    low: Math.round(i.values.temperatureMin ?? i.values.temperature),
    condition: weatherCodeMap[i.values.weatherCode] ?? "Unknown",
    precipitation: Math.round(i.values.precipitationIntensity ?? 0),
  }));

  return {
    location,
    current: {
      temperature: Math.round(currentValues.temperature),
      feelsLike: Math.round(currentValues.temperatureApparent),
      humidity: Math.round(currentValues.humidity),
      windSpeed: Math.round(currentValues.windSpeed),
      windGust: Math.round(currentValues.windGust ?? 0),
      windDirection: Math.round(currentValues.windDirection),
      pressure: Math.round(currentValues.pressureSeaLevel),
      uvIndex: Math.round(currentValues.uvIndex ?? 0),
      visibility: Math.round(currentValues.visibility ?? 0),
      cloudCover: Math.round(currentValues.cloudCover ?? 0),
      condition: weatherCodeMap[currentValues.weatherCode] ?? "Unknown",
    },
    astronomy: {
      sunrise: formatTime(dailyValues.sunriseTime) ?? "N/A",
      sunset: formatTime(dailyValues.sunsetTime) ?? "N/A",
      moonrise: formatTime(dailyValues.moonriseTime),
      moonset: formatTime(dailyValues.moonsetTime),
      moonPhase: dailyValues.moonPhase ?? 0,
    },
    forecast: {
      hourly,
      daily,
    },
    isCached: false,
    lastUpdated: new Date().toISOString(),
  };
}

export async function getWeather(
  locationKey: LocationKey,
): Promise<WeatherData> {
  console.log("[weather] getWeather", { locationKey });
  const raw = await fetchFromTomorrowIO(locationKey);
  return mapTomorrowIOToWeatherData(raw, locationKey);
}

export async function getAllWeather(): Promise<WeatherData[]> {
  const keys = LOCATIONS.map((l) => l.name) as LocationKey[];
  const results = await Promise.all(
    keys.map(async (key) => {
      const raw = await fetchFromTomorrowIO(key);
      return mapTomorrowIOToWeatherData(raw, key);
    }),
  );
  return results;
}
