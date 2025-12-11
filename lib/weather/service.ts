// lib/weather/service.ts
import db from "../db";
import { Prisma } from "@/src/generated/client";
import { LocationKey, LOCATIONS, WeatherData } from "./types";
import { logger } from "@/lib/axiom/server";

const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
const TOMORROW_API_KEY = process.env.TOMORROW_API_KEY;
const TOMORROW_REALTIME_URL = "https://api.tomorrow.io/v4/weather/realtime";
const TOMORROW_FORECAST_URL = "https://api.tomorrow.io/v4/weather/forecast";

// Helper to safely cast JSON from Prisma to WeatherData
function jsonToWeatherData(json: Prisma.JsonValue): WeatherData {
  return json as unknown as WeatherData;
}

async function fetchFromTomorrowIO(locationKey: LocationKey): Promise<any> {
  const location = LOCATIONS[locationKey];
  const locationParam = `${location.latitude},${location.longitude}`;

  // Fetch current/realtime data
  const realtimeParams = new URLSearchParams({
    location: locationParam,
    apikey: TOMORROW_API_KEY!,
    units: "imperial",
  });

  const realtimeFields = [
    "temperature",
    "temperatureApparent",
    "weatherCode",
    "humidity",
    "windSpeed",
    "windGust",
    "pressureSurfaceLevel",
    "uvIndex",
  ];

  realtimeFields.forEach((field) => realtimeParams.append("fields", field));

  // Fetch forecast data (hourly and daily)
  const forecastParams = new URLSearchParams({
    location: locationParam,
    apikey: TOMORROW_API_KEY!,
    units: "imperial",
    timesteps: "1h,1d",
  });

  const forecastFields = [
    "temperature",
    "temperatureApparent",
    "temperatureMax",
    "temperatureMin",
    "weatherCode",
    "precipitationProbability",
    "windSpeed",
    "sunriseTime",
    "sunsetTime",
    "moonPhase",
  ];

  forecastFields.forEach((field) => forecastParams.append("fields", field));

  const realtimeUrl = `${TOMORROW_REALTIME_URL}?${realtimeParams}`;
  const forecastUrl = `${TOMORROW_FORECAST_URL}?${forecastParams}`;

  logger.debug("Fetching from Tomorrow.io", {
    location: locationKey,
    realtimeUrl: realtimeUrl.replace(TOMORROW_API_KEY!, "***"),
    forecastUrl: forecastUrl.replace(TOMORROW_API_KEY!, "***"),
  });

  // Fetch both endpoints in parallel
  const [realtimeResponse, forecastResponse] = await Promise.all([
    fetch(realtimeUrl),
    fetch(forecastUrl),
  ]);

  if (!realtimeResponse.ok) {
    const errorText = await realtimeResponse.text();
    logger.error("Tomorrow.io Realtime API error", {
      status: realtimeResponse.status,
      statusText: realtimeResponse.statusText,
      body: errorText,
      location: locationKey,
    });
    throw new Error(
      `Tomorrow.io API error: ${realtimeResponse.status} ${realtimeResponse.statusText}`,
    );
  }

  if (!forecastResponse.ok) {
    const errorText = await forecastResponse.text();
    logger.error("Tomorrow.io Forecast API error", {
      status: forecastResponse.status,
      statusText: forecastResponse.statusText,
      body: errorText,
      location: locationKey,
    });
    throw new Error(
      `Tomorrow.io API error: ${forecastResponse.status} ${forecastResponse.statusText}`,
    );
  }

  const [realtimeData, forecastData] = await Promise.all([
    realtimeResponse.json(),
    forecastResponse.json(),
  ]);

  return { realtime: realtimeData, forecast: forecastData };
}

function parseTomorrowIOData(
  rawData: any,
  locationKey: LocationKey,
): WeatherData {
  const location = LOCATIONS[locationKey];
  const current = rawData.realtime.data.values;
  const hourly = rawData.forecast.timelines.hourly.slice(0, 24);
  const daily = rawData.forecast.timelines.daily.slice(0, 7);

  const weatherCodeMap: Record<number, string> = {
    1000: "Clear",
    1001: "Cloudy",
    1100: "Mostly Clear",
    1101: "Partly Cloudy",
    1102: "Mostly Cloudy",
    2000: "Fog",
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

  // Get sun/moon data from first daily forecast entry
  const todayForecast = daily[0]?.values || {};

  return {
    location,
    current: {
      temperature: Math.round(current.temperature),
      feelsLike: Math.round(current.temperatureApparent),
      condition: weatherCodeMap[current.weatherCode] || "Unknown",
      humidity: current.humidity,
      windSpeed: Math.round(current.windSpeed),
      windGust: Math.round(current.windGust || 0),
      pressure: current.pressureSurfaceLevel,
      uvIndex: current.uvIndex,
    },
    sun: {
      rise: todayForecast.sunriseTime
        ? new Date(todayForecast.sunriseTime).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "N/A",
      set: todayForecast.sunsetTime
        ? new Date(todayForecast.sunsetTime).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "N/A",
    },
    moon: {
      rise: "N/A",
      set: "N/A",
      phase: todayForecast.moonPhase
        ? getMoonPhase(todayForecast.moonPhase)
        : "Unknown",
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
  const index = Math.round((phase / 4) * (phases.length - 1));
  return phases[Math.min(index, phases.length - 1)];
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
