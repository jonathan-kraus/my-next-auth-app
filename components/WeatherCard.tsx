// app/components/WeatherCard.tsx
"use client";

import { motion } from "framer-motion";
import { WeatherData } from "@/lib/weather/types";

interface WeatherCardProps {
  data: WeatherData;
  isLoading?: boolean;
}

export function WeatherCard({ data, isLoading = false }: WeatherCardProps) {
  const getWeatherEmoji = (condition: string) => {
    const emoji: Record<string, string> = {
      Clear: "☀️",
      "Mostly Clear": "🌤️",
      Cloudy: "☁️",
      "Mostly Cloudy": "⛅",
      "Partly Cloudy": "⛅",
      Hazy: "🌫️",
      Foggy: "🌫️",
      "Light Rain": "🌦️",
      Rain: "🌧️",
      "Heavy Rain": "⛈️",
      "Freezing Rain": "🧊",
      "Ice Pellets": "🧊",
      Snow: "❄️",
      "Heavy Snow": "🌨️",
      Thunderstorm: "⛈️",
    };
    return emoji[condition] || "🌡️";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-linear-to-br from-blue-400 to-cyan-500 rounded-3xl p-8 text-white shadow-xl"
    >
      {/* Location */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-sm opacity-90 mb-4"
      >
        {data.location.displayName}
      </motion.div>

      {/* Main Temperature */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <div className="text-6xl font-bold">{data.current.temperature}°F</div>
          <div className="text-lg opacity-90">
            Feels like {data.current.feelsLike}°F
          </div>
        </div>
        <div className="text-8xl">
          {getWeatherEmoji(data.current.condition)}
        </div>
      </motion.div>

      {/* Condition */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-semibold mb-8"
      >
        {data.current.condition}
      </motion.div>

      {/* Details Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 gap-4"
      >
        <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
          <div className="text-sm opacity-75">Humidity</div>
          <div className="text-2xl font-semibold">{data.current.humidity}%</div>
        </div>
        <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
          <div className="text-sm opacity-75">Wind Speed</div>
          <div className="text-2xl font-semibold">
            {data.current.windSpeed} mph
          </div>
        </div>
        <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
          <div className="text-sm opacity-75">Wind Gust</div>
          <div className="text-2xl font-semibold">
            {data.current.windGust} mph
          </div>
        </div>
        <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
          <div className="text-sm opacity-75">UV Index</div>
          <div className="text-2xl font-semibold">{data.current.uvIndex}</div>
        </div>
      </motion.div>

      {/* Cache indicator */}
      {data.isCached && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-xs opacity-75 text-center"
        >
          ⚠️ Using cached data (refreshed 15 min ago)
        </motion.div>
      )}
    </motion.div>
  );
}
