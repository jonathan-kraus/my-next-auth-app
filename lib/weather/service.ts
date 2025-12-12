// lib/weather/service.ts
import db from "../db";
import {
  LOCATIONS,
  LOCATIONS_BY_KEY,
  LocationKey,
  WeatherData,
} from "@/lib/weather/types";

const TOMORROW_IO_API_KEY =
  process.env.TOMORROW_API_KEY ?? process.env.TOMORROW_IO_API_KEY ?? "";
const BASE_URL = "https://api.tomorrow.io/v4/timelines";
const MAX_AGE_MS = 15 * 60 * 1000; // 15 minutes

if (!TOMORROW_IO_API_KEY) {
  console.warn("TOMORROW API key env var is not set");
}

// ---- DB helpers ------------------------------------------------------------

async function getCachedRaw(locationKey: LocationKey) {
  return db.weatherCache.findFirst({
    where: { location: locationKey },
    orderBy: { createdAt: "desc" },
  });
}

async function saveCachedRaw(locationKey: LocationKey, raw: any) {
  await db.weatherCache.upsert({
    where: { location: locationKey },
    update: {
      data: raw,
      // updatedAt auto-updates via @updatedAt
    },
    create: {
      location: locationKey,
      data: raw,
    },
  });
}

// ---- External API ----------------------------------------------------------

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
      "sunriseTime",
      "sunsetTime",
      "moonriseTime",
      "moonsetTime",
      "moonPhase",
      "rawSunrise",
      "rawSunset",
      "rawMoonrise",
      "rawMoonset",
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

  const res = await fetch(`${BASE_URL}?apikey=${TOMORROW_IO_API_KEY}`, {
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

// ---- Mapping ---------------------------------------------------------------

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

const formatTime = (timeString?: string): string => {
  if (!timeString) return "N/A";
  return new Date(timeString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/New_York",
  });
};

function mapTomorrowIOToWeatherData(
  rawData: any,
  locationKey: LocationKey,
  isCached: boolean,
  lastUpdatedIso: string,
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
      sunrise: formatTime(dailyValues.sunriseTime),
      sunset: formatTime(dailyValues.sunsetTime),
      moonrise: formatTime(dailyValues.moonriseTime),
      moonset: formatTime(dailyValues.moonsetTime),
      moonPhase: dailyValues.moonPhase ?? 0,
    },
    forecast: {
      hourly,
      daily,
    },
    isCached,
    lastUpdated: lastUpdatedIso,
  };
}

// ---- Public API ------------------------------------------------------------

export async function getWeather(
  locationKey: LocationKey,
): Promise<WeatherData> {
  const cached = await getCachedRaw(locationKey);

  // If we have fresh DB data, use it immediately
  if (cached) {
    const ageMs = Date.now() - cached.createdAt.getTime();
    if (ageMs < MAX_AGE_MS) {
      console.log("[weather] serving from WeatherCache", {
        locationKey,
        ageMs,
      });
      return mapTomorrowIOToWeatherData(
        cached.data,
        locationKey,
        true,
        cached.createdAt.toISOString(),
      );
    }
  }

  // Otherwise, try live API and store the result
  try {
    const raw = await fetchFromTomorrowIO(locationKey);
    await saveCachedRaw(locationKey, raw);

    const nowIso = new Date().toISOString();
    console.log("[weather] served live and cached", { locationKey });

    return mapTomorrowIOToWeatherData(raw, locationKey, false, nowIso);
  } catch (error) {
    console.error("[weather] live fetch failed, falling back to cache", {
      locationKey,
      message: error instanceof Error ? error.message : String(error),
    });

    if (cached) {
      // Fallback: serve stale cache rather than 500
      return mapTomorrowIOToWeatherData(
        cached.data,
        locationKey,
        true,
        cached.createdAt.toISOString(),
      );
    }

    throw error;
  }
}

export async function getAllWeather(): Promise<WeatherData[]> {
  const keys = LOCATIONS.map((l) => l.name) as LocationKey[];
  const results: WeatherData[] = [];

  for (const key of keys) {
    const data = await getWeather(key);
    results.push(data);
  }

  return results;
}
