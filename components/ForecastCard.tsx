'use client';

import { motion } from 'framer-motion';
import type { WeatherData } from '@/lib/weather/types';

interface ForecastCardProps {
  forecast: WeatherData['forecast'];
}

const getWeatherEmoji = (condition: string) => {
  const emoji: Record<string, string> = {
    Clear: '☀️',
    'Mostly Clear': '🌤️',
    Cloudy: '☁️',
    'Mostly Cloudy': '⛅',
    'Partly Cloudy': '⛅',
    Hazy: '🌫️',
    Foggy: '🌫️',
    'Light Rain': '🌦️',
    Rain: '🌧️',
    'Heavy Rain': '⛈️',
    'Freezing Rain': '🧊',
    'Ice Pellets': '🧊',
    Snow: '❄️',
    'Heavy Snow': '🌨️',
    Thunderstorm: '⛈️',
    Drizzle: '🌦️',
    Flurries: '🌨️',
  };
  return emoji[condition] || '🌡️';
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

export function ForecastCard({ forecast }: ForecastCardProps) {
  if (!forecast?.daily || forecast.daily.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-gradient-to-br from-blue-400 via-cyan-400 to-teal-300 rounded-3xl p-6 shadow-xl"
    >
      <h2 className="text-2xl font-bold text-white mb-6">
        {forecast.daily.length}-Day Forecast
      </h2>

      <div className="space-y-3">
        {forecast.daily.map((day, index) => (
          <motion.div
            key={day.date}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
            className="flex items-center justify-between p-4 bg-white/90 backdrop-blur-sm rounded-xl hover:shadow-md transition-shadow"
          >
            <div className="flex-1 min-w-[120px]">
              <div className="font-semibold text-gray-800">
                {formatDate(day.date)}
              </div>
            </div>

            <div className="flex items-center gap-3 flex-1 justify-center">
              <motion.div
                className="text-3xl"
                whileHover={{ scale: 1.2, rotate: 10 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {getWeatherEmoji(day.condition)}
              </motion.div>
              <div className="text-sm text-gray-600 hidden sm:block">
                {day.condition}
              </div>
            </div>

            <div className="flex items-center gap-4 flex-1 justify-end">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">H:</span>
                <span className="font-bold text-red-600">{day.high}°</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">L:</span>
                <span className="font-bold text-blue-600">{day.low}°</span>
              </div>
            </div>

            {day.precipitation > 0 && (
              <div className="ml-4 text-sm text-blue-600 flex items-center gap-1">
                <span>💧</span>
                <span>{day.precipitation}%</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
