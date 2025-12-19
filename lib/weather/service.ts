// lib/weather/service.ts
import { db } from '../db';
import { appLog } from '@/utils/app-log';
import { createRequestId } from '@/lib/uuidj';

import {
  LOCATIONS,
  LOCATIONS_BY_KEY,
  LocationKey,
  WeatherData,
} from '@/lib/weather/types';

const TOMORROW_API_KEY = process.env.TOMORROW_API_KEY;
const BASE_URL = 'https://api.tomorrow.io/v4/timelines';
const MAX_AGE_MS = 15 * 60 * 1000; // 15 minutes

if (!TOMORROW_API_KEY) {
  console.warn('TOMORROW API key env var is not set');
}

// ---- Indicator helper ------------------------------------------------------

function computeIndicator(
  now: Date,
  rise?: Date | null,
  set?: Date | null
): { status: 'Up' | 'Down'; countdown?: string } {
  if (!rise || !set) {
    return { status: 'Down', countdown: undefined };
  }

  if (now >= rise && now < set) {
    // Body is above the horizon → time until it sets
    const diffMs = set.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / 1000 / 60);
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return {
      status: 'Up',
      countdown: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
    };
  } else {
    // Body is below the horizon → time until next rise
    const nextRise =
      now < rise ? rise : new Date(rise.getTime() + 24 * 60 * 60 * 1000);
    const diffMs = nextRise.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / 1000 / 60);
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return {
      status: 'Down',
      countdown: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
    };
  }
}

// ---- DB helpers ------------------------------------------------------------

async function getCachedRaw(locationKey: LocationKey) {
  return db.weatherCache.findFirst({
    where: { location: locationKey },
    orderBy: { createdAt: 'desc' },
  });
}

export async function saveCachedRaw(locationKey: LocationKey, raw: any) {
  // Find the daily timeline (not just raw.timelines.daily)
  const dailyTimeline = raw?.data?.timelines?.find(
    (t: any) => t.timestep === '1d'
  );
  const daily = dailyTimeline?.intervals?.[0]?.values;

  const now = new Date();

  // Debug: verify we found the daily data
  console.log('[weather] daily data check', {
    locationKey,
    hasDailyTimeline: !!dailyTimeline,
    hasDaily: !!daily,
    hasSunrise: !!daily?.sunriseTime,
    hasMoonrise: !!daily?.moonriseTime,
    sunriseRaw: daily?.sunriseTime,
    moonriseRaw: daily?.moonriseTime,
  });

  const sunrise = daily?.sunriseTime ? new Date(daily.sunriseTime) : null;
  const sunset = daily?.sunsetTime ? new Date(daily.sunsetTime) : null;
  const moonrise = daily?.moonriseTime ? new Date(daily.moonriseTime) : null;
  const moonset = daily?.moonsetTime ? new Date(daily.moonsetTime) : null;

  const sunIndicator = computeIndicator(now, sunrise, sunset);
  const moonIndicator = computeIndicator(now, moonrise, moonset);
  const requestId = `weather-save-${locationKey}-${now.getTime()}`;

  // Log with properly serialized dates
  await db.log.create({
    data: {
      userId: 'cmiz0p9ro000004ldrxgn3a1c',
      severity: 'info',
      source: 'weather service',
      message: 'Invoking service to save cached weather data',
      requestId,
      metadata: {
        action: 'Initializing cache save',
        sunrise: sunrise?.toISOString() ?? null,
        sunset: sunset?.toISOString() ?? null,
        moonrise: moonrise?.toISOString() ?? null,
        moonset: moonset?.toISOString() ?? null,
        location: locationKey,
        timestamp: new Date().toISOString(),
      },
    },
  });

  console.log('[weather] saving cached data', { locationKey, requestId });

  await db.weatherCache.upsert({
    where: { location: locationKey },
    update: {
      data: raw,
      sunrise,
      sunset,
      moonrise,
      moonset,
      moonPhase: daily?.moonPhase ?? null,
      sunStatus: sunIndicator.status,
      sunCountdown: sunIndicator.countdown,
      moonStatus: moonIndicator.status,
      moonCountdown: moonIndicator.countdown,
    },
    create: {
      location: locationKey,
      data: raw,
      sunrise,
      sunset,
      moonrise,
      moonset,
      moonPhase: daily?.moonPhase ?? null,
      sunStatus: sunIndicator.status,
      sunCountdown: sunIndicator.countdown,
      moonStatus: moonIndicator.status,
      moonCountdown: moonIndicator.countdown,
    },
  });
}

