// components/WeatherCard.tsx
"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { WeatherData } from "@/lib/weather/types";
const getMoonPhaseEmoji = (phase: number): string => {
  if (phase === 0 || phase === 1) return "🌑 New Moon";
  if (phase < 0.25) return "🌒 Waxing Crescent";
  if (phase === 0.25) return "🌓 First Quarter";
  if (phase < 0.5) return "🌔 Waxing Gibbous";
  if (phase === 0.5) return "🌕 Full Moon";
  if (phase < 0.75) return "🌖 Waning Gibbous";
  if (phase === 0.75) return "🌗 Last Quarter";
  return "🌘 Waning Crescent";
};
interface WeatherCardProps {
  data: WeatherData;
  isLoading?: boolean;
}

// Move WindIndicator outside the component
const WindIndicator = ({
  isWindy,
  isVeryWindy,
}: {
  isWindy: boolean;
  isVeryWindy: boolean;
}) => {
  // Move useMemo BEFORE the early return - hooks must be called unconditionally
  const particles = useMemo(() => {
    const count = isVeryWindy ? 8 : 4;
    // Use a seeded approach instead of Math.random() for stable values
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      initialY: (i * 13.7 + 17) % 100, // Pseudo-random but stable
      animateY1: (i * 23.3 + 31) % 100,
      animateY2: (i * 41.1 + 53) % 100,
    }));
  }, [isVeryWindy]);

  if (!isWindy) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute text-2xl"
          initial={{
            x: -20,
            y: particle.initialY,
            opacity: 0.6,
          }}
          animate={{
            x: ["0%", "110%"],
            y: [`${particle.animateY1}%`, `${particle.animateY2}%`],
            rotate: [0, 360],
          }}
          transition={{
            duration: isVeryWindy ? 2 : 4,
            repeat: Infinity,
            delay: particle.id * (isVeryWindy ? 0.3 : 0.6),
            ease: "linear",
          }}
        >
          🍃
        </motion.div>
      ))}
    </div>
  );
};

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

  const isWindy = data.current.windSpeed > 10;
  const isVeryWindy = data.current.windSpeed > 20;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="relative bg-linear-to-br from-blue-400 to-cyan-500 rounded-3xl p-8 text-white shadow-xl overflow-hidden"
    >
      {/* Wind particles */}
      <WindIndicator isWindy={isWindy} isVeryWindy={isVeryWindy} />

      {/* Location */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-sm opacity-90 mb-4 relative z-10"
      >
        {data.location.displayName}
        {isWindy && (
          <motion.span
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="ml-2"
          >
            💨
          </motion.span>
        )}
      </motion.div>

      {/* Main Temperature */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={
          isWindy
            ? {
                scale: 1,
                x: [0, -3, 3, -3, 0],
                rotate: [0, -1, 1, -1, 0],
              }
            : { scale: 1 }
        }
        transition={
          isWindy
            ? {
                duration: isVeryWindy ? 0.5 : 1,
                repeat: Infinity,
                ease: "easeInOut",
              }
            : { delay: 0.2, type: "spring" }
        }
        className="flex items-center justify-between mb-6 relative z-10"
      >
        <div>
          <div className="text-6xl font-bold">{data.current.temperature}°F</div>
          <div className="text-lg opacity-90">
            Feels like {data.current.feelsLike}°F
          </div>
        </div>
        <motion.div
          className="text-8xl"
          animate={
            isWindy
              ? {
                  rotate: [-5, 5, -5],
                  scale: [1, 1.05, 1],
                }
              : {}
          }
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {getWeatherEmoji(data.current.condition)}
        </motion.div>
      </motion.div>

      {/* Condition */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-semibold mb-8 relative z-10"
      >
        {data.current.condition}
        {isVeryWindy && (
          <span className="ml-2 text-base bg-yellow-500/30 px-3 py-1 rounded-full">
            ⚠️ Very Windy
          </span>
        )}
      </motion.div>

      {/* Details Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 gap-4 relative z-10"
      >
        <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
          <div className="text-sm opacity-75">Humidity</div>
          <div className="text-2xl font-semibold">{data.current.humidity}%</div>
        </div>
        <motion.div
          className="bg-white/20 rounded-lg p-4 backdrop-blur-sm"
          animate={
            isWindy
              ? {
                  backgroundColor: [
                    "rgba(255,255,255,0.2)",
                    "rgba(255,255,255,0.3)",
                    "rgba(255,255,255,0.2)",
                  ],
                }
              : {}
          }
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="text-sm opacity-75 flex items-center gap-1">
            Wind Speed {isWindy && "💨"}
          </div>
          <div className="text-2xl font-semibold">
            {data.current.windSpeed} mph
          </div>
        </motion.div>
        <motion.div
          className="bg-white/20 rounded-lg p-4 backdrop-blur-sm"
          animate={
            isVeryWindy
              ? {
                  backgroundColor: [
                    "rgba(255,255,255,0.2)",
                    "rgba(255,200,0,0.3)",
                    "rgba(255,255,255,0.2)",
                  ],
                }
              : {}
          }
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="text-sm opacity-75">Wind Gust</div>
          <div className="text-2xl font-semibold">
            {data.current.windGust} mph
          </div>
        </motion.div>
        <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
          <div className="text-sm opacity-75">UV Index</div>
          <div className="text-2xl font-semibold">{data.current.uvIndex}</div>
        </div>
      </motion.div>

      {/* Astronomy Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 pt-6 border-t border-white/20"
      >
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs opacity-75 mb-1">🌅 Sunrise</div>
            <div className="text-lg font-semibold">
              {data.astronomy.sunrise}
            </div>
          </div>
          <div>
            <div className="text-xs opacity-75 mb-1">🌇 Sunset</div>
            <div className="text-lg font-semibold">{data.astronomy.sunset}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs opacity-75 mb-1">🌔 Moonrise</div>
            <div className="text-lg font-semibold">
              {data.astronomy.moonrise || "No rise today"}
            </div>
          </div>
          <div>
            <div className="text-xs opacity-75 mb-1">🌘 Moonset</div>
            <div className="text-lg font-semibold">
              {data.astronomy.moonset || "No set today"}
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-3 text-center">
          <div className="text-sm opacity-75 mb-1">Moon Phase</div>
          <div className="text-2xl font-bold">
            {getMoonPhaseEmoji(data.astronomy.moonPhase)}
          </div>
        </div>
      </motion.div>

      {/* Cache indicator */}
      {data.isCached && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-xs opacity-75 text-center relative z-10"
        >
          ⚠️ Using cached data (refreshed 15 min ago)
        </motion.div>
      )}
    </motion.div>
  );
}
