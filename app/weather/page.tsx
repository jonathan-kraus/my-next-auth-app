"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WeatherCard } from "@/components/WeatherCard";
import { LocationSelector } from "@/components/LocationSelector";
import {
  LocationKey,
  WeatherData,
  ApiResponse,
  BodyIndicator,
} from "@/lib/weather/types";
import { useLogger } from "@/lib/axiom/client";

// --- Countdown Timer Component ---
function CountdownTimer({
  label,
  indicator,
}: {
  label: string;
  indicator?: BodyIndicator;
}) {
  const [countdown, setCountdown] = useState(indicator?.countdown);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(indicator?.countdown);
    }, 60_000);

    return () => clearInterval(interval);
  }, [indicator]);

  if (!indicator) return null;

  const isUp = indicator.status === "Up";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`text-center text-lg font-medium mb-4 ${
        isUp ? "text-yellow-700" : "text-indigo-700"
      }`}
    >
      {label}: {isUp ? "🟢 Up" : "⚫️ Down"}
      <AnimatePresence>
        {countdown && (
          <motion.span
            key="countdown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="ml-2 text-sm text-gray-600"
          >
            ({countdown})
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function WeatherPage() {
  const logger = useLogger();
  const [selectedLocation, setSelectedLocation] = useState<LocationKey>("kop");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchWeather = useCallback(
    async (location: LocationKey, forceRefresh = false) => {
      setLoading(true);
      setError(null);
      const startTime = performance.now();

      try {
        logger.info("Fetching weather", { location, forceRefresh });

        const response = await fetch(
          `/api/weather?location=${location}&refresh=${forceRefresh ? "true" : "false"}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch weather data");
        }

        const data: ApiResponse<WeatherData> = await response.json();

        if (data.success && data.data) {
          setWeatherData(data.data);
          setLastUpdate(new Date());

          logger.info("Weather data loaded successfully", {
            location,
            temperature: data.data.current.temperature,
            condition: data.data.current.condition,
            cached: data.cached,
            duration: Math.round(performance.now() - startTime),
          });

          logger.info("[debug] Astronomy indicators", {
            sun: data.data.astronomy.sunIndicator,
            moon: data.data.astronomy.moonIndicator,
          });
        } else if (data.cached) {
          logger.info("Weather data loaded from cache", {
            location,
            cached: data.cached,
            duration: Math.round(performance.now() - startTime),
          });
        } else {
          throw new Error(data.error || "Unknown error");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);

        logger.error("Weather fetch failed", {
          location,
          error: errorMessage,
          duration: Math.round(performance.now() - startTime),
        });
      } finally {
        setLoading(false);
      }
    },
    [logger],
  );

  // Initial fetch
  useEffect(() => {
    logger.info("Weather page loaded", { location: selectedLocation });
    fetchWeather(selectedLocation);
  }, [selectedLocation, logger, fetchWeather]);

  const handleRefresh = () => {
    logger.info("Manual refresh triggered", { location: selectedLocation });
    fetchWeather(selectedLocation, true);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-5xl font-bold text-gray-800 mb-2 text-center"
        >
          🌤️ Weather Forecast
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-gray-600 text-center mb-8"
        >
          Real-time weather updates and forecasts
        </motion.p>

        {/* Location Selector */}
        <LocationSelector
          selectedLocation={selectedLocation}
          onChange={setSelectedLocation}
        />

        {/* Refresh Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8 gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={loading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "⏳ Refreshing..." : "🔄 Refresh Data"}
          </motion.button>

          {lastUpdate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-gray-600 py-3"
            >
              Last updated: {lastUpdate.toLocaleTimeString()}
            </motion.div>
          )}
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-8"
          >
            ⚠️ {error}
          </motion.div>
        )}

        {/* Countdown Timer */}
        {weatherData && (
          <>
            <CountdownTimer
              label="☀️ Sun"
              indicator={weatherData.astronomy.sunIndicator}
            />
            <CountdownTimer
              label="🌙 Moon"
              indicator={weatherData.astronomy.moonIndicator}
            />
          </>
        )}

        {/* Weather Card */}
        {weatherData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <WeatherCard data={weatherData} isLoading={loading} />
          </motion.div>
        )}

        {/* Loading State */}
        {loading && !weatherData && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="flex justify-center items-center h-64"
          >
            <div className="text-6xl">⏳</div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
