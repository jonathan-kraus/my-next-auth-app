'use client';

import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createRequestId } from '@/lib/uuidj';
import { appLog } from '@/utils/app-log';
import CelestialClock from '../../components/CelestialClock';

/* --------------------------------------------------
   Utility Functions
-------------------------------------------------- */

function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

/* --------------------------------------------------
   AstroDashboard Component
-------------------------------------------------- */
type AstroApiData = {
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  moonPhase: number;
};

const TZ = 'America/New_York';

function toLocal(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: TZ,
  });
}

function duration(isoStart: string, isoEnd: string) {
  const start = new Date(isoStart).getTime();
  const end = new Date(isoEnd).getTime();
  const diff = end - start;
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return `${h} hrs ${m} mins`;
}

export default function AstroDashboard({ data }: { data: AstroApiData }) {
  const sunDuration = duration(data.sunrise, data.sunset);
  const moonDuration = duration(data.moonrise, data.moonset);

  const [now] = useState(() => Date.now());

  const sunUp =
    now >= new Date(data.sunrise).getTime() &&
    now <= new Date(data.sunset).getTime();

  const moonUp =
    now >= new Date(data.moonrise).getTime() &&
    now <= new Date(data.moonset).getTime();

  appLog({
    source: 'app/astronomy/AstroDashboard.tsx',
    message: 'Rendering AstroDashboard',
    requestId: createRequestId(),
    metadata: {
      sunIndicator: sunUp ? 'up' : 'down',
      moonIndicator: moonUp ? 'up' : 'down',
      sunDuration,
      moonDuration,
    },
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
      {/* Sun card */}
      <div className="bg-slate-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-white text-sm mb-4">Sun {sunUp ? 'up' : 'down'}</h3>

        <ArcCard
          gradientId="sunGradient"
          from="#ff6b6b"
          to="#c06cff"
          icon={<Sun className="w-5 h-5 text-slate-800" />}
          duration={sunDuration}
          riseLabel="Sunrise"
          setLabel="Sunset"
          riseTime={toLocal(data.sunrise)}
          setTime={toLocal(data.sunset)}
          isUp={sunUp}
        />
      </div>

      {/* Moon card */}
      <div className="bg-slate-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-white text-sm mb-4">
          Moon {moonUp ? 'up' : 'down'}
        </h3>

        <ArcCard
          gradientId="moonGradient"
          from="#ff9f43"
          to="#f97316"
          icon={<Moon className="w-5 h-5 text-slate-800" />}
          duration={moonDuration}
          riseLabel="Moonrise"
          setLabel="Moonset"
          riseTime={toLocal(data.moonrise)}
          setTime={toLocal(data.moonset)}
          isUp={moonUp}
        />
      </div>

      {/* Moon phase card */}
      <div className="bg-slate-800 rounded-2xl p-6 shadow-lg flex flex-col">
        <h3 className="text-white text-sm mb-4">Moon phase</h3>
        <div className="flex-1 flex items-center">
          <div className="flex items-center gap-6">
            <div className="relative w-28 h-28">
              <div className="absolute inset-0 rounded-full bg-slate-700" />
              <div
                className="absolute inset-0 rounded-full bg-amber-400"
                style={{
                  clipPath:
                    data.moonPhase <= 0.5
                      ? 'inset(0 50% 0 0)'
                      : 'inset(0 0 0 50%)',
                }}
              />
            </div>
            <div>
              <p className="text-3xl font-semibold text-white">
                {Math.round(data.moonPhase * 100)}%
              </p>
              <p className="text-sm text-slate-300">Phase of moon</p>
            </div>
          </div>
        </div>
      </div>
      <CelestialClock
        sunrise={data.sunrise}
        sunset={data.sunset}
        moonrise={data.moonrise}
        moonset={data.moonset}
        moonPhase={data.moonPhase}
      />
    </div>
  );
}

/* --------------------------------------------------
   ArcCard Component
-------------------------------------------------- */

function ArcCard(props: {
  gradientId: string;
  from: string;
  to: string;
  icon: React.ReactNode;
  duration: string;
  riseLabel: string;
  setLabel: string;
  riseTime: string;
  setTime: string;
  isUp: boolean;
}) {
  // Time state (purity‑safe)
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Parse rise/set into timestamps
  function parseTime(t: string) {
    const [time, period] = t.split(' ');
    const [hourStr, minuteStr] = time.split(':');
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;

    const d = new Date();
    d.setHours(hour, minute, 0, 0);
    return d.getTime();
  }

  const riseTs = parseTime(props.riseTime);
  const setTs = parseTime(props.setTime);

  // Progress percentage
  const pct = Math.min(Math.max((now - riseTs) / (setTs - riseTs), 0), 1);

  // Arc coordinates
  const startX = 10;
  const endX = 190;
  const x = startX + pct * (endX - startX);

  function bezierY(t: number) {
    const P0 = 90;
    const P1 = 10;
    const P2 = 90;
    return (1 - t) ** 2 * P0 + 2 * (1 - t) * t * P1 + t ** 2 * P2;
  }

  const y = bezierY(pct);

  // Tooltip poetic text
  const percent = Math.round(pct * 100);
  const msRemaining = setTs - now;
  const hrs = Math.max(0, Math.floor(msRemaining / 3_600_000));
  const mins = Math.max(0, Math.floor((msRemaining % 3_600_000) / 60_000));

  const poeticTooltip =
    pct < 0.5
      ? `The day is still young.\n${percent}% of light has passed.\nTwilight arrives in ${hrs}h ${mins}m.`
      : `The sun is past its peak.\n${percent}% of daylight has passed.\nTwilight arrives in ${hrs}h ${mins}m.`;

  // Icon style (grayscale + opacity when down)
  const iconStyle = props.isUp ? 'opacity-100' : 'opacity-40 grayscale';

  // Pulse animation only when up
  const pulseClass = props.isUp ? 'animate-pulse-slow' : '';

  return (
    <>
      <style jsx>{`
        .animate-pulse-slow {
          animation: pulseSlow 4s ease-in-out infinite;
        }
        @keyframes pulseSlow {
          0% {
            opacity: 0.25;
          }
          50% {
            opacity: 0.45;
          }
          100% {
            opacity: 0.25;
          }
        }
      `}</style>

      <div className="relative h-28 mb-4 group">
        {/* baseline */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-600" />

        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100">
          <defs>
            <linearGradient
              id={props.gradientId}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor={props.from} />
              <stop offset="100%" stopColor={props.to} />
            </linearGradient>
          </defs>

          {/* Arc */}
          <path
            d="M 10 90 Q 100 10, 190 90"
            fill="none"
            stroke={`url(#${props.gradientId})`}
            strokeWidth="4"
            strokeLinecap="round"
            className="transition-all duration-700 ease-in-out"
          />

          {/* Night shading */}
          {!props.isUp && (
            <path
              d="M 10 90 Q 100 10, 190 90"
              fill="none"
              stroke="rgba(0,0,0,0.4)"
              strokeWidth="6"
              strokeLinecap="round"
            />
          )}

          {/* Glow */}
          <circle
            cx={x}
            cy={y}
            r="10"
            fill="white"
            className={`transition-all duration-700 ease-in-out ${pulseClass}`}
          />

          {/* Icon marker */}
          <foreignObject
            x={x - 10}
            y={y - 10}
            width="20"
            height="20"
            className="transition-all duration-700 ease-in-out"
          >
            <div
              className={`w-5 h-5 flex items-center justify-center ${iconStyle}`}
            >
              {props.icon}
            </div>
          </foreignObject>

          {/* Baseline tick */}
          <rect
            x={x - 1}
            y={90}
            width="2"
            height="6"
            fill="white"
            opacity="0.6"
            className="transition-all duration-700 ease-in-out"
          />
        </svg>

        {/* Tooltip */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-slate-900 text-slate-200 text-xs whitespace-pre-line px-3 py-2 rounded-lg shadow-lg border border-slate-700">
            {poeticTooltip}
          </div>
        </div>

        {/* left marker */}
        <div className="absolute bottom-0 left-3">
          <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow">
            {props.icon}
          </div>
        </div>

        {/* right marker */}
        <div className="absolute bottom-0 right-3">
          <div className="w-7 h-7 bg-white rounded-full shadow" />
        </div>
      </div>

      <div className="text-center mb-4">
        <p className="text-slate-100 text-sm">{props.duration}</p>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <p className="text-2xl font-semibold text-white">{props.riseTime}</p>
          <p className="text-xs text-slate-300">{props.riseLabel}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold text-white">{props.setTime}</p>
          <p className="text-xs text-slate-300">{props.setLabel}</p>
        </div>
      </div>
    </>
  );
}
