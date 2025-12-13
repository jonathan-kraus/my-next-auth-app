// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { locationLabels } from "@/lib/weather/locationLabels";
import { WeatherData, ApiResponse } from "@/lib/weather/types";

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
      <main className="min-h-screen bg-linear-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Animated background circles */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center text-white relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-8xl mb-6"
          >
            🌤️
          </motion.div>
          <h2 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-linear-to-r from-white to-blue-100">
            App Monitor
          </h2>
          <p className="text-2xl mb-8 text-blue-100 font-light">
            Weather • Logs • Analytics
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/api/auth/signin"
              className="inline-block px-10 py-4 bg-white text-indigo-600 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-2xl shadow-black/20"
            >
              Sign In to Continue →
            </Link>
          </motion.div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="text-7xl mb-4"
          >
            🌤️
          </motion.div>
          <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 mb-3">
            Weather Dashboard
          </h1>
          <p className="text-xl text-gray-300">
            Real-time weather for all monitored locations
          </p>
        </motion.div>

        {/* Quick Stats */}
        {!loading && weatherData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-linear-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-2xl p-6"
            >
              <div className="text-sm text-blue-100 mb-2 font-semibold">
                📍 Locations
              </div>
              <div className="text-5xl font-bold text-white">
                {weatherData.length}
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-linear-to-br from-orange-500 to-red-500 rounded-2xl shadow-2xl p-6"
            >
              <div className="text-sm text-orange-100 mb-2 font-semibold">
                🌡️ Average Temp
              </div>
              <div className="text-5xl font-bold text-white">
                {Math.round(
                  weatherData.reduce(
                    (sum, w) => sum + w.current.temperature,
                    0,
                  ) / weatherData.length,
                )}
                <span className="text-3xl">°F</span>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-linear-to-br from-purple-500 to-pink-500 rounded-2xl shadow-2xl p-6"
            >
              <div className="text-sm text-purple-100 mb-2 font-semibold">
                🕐 Last Updated
              </div>
              <div className="text-2xl font-bold text-white">
                {new Date().toLocaleTimeString()}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-64 space-y-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="text-7xl"
            >
              ⏳
            </motion.div>
            <p className="text-xl text-gray-400">Loading weather data...</p>
          </motion.div>
        )}

        {/* Weather Cards Grid */}
        {!loading && weatherData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {weatherData.map((weather, index) => (
              <motion.div
                key={weather.location}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -10 }}
              >
                <h3>{locationLabels[weather.location].name}</h3>
                <Link href="/weather">
                  <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl p-8 hover:shadow-purple-500/20 transition-all cursor-pointer border border-purple-500/20 backdrop-blur-sm">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-sm text-gray-400 flex items-center gap-2">
                          {locationLabels[weather.location].flag}
                        </p>
                      </div>
                      <motion.div
                        className="text-6xl"
                        animate={{
                          rotate:
                            weather.current.windSpeed > 10 ? [0, -5, 5, 0] : 0,
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {weather.current.condition.includes("Clear")
                          ? "☀️"
                          : weather.current.condition.includes("Cloud")
                            ? "☁️"
                            : weather.current.condition.includes("Rain")
                              ? "🌧️"
                              : weather.current.condition.includes("Snow")
                                ? "❄️"
                                : "🌤️"}
                      </motion.div>
                    </div>

                    <div className="mb-6">
                      <div className="text-6xl font-bold text-white mb-2">
                        {weather.current.temperature}°
                      </div>
                      <div className="text-lg text-purple-300 font-medium mb-1">
                        {weather.current.condition}
                      </div>
                      <div className="text-sm text-gray-400">
                        Feels like {weather.current.feelsLike}°
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                        <div className="text-xs text-gray-400 mb-1">
                          💧 Humidity
                        </div>
                        <div className="text-xl font-bold text-blue-300">
                          {weather.current.humidity}%
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                        <div className="text-xs text-gray-400 mb-1">
                          💨 Wind
                        </div>
                        <div className="text-xl font-bold text-cyan-300">
                          {weather.current.windSpeed} mph
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                        <div className="text-xs text-gray-400 mb-1">
                          ☀️ UV Index
                        </div>
                        <div className="text-xl font-bold text-yellow-300">
                          {weather.current.uvIndex}
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                        <div className="text-xs text-gray-400 mb-1">
                          🌪️ Pressure
                        </div>
                        <div className="text-xl font-bold text-purple-300">
                          {Math.round(weather.current.pressure)}
                        </div>
                      </div>
                    </div>

                    {weather.isCached && (
                      <div className="mt-4 text-xs text-gray-500 italic flex items-center gap-1">
                        📦 Cached
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-8xl mb-6">🌍</div>
            <h3 className="text-3xl font-bold text-gray-300 mb-4">
              No weather data available
            </h3>
            <Link
              href="/weather"
              className="text-purple-400 hover:text-purple-300 font-semibold text-lg"
            >
              Go to Weather Page →
            </Link>
          </motion.div>
        )}
      </div>
    </main>
  );
}
