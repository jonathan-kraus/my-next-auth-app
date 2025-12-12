// lib/weather/tomorrow-io.ts
import { WeatherData } from "./types";

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

  const formatTime = (isoString: string | null) => {
    if (!isoString) return null;
    return new Date(isoString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
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
      sunrise: daily.sunriseTime || "N/A",
      sunset: daily.sunsetTime || "N/A",
      moonrise: daily.moonriseTime,
      moonset: daily.moonsetTime,
      moonPhase: daily.moonPhase || 0,
    },
    isCached: false,
    lastUpdated: new Date().toISOString(),
  };
}
