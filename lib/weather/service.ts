// lib/weather/service.ts
import db from "../db";
import { Prisma } from "@/src/generated/client";
import { LocationKey, LOCATIONS, WeatherData } from "./types";
import { logger } from "@/lib/axiom/server";

const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
const TOMORROW_API_KEY = process.env.TOMORROW_API_KEY;
const TOMORROW_API_URL = "https://api.tomorrow.io/v4/weather/forecast";

// Helper to safely cast JSON from Prisma to WeatherData
function jsonToWeatherData(json: Prisma.JsonValue): WeatherData {
  return json as unknown as WeatherData;
}

async function fetchFromTomorrowIO(locationKey: LocationKey): Promise<any> {
  const location = LOCATIONS[locationKey];

  // Tomorrow.io v4 API expects timesteps as separate parameters
  const queryParams = new URLSearchParams({
    location: `${location.latitude},${location.longitude}`,
    apikey: TOMORROW_API_KEY!,
    units: "imperial",
    timezone: location.timezone,
    timesteps: "current,1h,1d",
  });

  // Add fields as separate parameters
  const fields = [
    "temperature",
    "temperatureApparent",
    "weatherCode",
    "humidity",
    "windSpeed",
    "windGust",
    "pressureSurfaceLevel",
    "uvIndex",
    "sunriseTime",
    "sunsetTime",
    "moonPhase",
  ];

  fields.forEach((field) => queryParams.append("fields", field));

  const url = `${TOMORROW_API_URL}?${queryParams}`;

  logger.debug("Fetching from Tomorrow.io", {
    location: locationKey,
    url: url.replace(TOMORROW_API_KEY!, "***"),
  });

  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    logger.error("Tomorrow.io API error", {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
      location: locationKey,
    });
    throw new Error(
      `Tomorrow.io API error: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

function parseTomorrowIOData(
  rawData: any,
  locationKey: LocationKey,
): WeatherData {
  const location = LOCATIONS[locationKey];
  const current = rawData.timelines.current[0].values;
  const hourly = rawData.timelines["1h"].slice(0, 24);
  const daily = rawData.timelines["1d"].slice(0, 7);

  const weatherCodeMap: Record<number, string> = {
    0: "Clear",
    1: "Cloudy",
    2: "Mostly Cloudy",
    3: "Partly Cloudy",
    4: "Mostly Clear",
    5: "Hazy",
    6: "Foggy",
    7: "Light Rain",
    8: "Rain",
    9: "Heavy Rain",
    10: "Freezing Rain",
    11: "Ice Pellets",
    12: "Snow",
    13: "Heavy Snow",
    14: "Thunderstorm",
  };

  return {
    location,
    current: {
      temperature: Math.round(current.temperature),
      feelsLike: Math.round(current.temperatureApparent),
      condition: weatherCodeMap[current.weatherCode] || "Unknown",
      humidity: current.humidity,
      windSpeed: Math.round(current.windSpeed),
      windGust: Math.round(current.windGust),
      pressure: current.pressureSurfaceLevel,
      uvIndex: current.uvIndex,
    },
    sun: {
      rise: new Date(current.sunriseTime).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      set: new Date(current.sunsetTime).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
    moon: {
      rise: current.moonriseTime
        ? new Date(current.moonriseTime).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "N/A",
      set: current.moonsetTime
        ? new Date(current.moonsetTime).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "N/A",
      phase: getMoonPhase(current.moonPhase),
    },
    hourly: hourly.map((h: any) => ({
      time: new Date(h.time).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      temperature: Math.round(h.values.temperature),
      condition: weatherCodeMap[h.values.weatherCode] || "Unknown",
      precipitation: h.values.precipitationProbability || 0,
      windSpeed: Math.round(h.values.windSpeed),
    })),
    daily: daily.map((d: any) => ({
      date: new Date(d.time).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      high: Math.round(d.values.temperatureMax),
      low: Math.round(d.values.temperatureMin),
      condition: weatherCodeMap[d.values.weatherCode] || "Unknown",
      precipitation: d.values.precipitationProbability || 0,
      windSpeed: Math.round(d.values.windSpeed),
    })),
    lastUpdated: new Date().toISOString(),
    isCached: false,
  };
}

function getMoonPhase(phase: number): string {
  const phases = [
    "New Moon",
    "Waxing Crescent",
    "First Quarter",
    "Waxing Gibbous",
    "Full Moon",
    "Waning Gibbous",
    "Last Quarter",
    "Waning Crescent",
  ];
  const index = Math.round((phase / 100) * (phases.length - 1));
  return phases[index];
}

export async function getWeather(
  locationKey: LocationKey,
  forceRefresh = false,
): Promise<WeatherData> {
  const startTime = performance.now();

  try {
    // Check cache first
    if (!forceRefresh) {
      const cached = await db.weatherCache.findUnique({
        where: { location: locationKey },
      });

      if (cached) {
        const age = Date.now() - new Date(cached.updatedAt).getTime();

        if (age < CACHE_DURATION) {
          const weatherData = {
            ...jsonToWeatherData(cached.data),
            isCached: true,
          };

          logger.info("Weather fetched from cache", {
            location: locationKey,
            age: Math.round(age / 1000),
            duration: Math.round(performance.now() - startTime),
          });

          return weatherData;
        }
      }
    }

    // Fetch fresh data from Tomorrow.io
    const rawData = await fetchFromTomorrowIO(locationKey);
    const weatherData = parseTomorrowIOData(rawData, locationKey);

    // Update cache
    await db.weatherCache.upsert({
      where: { location: locationKey },
      create: {
        location: locationKey,
        data: weatherData as unknown as Prisma.InputJsonValue,
      },
      update: {
        data: weatherData as unknown as Prisma.InputJsonValue,
        updatedAt: new Date(),
      },
    });

    logger.info("Weather fetched from Tomorrow.io", {
      location: locationKey,
      temperature: weatherData.current.temperature,
      condition: weatherData.current.condition,
      duration: Math.round(performance.now() - startTime),
    });

    return weatherData;
  } catch (error) {
    logger.error("Weather fetch failed", {
      location: locationKey,
      error: error instanceof Error ? error.message : String(error),
      duration: Math.round(performance.now() - startTime),
    });

    // Fallback to cached data even if stale
    const cached = await db.weatherCache.findUnique({
      where: { location: locationKey },
    });

    if (cached) {
      const weatherData = { ...jsonToWeatherData(cached.data), isCached: true };
      logger.warn("Using stale cached weather data", {
        location: locationKey,
        age: Math.round(
          (Date.now() - new Date(cached.updatedAt).getTime()) / 1000,
        ),
      });
      return weatherData;
    }

    throw error;
  }
}

export async function getAllWeather(
  forceRefresh = false,
): Promise<WeatherData[]> {
  const results = await Promise.all(
    Object.keys(LOCATIONS).map((key) =>
      getWeather(key as LocationKey, forceRefresh),
    ),
  );

  return results;
}
