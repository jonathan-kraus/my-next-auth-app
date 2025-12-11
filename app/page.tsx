// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { WeatherData, ApiResponse, LOCATIONS } from "@/lib/weather/types";

export default function Home() {
  const { data: session } = useSession();
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllWeather() {
      try {
        const response = await fetch("/api/weather/all");
        if (!response.ok) throw new Error("Failed to fetch weather");

        const data: ApiResponse<WeatherData[]> = await response.json();
        if (data.success && data.data) {
          setWeatherData(data.data);
        }
      } catch (error) {
        console.error("Failed to load weather:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAllWeather();
  }, []);

  if (!session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-blue-400 via-blue-500 to-indigo-600 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-white"
        >
          <h1 className="text-6xl font-bold mb-4">🌤️</h1>
          <h2 className="text-4xl font-bold mb-6">App Monitor</h2>
          <p className="text-xl mb-8 opacity-90">
            Sign in to access weather forecasts and monitoring tools
          </p>
          <Link
            href="/api/auth/signin"
            className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Sign In
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-2">
            🌤️ Weather Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Real-time weather for all monitored locations
          </p>
        </motion.div>

        {/* Quick Stats */}
        {!loading && weatherData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-sm text-gray-600 mb-1">Locations</div>
              <div className="text-3xl font-bold text-blue-600">
                {weatherData.length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-sm text-gray-600 mb-1">Average Temp</div>
              <div className="text-3xl font-bold text-orange-600">
                {Math.round(
                  weatherData.reduce(
                    (sum, w) => sum + w.current.temperature,
                    0,
                  ) / weatherData.length,
                )}
                °F
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-sm text-gray-600 mb-1">Last Updated</div>
              <div className="text-lg font-semibold text-gray-800">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="flex justify-center items-center h-64"
          >
            <div className="text-6xl">⏳</div>
          </motion.div>
        )}

        {/* Weather Cards Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {weatherData.map((weather, index) => (
              <motion.div
                key={weather.location.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href="/weather">
                  <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {weather.location.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {weather.location.flag}
                        </p>
                      </div>
                      <div className="text-4xl">
                        {weather.current.condition.includes("Clear")
                          ? "☀️"
                          : weather.current.condition.includes("Cloud")
                            ? "☁️"
                            : weather.current.condition.includes("Rain")
                              ? "🌧️"
                              : weather.current.condition.includes("Snow")
                                ? "❄️"
                                : "🌤️"}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-5xl font-bold text-gray-800">
                        {weather.current.temperature}°
                      </div>
                      <div className="text-gray-600">
                        {weather.current.condition}
                      </div>
                      <div className="text-sm text-gray-500">
                        Feels like {weather.current.feelsLike}°
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Humidity</div>
                        <div className="font-semibold">
                          {weather.current.humidity}%
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Wind</div>
                        <div className="font-semibold">
                          {weather.current.windSpeed} mph
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">UV Index</div>
                        <div className="font-semibold">
                          {weather.current.uvIndex}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Pressure</div>
                        <div className="font-semibold">
                          {Math.round(weather.current.pressure)} mb
                        </div>
                      </div>
                    </div>

                    {weather.isCached && (
                      <div className="mt-4 text-xs text-gray-400 italic">
                        📦 Cached data
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* No Data State */}
        {!loading && weatherData.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌍</div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              No weather data available
            </h3>
            <Link
              href="/weather"
              className="text-blue-600 hover:underline font-medium"
            >
              Go to Weather Page →
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