// WeatherLog helper
// Add this helper at the top of the file with other helpers
async function logWeatherFetch(
  locationKey: LocationKey,
  data: WeatherData,
  source: 'cache' | 'live'
) {
  try {
    // Get the cached record to access raw DateTime values
    const requestId = createRequestId();
    const cached = await db.weatherCache.findUnique({
      where: { location: locationKey },
    });

    await db.weatherLog.create({
      data: {
        location: locationKey,
        temperature: data.current.temperature,
        condition: data.current.condition,
        sunrise: cached?.sunrise ?? null,
        sunset: cached?.sunset ?? null,
        moonrise: cached?.moonrise ?? null,
        moonset: cached?.moonset ?? null,
        moonPhase: data.astronomy?.moonPhase ?? null,
        data: data as any,
        source: source,
      },
    });
    await appLog({
      source: 'lib/weather/service.ts',
      message: 'WeatherLog entry created',
      metadata: {
        stage: 'write',
        source: source,
        location: locationKey,
        requestId,
      },
    });
    console.log('[WEATHER LOG] Logged', locationKey, source);
  } catch (error) {
    console.error('[WEATHER LOG] Failed to log:', error);
  }
}

// ---- External API ----------------------------------------------------------

async function fetchFromTomorrowIO(locationKey: LocationKey): Promise<any> {
  const location = LOCATIONS_BY_KEY[locationKey];

  const body = {
    location: [location.lat, location.lon],
    fields: [
      'temperature',
      'temperatureMax', // ✅ Add this
      'temperatureMin', // ✅ Add this
      'temperatureApparent',
      'humidity',
      'windSpeed',
      'windGust',
      'windDirection',
      'pressureSeaLevel',
      'uvIndex',
      'visibility',
      'cloudCover',
      'weatherCode',
      'sunriseTime',
      'sunsetTime',
      'moonriseTime',
      'moonsetTime',
      'moonPhase',
    ],
    units: 'imperial',
    timesteps: ['current', '1h', '1d'],
    timezone: 'America/New_York',
  };

  console.log('[weather] calling Tomorrow.io', {
    locationKey,
    lat: location.lat,
    lon: location.lon,
  });

  const res = await fetch(`${BASE_URL}?apikey=${TOMORROW_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('[weather] Tomorrow.io error', {
      locationKey,
      status: res.status,
      statusText: res.statusText,
      body: text,
    });
    throw new Error(
      `Tomorrow.io API error (${locationKey}): ${res.status} ${res.statusText}`
    );
  }

  return res.json();
}

// ---- Mapping ---------------------------------------------------------------

const weatherCodeMap: Record<number, string> = {
  1000: 'Clear',
  1100: 'Mostly Clear',
  1101: 'Partly Cloudy',
  1102: 'Mostly Cloudy',
  1001: 'Cloudy',
  2000: 'Foggy',
  2100: 'Light Fog',
  4000: 'Drizzle',
  4001: 'Rain',
  4200: 'Light Rain',
  4201: 'Heavy Rain',
  5000: 'Snow',
  5001: 'Flurries',
  5100: 'Light Snow',
  5101: 'Heavy Snow',
  6000: 'Freezing Drizzle',
  6001: 'Freezing Rain',
  6200: 'Light Freezing Rain',
  6201: 'Heavy Freezing Rain',
  7000: 'Ice Pellets',
  7101: 'Heavy Ice Pellets',
  7102: 'Light Ice Pellets',
  8000: 'Thunderstorm',
};

const formatTime = (timeString?: string): string => {
  if (!timeString) return 'N/A';
  return new Date(timeString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/New_York',
  });
};

function mapTomorrowIOToWeatherData(
  rawData: any,
  locationKey: LocationKey,
  isCached: boolean,
  lastUpdatedIso: string
): WeatherData {
  const location = LOCATIONS_BY_KEY[locationKey];

  const timelines = rawData.data?.timelines ?? [];
  const currentTimeline = timelines.find((t: any) => t.timestep === 'current');
  const hourlyTimeline = timelines.find((t: any) => t.timestep === '1h');
  const dailyTimeline = timelines.find((t: any) => t.timestep === '1d');

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
      condition: weatherCodeMap[i.values.weatherCode] ?? 'Unknown',
      precipitation: Math.round(i.values.precipitationIntensity ?? 0),
    }));

  const daily = (dailyTimeline?.intervals ?? []).slice(0, 7).map((i: any) => ({
    date: i.startTime,
    high: Math.round(i.values.temperatureMax ?? i.values.temperature),
    low: Math.round(i.values.temperatureMin ?? i.values.temperature),
    condition: weatherCodeMap[i.values.weatherCode] ?? 'Unknown',
    precipitation: Math.round(i.values.precipitationIntensity ?? 0),
  }));

  return {
    location: locationKey,
    current: {
      temperature: Math.round(currentValues.temperature),
      timestamp: lastUpdatedIso,
      feelsLike: Math.round(currentValues.temperatureApparent),
      humidity: Math.round(currentValues.humidity),
      windSpeed: Math.round(currentValues.windSpeed),
      windGust: Math.round(currentValues.windGust ?? 0),
      windDirection: Math.round(currentValues.windDirection),
      pressure: Math.round(currentValues.pressureSeaLevel),
      uvIndex: Math.round(currentValues.uvIndex ?? 0),
      visibility: Math.round(currentValues.visibility ?? 0),
      cloudCover: Math.round(currentValues.cloudCover ?? 0),
      condition: weatherCodeMap[currentValues.weatherCode] ?? 'Unknown',
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

export async function getWeather(locationKey: LocationKey) {
  const cached = await db.weatherCache.findUnique({
    where: { location: locationKey },
  });

  // ✅ Add TTL check here
  const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

  if (cached) {
    const cacheAge = Date.now() - new Date(cached.updatedAt).getTime();

    if (cacheAge < CACHE_TTL_MS) {
      const mapped = mapTomorrowIOToWeatherData(
        cached.data,
        locationKey,
        true,
        cached.createdAt.toISOString()
      );

      // ✅ Enrich astronomy with Prisma fields
      if (mapped.astronomy) {
        mapped.astronomy.rawSunrise = cached.sunrise?.toISOString();
        mapped.astronomy.rawSunset = cached.sunset?.toISOString();
        mapped.astronomy.rawMoonrise = cached.moonrise?.toISOString();
        mapped.astronomy.rawMoonset = cached.moonset?.toISOString();
        mapped.astronomy.moonPhase = cached.moonPhase ?? 0;

        const now = new Date();
        mapped.astronomy.sunIndicator = computeIndicator(
          now,
          cached.sunrise,
          cached.sunset
        );
        mapped.astronomy.moonIndicator = computeIndicator(
          now,
          cached.moonrise,
          cached.moonset
        );
      }
      await logWeatherFetch(locationKey, mapped, 'cache');
      return mapped;
    }
  }

  // If no cache, fetch live from Tomorrow.io and save
  try {
    const raw = await fetchFromTomorrowIO(locationKey);
    await saveCachedRaw(locationKey, raw);

    const nowIso = new Date().toISOString();
    console.log('[weather] served live and cached', { locationKey });
    const mapped = mapTomorrowIOToWeatherData(raw, locationKey, false, nowIso);
    await logWeatherFetch(locationKey, mapped, 'live');
    return mapTomorrowIOToWeatherData(raw, locationKey, false, nowIso);
  } catch (error) {
    console.error('[weather] live fetch failed, no cache available', {
      locationKey,
      message: error instanceof Error ? error.message : String(error),
    });
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
