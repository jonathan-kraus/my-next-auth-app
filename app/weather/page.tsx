'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WeatherCard } from '@/components/WeatherCard';
import { ForecastCard } from '@/components/ForecastCard';
import { useLogger } from '@/lib/axiom/client';
import { appLog } from '@/utils/app-log';
import toast from 'react-hot-toast';
import { sendWeather } from './actions';
import { LocationSelector } from '@/components/LocationSelector';
import {
  LocationKey,
  WeatherData,
  ApiResponse,
  BodyIndicator,
} from '@/lib/weather/types';

// --- Make Indicator Helper ---
type Indicator = {
  status: 'Up' | 'Down';
  countdown?: string;
  rawRise?: string;
  rawSet?: string;
};

function makeIndicator(
  startIso?: string,
  endIso?: string
): Indicator | undefined {
  if (!startIso || !endIso) return undefined;

  const now = Date.now();
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();

  const formatCountdown = (target: number) => {
    const diffMs = target - now;
    if (diffMs <= 0) return undefined;
    const totalMinutes = Math.floor(diffMs / 1000 / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  if (now < start) {
    return {
      status: 'Down',
      countdown: formatCountdown(start),
      rawRise: startIso,
      rawSet: endIso,
    };
  }

  if (now > end) {
    return {
      status: 'Down',
      countdown: undefined,
      rawRise: startIso,
      rawSet: endIso,
    };
  }
  // Body is up → countdown until set
  const diffMs = end - now;
  const totalMinutes = Math.floor(diffMs / 1000 / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const countdown = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  appLog({
    source: 'app/weather/page.tsx',
    message: 'Astronomy indicators start/end diff',
    metadata: { now, start, end, diffMs, hours, minutes, totalMinutes },
  });
  return {
    status: 'Up',
    countdown: formatCountdown(end),
    rawRise: startIso,
    rawSet: endIso,
  };
}
function showHourToast(label: string, hour: number, isUp: boolean) {
  toast(`${label} hour changed → ${hour}h remaining`, {
    icon: isUp ? '☀️' : '🌙',
    style: {
      background: isUp ? '#fef3c7' : '#e0e7ff', // yellow for sun, indigo for moon
      color: isUp ? '#92400e' : '#3730a3',
      fontWeight: 500,
    },
  });
}
// --- Countdown Timer Component ---
function CountdownTimer({
  label,
  indicator,
}: {
  label: string;
  indicator?: Indicator;
}) {
  const [current, setCurrent] = useState<Indicator | undefined>(indicator);
  const lastHourRef = useRef<number | null>(null);

  useEffect(() => {
    if (!indicator) return;

    const update = () => {
      const updated = makeIndicator(indicator.rawRise, indicator.rawSet);
      if (updated) {
        setCurrent(updated);

        if (updated.countdown) {
          const match = updated.countdown.match(/(\d+)h/);
          const hour = match ? parseInt(match[1], 10) : 0;

          if (lastHourRef.current !== null && hour !== lastHourRef.current) {
            showHourToast(label, hour, updated.status === 'Up');
          }
          lastHourRef.current = hour;
        }
      }
    };

    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, [indicator, label]);

  if (!current) return null;
  const isUp = current.status === 'Up';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`text-center text-lg font-medium mb-4 ${
        isUp ? 'text-yellow-700' : 'text-indigo-700'
      }`}
    >
      {label}: {isUp ? '🟢 Up' : '⚫️ Down'}
      <AnimatePresence mode="wait">
        {current.countdown && (
          <motion.span
            key={current.countdown} // ensures AnimatePresence animates on change
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.3 }}
            className="ml-2 text-sm text-gray-600"
          >
            {isUp
              ? `(${current.countdown} left)`
              : `(↑ in ${current.countdown})`}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function WeatherPage() {
  const logger = useLogger();
  const [selectedLocation, setSelectedLocation] = useState<LocationKey>('kop');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [sunIndicator, setSunIndicator] = useState<Indicator | undefined>();
  const [moonIndicator, setMoonIndicator] = useState<Indicator | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Load astronomy data from API
  useEffect(() => {
    async function loadAstronomy() {
      try {
        const res = await fetch('/api/astronomy/tomorrow');
        const json = await res.json();
        console.log('Astronomy data:', json);

        if (!json.success || !json.data) return;

        const { sunrise, sunset, moonrise, moonset } = json.data;

        // Calculate indicators
        setSunIndicator(makeIndicator(sunrise, sunset));
        setMoonIndicator(makeIndicator(moonrise, moonset));
        const jMin = Math.floor(
          (new Date(sunset).getTime() - new Date(sunrise).getTime()) / 60000
        );
        appLog({
          source: 'app/weather/page.tsx',
          message: 'Astronomy indicators loaded',
          metadata: {
            location: selectedLocation,
            sunIndicator: makeIndicator(sunrise, sunset),
            moonIndicator: makeIndicator(moonrise, moonset),
            sunrise: sunrise,
            jMin: jMin,
            sunset: sunset,
            moonrise: moonrise,
            moonset: moonset,
          },
        });
      } catch (err) {
        console.error('Failed to load astronomy data:', err);
      }
    }

    loadAstronomy();
  }, [selectedLocation]);

  const fetchWeather = useCallback(
    async (location: LocationKey, forceRefresh = false) => {
      setLoading(true);
      setError(null);
      const startTime = performance.now();

      try {
        logger.info('Fetching weather', { location, forceRefresh });

        const response = await fetch(
          `/api/weather?location=${location}&refresh=${forceRefresh ? 'true' : 'false'}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }

        const data: ApiResponse<WeatherData> = await response.json();

        if (data.success && data.data) {
          setWeatherData(data.data);
          setLastUpdate(new Date());

          logger.info('Weather data loaded successfully', {
            location,
            temperature: data.data.current.temperature,
            condition: data.data.current.condition,
            cached: data.cached,
            duration: Math.round(performance.now() - startTime),
          });

          appLog({
            source: 'app/weather/page.tsx',
            message: '[full] Weather data loaded',
            metadata: {
              location,
              cached: data.cached ?? false,
              timestamp: new Date().toISOString(),
              temperature: data.data.current.temperature,
              condition: data.data.current.condition,
              duration_ms: Math.round(performance.now() - startTime),
            },
          });
        } else if (data.cached) {
          logger.info('Weather data loaded from cache', {
            location,
            cached: data.cached,
            duration: Math.round(performance.now() - startTime),
          });
        } else {
          throw new Error(data.error || 'Unknown error');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);

        logger.error('Weather fetch failed', {
          location,
          error: errorMessage,
          duration: Math.round(performance.now() - startTime),
        });
      } finally {
        setLoading(false);
      }
    },
    [logger]
  );

  useEffect(() => {
    logger.info('Weather page loaded', { location: selectedLocation });
    fetchWeather(selectedLocation);
  }, [selectedLocation, logger, fetchWeather]);

  const handleRefresh = () => {
    logger.info('Manual refresh triggered', { location: selectedLocation });
    fetchWeather(selectedLocation, true);
  };

  const handleEmailWeather = async () => {
    if (!weatherData) {
      setEmailError('No weather data available to send');
      return;
    }

    setEmailLoading(true);
    setEmailError(null);
    setEmailSuccess(false);

    try {
      logger.info('Sending weather email', { location: selectedLocation });

      await sendWeather(weatherData, weatherData.location);

      console.log('[weather] email sent successfully');

      setEmailSuccess(true);
      logger.info('Weather email sent successfully', {
        location: selectedLocation,
      });

      // Clear success message after 5 seconds
      setTimeout(() => setEmailSuccess(false), 5000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setEmailError(errorMessage);

      logger.error('Email send failed', {
        location: selectedLocation,
        error: errorMessage,
      });
    } finally {
      setEmailLoading(false);
    }
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

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8 gap-4 flex-wrap"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={loading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '⏳ Refreshing...' : '🔄 Refresh Data'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleEmailWeather}
            disabled={emailLoading || !weatherData}
            className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {emailLoading ? '📧 Sending...' : '📧 Email Report'}
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

        {/* Email Error Message */}
        {emailError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-8"
          >
            ⚠️ Email Error: {emailError}
          </motion.div>
        )}

        {/* Email Success Message */}
        {emailSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg mb-8"
          >
            ✅ Weather report sent successfully!
          </motion.div>
        )}

        {/* Countdown Timers - Now display from sunIndicator/moonIndicator state */}
        {sunIndicator && (
          <CountdownTimer label="☀️ Sun" indicator={sunIndicator} />
        )}
        {moonIndicator && (
          <CountdownTimer label="🌙 Moon" indicator={moonIndicator} />
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
        {/* Forecast Card */}
        {weatherData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mt-6"
          >
            <ForecastCard data={weatherData} />
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
