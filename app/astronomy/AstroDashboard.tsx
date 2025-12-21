'use client';

import { Sun, Moon } from 'lucide-react';

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
      {/* Sun card */}
      <div className="bg-slate-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-white text-sm mb-4">Sun</h3>

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
        />
      </div>

      {/* Moon card */}
      <div className="bg-slate-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-white text-sm mb-4">Moon</h3>

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
        />
      </div>

      {/* Moon phase card */}
      <div className="bg-slate-800 rounded-2xl p-6 shadow-lg flex flex-col">
        <h3 className="text-white text-sm mb-4">Moon phase</h3>
        <div className="flex-1 flex items-center">
          <div className="flex items-center gap-6">
            {/* Simple phase graphic: 0 = new, 0.5 = full */}
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
    </div>
  );
}

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
}) {
  const [riseTime, risePeriod] = props.riseTime.split(' ');
  const [setTime, setPeriod] = props.setTime.split(' ');

  return (
    <>
      <div className="relative h-28 mb-4">
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
          <path
            d="M 10 90 Q 100 10, 190 90"
            fill="none"
            stroke={`url(#${props.gradientId})`}
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
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
          <p className="text-2xl font-semibold text-white">{riseTime}</p>
          <p className="text-xs text-slate-300">
            {risePeriod} {props.riseLabel}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold text-white">{setTime}</p>
          <p className="text-xs text-slate-300">
            {setPeriod} {props.setLabel}
          </p>
        </div>
      </div>
    </>
  );
}
