'use client';

import { BodyIndicator } from '@/lib/weather/types';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

interface AstronomyData {
  sunrise: string;
  sunset: string;
  moonrise: string | null;
  moonset: string | null;
  moonPhase: number;
  moonPhaseDescription?: string;
  rawSunrise?: string;
  rawSunset?: string;
  rawMoonrise?: string;
  rawMoonset?: string;
  sunIndicator?: BodyIndicator; // This now matches your actual type
  moonIndicator?: BodyIndicator; // This now matches your actual type
}

interface AstroWidgetProps {
  astronomy: AstronomyData;
}

export function AstroWidget({ astronomy }: AstroWidgetProps) {
  const now = new Date();

  const formatTime = (isoString?: string) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/New_York',
    });
  };

  const getDuration = (riseISO?: string, setISO?: string) => {
    if (!riseISO || !setISO) return 'N/A';
    const rise = new Date(riseISO);
    const set = new Date(setISO);
    const diff = set.getTime() - rise.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} hrs ${mins} mins`;
  };

  const getProgress = (riseISO: string, setISO: string, current: Date) => {
    const rise = new Date(riseISO);
    const set = new Date(setISO);
    const total = set.getTime() - rise.getTime();
    const elapsed = current.getTime() - rise.getTime();
    return Math.max(0, Math.min(100, (elapsed / total) * 100));
  };

  const sunProgress =
    astronomy.rawSunrise && astronomy.rawSunset
      ? getProgress(astronomy.rawSunrise, astronomy.rawSunset, now)
      : 0;

  const moonProgress =
    astronomy.rawMoonrise && astronomy.rawMoonset
      ? getProgress(astronomy.rawMoonrise, astronomy.rawMoonset, now)
      : 0;

  const sunIsUp = astronomy.sunIndicator?.status === 'Up';
  const moonIsUp = astronomy.moonIndicator?.status === 'Up';

  const formatDisplayTime = (isoString?: string) => {
    if (!isoString) return { time: 'N/A', period: '' };
    const formatted = formatTime(isoString);
    const parts = formatted.split(' ');
    return { time: parts[0], period: parts[1] || '' };
  };

  const sunrise = formatDisplayTime(astronomy.rawSunrise);
  const sunset = formatDisplayTime(astronomy.rawSunset);
  const moonrise = formatDisplayTime(astronomy.rawMoonrise);
  const moonset = formatDisplayTime(astronomy.rawMoonset);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Sun Card */}
      <div className="bg-slate-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-white text-lg font-medium mb-6">Sun</h3>

        {/* Arc Visualization */}
        <div className="relative h-32 mb-6">
          {/* Horizon Line */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-600" />

          {/* Arc Background */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100">
            <defs>
              <linearGradient
                id="sunGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#ff6b6b" />
                <stop offset="100%" stopColor="#c06cff" />
              </linearGradient>
            </defs>
            <path
              d="M 10 90 Q 100 10, 190 90"
              fill="none"
              stroke="url(#sunGradient)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Progress Indicator */}
            {sunIsUp && astronomy.rawSunrise && astronomy.rawSunset && (
              <motion.circle
                cx={10 + (180 * sunProgress) / 100}
                cy={90 - Math.sin((sunProgress / 100) * Math.PI) * 80}
                r="6"
                fill="white"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </svg>

          {/* Start Marker (Sunrise) */}
          <div className="absolute bottom-0 left-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                sunIsUp ? 'bg-white' : 'bg-slate-600'
              }`}
            >
              <Sun
                className={`w-5 h-5 ${sunIsUp ? 'text-slate-800' : 'text-slate-400'}`}
              />
            </div>
          </div>

          {/* End Marker (Sunset) */}
          <div className="absolute bottom-0 right-2">
            <div
              className={`w-8 h-8 rounded-full ${
                sunIsUp ? 'bg-slate-600' : 'bg-white'
              }`}
            />
          </div>
        </div>

        {/* Duration */}
        <div className="text-center mb-4">
          <p className="text-white font-medium">
            {getDuration(astronomy.rawSunrise, astronomy.rawSunset)}
          </p>
        </div>

        {/* Times */}
        <div className="flex justify-between items-end">
          <div>
            <p className="text-3xl font-bold text-white">{sunrise.time}</p>
            <p className="text-sm text-gray-400">{sunrise.period} Sunrise</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">{sunset.time}</p>
            <p className="text-sm text-gray-400">{sunset.period} Sunset</p>
          </div>
        </div>
      </div>

      {/* Moon Card */}
      <div className="bg-slate-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-white text-lg font-medium mb-6">Moon</h3>

        {astronomy.rawMoonrise && astronomy.rawMoonset ? (
          <>
            {/* Arc Visualization */}
            <div className="relative h-32 mb-6">
              {/* Horizon Line */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-600" />

              {/* Arc Background */}
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 200 100"
              >
                <defs>
                  <linearGradient
                    id="moonGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#ff9f43" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>
                <path
                  d="M 10 90 Q 100 10, 190 90"
                  fill="none"
                  stroke="url(#moonGradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                {/* Progress Indicator */}
                {moonIsUp && (
                  <motion.circle
                    cx={10 + (180 * moonProgress) / 100}
                    cy={90 - Math.sin((moonProgress / 100) * Math.PI) * 80}
                    r="6"
                    fill="white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </svg>

              {/* Start Marker (Moonrise) */}
              <div className="absolute bottom-0 left-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    moonIsUp ? 'bg-white' : 'bg-slate-600'
                  }`}
                >
                  <Moon
                    className={`w-5 h-5 ${moonIsUp ? 'text-slate-800' : 'text-slate-400'}`}
                  />
                </div>
              </div>

              {/* End Marker (Moonset) */}
              <div className="absolute bottom-0 right-2">
                <div
                  className={`w-8 h-8 rounded-full ${
                    moonIsUp ? 'bg-slate-600' : 'bg-white'
                  }`}
                />
              </div>
            </div>

            {/* Duration */}
            <div className="text-center mb-4">
              <p className="text-white font-medium">
                {getDuration(astronomy.rawMoonrise, astronomy.rawMoonset)}
              </p>
            </div>

            {/* Times */}
            <div className="flex justify-between items-end">
              <div>
                <p className="text-3xl font-bold text-white">{moonrise.time}</p>
                <p className="text-sm text-gray-400">
                  {moonrise.period} Moonrise
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{moonset.time}</p>
                <p className="text-sm text-gray-400">
                  {moonset.period} Moonset
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">Moon data unavailable</p>
          </div>
        )}
      </div>
    </div>
  );
}
