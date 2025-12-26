import { WeatherData, LocationKey } from '@/lib/weather/types';

export function mapTomorrowIOToWeatherData(
  raw: any,
  locationKey: LocationKey,
  isCached: boolean,
  timestamp: string
): WeatherData {
  return {
    location: locationKey,
    isCached,
    lastUpdated: timestamp,
    current: raw.current,
    forecast: raw.forecast,
    astronomy: {
      ...raw.astronomy,
    },
  };
}
