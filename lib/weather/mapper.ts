import { WeatherData, LocationKey } from './types';

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
