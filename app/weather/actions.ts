'use server';

import { sendWeatherEmail } from '@/lib/weather/sendWeatherEmail';
import { WeatherData } from '@/lib/weather/types';

/**
 * Server action to send a weather email.
 * Runs only on the server — safe to call from client components.
 */
export async function sendWeather(
  weatherData: WeatherData,
  selectedLocation: string
) {
  await sendWeatherEmail(weatherData, selectedLocation);
}
