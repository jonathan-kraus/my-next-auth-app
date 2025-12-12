// lib/weather/tomorrow-io.ts
import { appLog } from "@/utils/app-log";
import { WeatherData } from "./types";
import { createRequestId } from '../uuidj';
const requestId = createRequestId();
const API_KEY = process.env.TOMORROW_API_KEY!;
const BASE_URL = "https://api.tomorrow.io/v4/timelines";

function getMoonPhaseDescription(phase: number): string {
  if (phase === 0 || phase === 1) return "🌑 New Moon";
  if (phase < 0.25) return "🌒 Waxing Crescent";
  if (phase === 0.25) return "🌓 First Quarter";
  if (phase < 0.5) return "🌔 Waxing Gibbous";
  if (phase === 0.5) return "🌕 Full Moon";
  if (phase < 0.75) return "🌖 Waning Gibbous";
  if (phase === 0.75) return "🌗 Last Quarter";
  return "🌘 Waning Crescent";
}

// Utility: format time in Eastern
const formatTime = (timeString?: string): string => {
  if (!timeString) return "N/A";
  return new Date(timeString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/New_York",
  });
};

// Utility: determine if sun/moon is up and countdown if close to change
function getIndicator(
  riseTime?: string,
  setTime?: string,
  now: Date = new Date(),
): { status: "Up" | "Down"; countdown?: string } {
  if (!riseTime || !setTime) return { status: "Down" };

  const rise = new Date(riseTime);
  const set = new Date(setTime);

  // Convert "now" into Eastern for comparison
  const nowEastern = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" }),
  );

  if (nowEastern >= rise && nowEastern < set) {
    // It's up
    const diffMs = set.getTime() - nowEastern.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin <= 15) {
      return { status: "Up", countdown: `Sets in ${diffMin} minutes` };
    }
    return { status: "Up" };
  } else {
    // It's down
    const diffMs = rise.getTime() - nowEastern.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin > 0 && diffMin <= 15) {
      return { status: "Down", countdown: `Rises in ${diffMin} minutes` };
    }
    return { status: "Down" };
  }
}

export async function fetchTomorrowIO(location: {
  name: string;
  displayName: string;
  lat: number;
  lon: number;
  flag?: string;
}): Promise<WeatherData> {
  const params = {
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
      // Astronomy fields
      "sunriseTime",
      "sunsetTime",
      "moonriseTime",
      "moonsetTime",
      "moonPhase",
    ],
    units: "imperial",
    timesteps: ["current", "1d"],
    timezone: "America/New_York",
  };

  const response = await fetch(`${BASE_URL}?apikey=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  await appLog({
    source: "lib/weather/tomorrow-io.ts",
    message: "---tomorrow invoked---",
    metadata: { response: response, requestId: requestId },
  });
  if (!response.ok) {
    throw new Error(`Tomorrow.io API error: ${response.statusText}`);
  }

  const data = await response.json();
  const currentData = data.data.timelines.find(
    (t: any) => t.timestep === "current",
  );
  const dailyData = data.data.timelines.find((t: any) => t.timestep === "1d");

  if (!currentData?.intervals?.[0]) {
    throw new Error("No current weather data available");
  }

  const current = currentData.intervals[0].values;
  const daily = dailyData?.intervals?.[0]?.values || {};
console.log("Astronomy raw vs formatted:", {
  rawSunrise: daily.sunriseTime,
  formattedSunrise: formatTime(daily.sunriseTime),
});
  console.log("Astronomy raw vs formatted:", {
    rawSunset: daily.sunsetTime,
    formattedSunset: formatTime(daily.sunsetTime),
  });
  console.log("Astronomy raw vs formatted:", {
    rawMoonrise: daily.moonriseTime,
    formattedMoonrise: formatTime(daily.moonriseTime),
  });
  console.log("Astronomy raw vs formatted:", {
    rawMoonset: daily.moonsetTime,
    formattedMoonset: formatTime(daily.moonsetTime),
  });
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

  return {
    location,
    current: {
      temperature: Math.round(current.temperature),
      feelsLike: Math.round(current.temperatureApparent),
      humidity: Math.round(current.humidity),
      windSpeed: Math.round(current.windSpeed),
      windGust: Math.round(current.windGust || 0),
      windDirection: Math.round(current.windDirection),
      pressure: Math.round(current.pressureSeaLevel),
      uvIndex: Math.round(current.uvIndex),
      visibility: Math.round(current.visibility),
      cloudCover: Math.round(current.cloudCover),
      condition: weatherCodeMap[current.weatherCode] || "Unknown",
    },
    astronomy: {
      sunrise: formatTime(daily.sunriseTime) ?? "N/A",
      sunset: formatTime(daily.sunsetTime) ?? "N/A",
      moonrise: formatTime(daily.moonriseTime),
      moonset: formatTime(daily.moonsetTime),
      moonPhase: daily.moonPhase || 0,
      sunIndicator: getIndicator(daily.sunriseTime, daily.sunsetTime),
      moonIndicator: getIndicator(daily.moonriseTime, daily.moonsetTime),
      moonPhaseDescription: getMoonPhaseDescription(daily.moonPhase || 0),
    },
    isCached: false,
    lastUpdated: new Date().toISOString(),
  };
}
