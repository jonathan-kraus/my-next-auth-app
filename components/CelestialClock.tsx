'use client';

import { useState, useMemo, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
function StarField() {
  const [stars] = useState(() =>
    Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.8 + 0.2,
    }))
  );

  return (
    <svg className="w-full h-full">
      {stars.map((s) => (
        <circle
          key={s.id}
          cx={`${s.x}%`}
          cy={`${s.y}%`}
          r={s.size}
          fill="white"
          opacity={s.opacity}
        />
      ))}
    </svg>
  );
}

function SkyLayer({
  children,
  sunPct,
}: {
  children: React.ReactNode;
  sunPct: number;
}) {
  // sunPct = 0 at sunrise, 1 at sunset
  // We’ll use it to blend between gradients

  // Day → Sunset → Twilight → Night
  const gradient = (() => {
    if (sunPct < 0.25) {
      return 'from-sky-300 via-sky-200 to-sky-100'; // bright morning
    }
    if (sunPct < 0.5) {
      return 'from-sky-200 via-amber-200 to-rose-200'; // golden hour
    }
    if (sunPct < 0.75) {
      return 'from-indigo-300 via-purple-400 to-rose-300'; // twilight
    }
    return 'from-slate-900 via-slate-800 to-slate-900'; // night
  })();

  // Stars fade in after sunset
  const starOpacity = sunPct < 0.75 ? 0 : (sunPct - 0.75) / 0.25;

  return (
    <div className="relative w-[320px] h-[320px] rounded-full overflow-hidden shadow-xl">
      {/* Dynamic sky gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${gradient} transition-all duration-700`}
      />

      {/* Stars */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
        style={{ opacity: starOpacity }}
      >
        <StarField />
      </div>

      {/* Clock content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
export default function CelestialClock({
  sunrise,
  sunset,
  moonrise,
  moonset,
  moonPhase,
}: {
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  moonPhase: number;
}) {
  // Purity‑safe time state
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Convert ISO → timestamp
  const ts = (iso: string) => new Date(iso).getTime();

  const riseSun = ts(sunrise);
  const setSun = ts(sunset);
  const riseMoon = ts(moonrise);
  const setMoon = ts(moonset);

  // Progress through day/night
  const pctSun = clamp((now - riseSun) / (setSun - riseSun));
  const pctMoon = clamp((now - riseMoon) / (setMoon - riseMoon));

  // Convert progress → angle (0° at top, clockwise)
  const angleSun = pctSun * 360;
  const angleMoon = pctMoon * 360;

  // Convert angle → x,y on circle
  const sunPos = polar(angleSun, 120, 150, 150);
  const moonPos = polar(angleMoon, 120, 150, 150);

  // Poetic tooltip
  const poetic = buildPoeticTooltip(pctSun, now, setSun);

  // Moon phase mask (simple half‑moon)
  const moonMask = moonPhase <= 0.5 ? 'inset(0 50% 0 0)' : 'inset(0 0 0 50%)';

  return (
    <SkyLayer sunPct={pctSun}>
      <svg viewBox="0 0 300 300" className="w-full h-full">
        {/* Horizon shading */}
        <circle
          cx="150"
          cy="150"
          r="120"
          fill="rgba(0,0,0,0.35)"
          clipPath="inset(150px 0 0 0)"
        />

        {/* Daylight arc */}
        <path
          d={describeArc(150, 150, 120, 0, angleSun)}
          stroke="url(#sunGrad)"
          strokeWidth="6"
          fill="none"
          className="transition-all duration-700 ease-in-out"
        />

        {/* Moonlight arc */}
        <path
          d={describeArc(150, 150, 120, 0, angleMoon)}
          stroke="url(#moonGrad)"
          strokeWidth="4"
          fill="none"
          className="transition-all duration-700 ease-in-out"
        />

        {/* Sun glow */}
        <circle
          cx={sunPos.x}
          cy={sunPos.y}
          r="12"
          fill="white"
          className={`transition-all duration-700 ease-in-out ${
            pctSun > 0 && pctSun < 1 ? 'animate-pulse-slow' : ''
          }`}
        />

        {/* Sun icon */}
        <foreignObject
          x={sunPos.x - 12}
          y={sunPos.y - 12}
          width="24"
          height="24"
          className="transition-all duration-700 ease-in-out"
        >
          <div
            className={`w-6 h-6 flex items-center justify-center ${
              pctSun > 0 && pctSun < 1 ? 'opacity-100' : 'opacity-40 grayscale'
            }`}
          >
            <Sun className="text-yellow-300" />
          </div>
        </foreignObject>

        {/* Moon glow */}
        <circle
          cx={moonPos.x}
          cy={moonPos.y}
          r="10"
          fill="white"
          opacity="0.25"
          className="transition-all duration-700 ease-in-out"
        />

        {/* Moon icon with phase mask */}
        <foreignObject
          x={moonPos.x - 10}
          y={moonPos.y - 10}
          width="20"
          height="20"
          className="transition-all duration-700 ease-in-out"
        >
          <div
            className={`w-5 h-5 rounded-full bg-amber-300 relative ${
              pctMoon > 0 && pctMoon < 1
                ? 'opacity-100'
                : 'opacity-40 grayscale'
            }`}
            style={{ clipPath: moonMask }}
          >
            <Moon className="absolute inset-0 m-auto text-slate-800" />
          </div>
        </foreignObject>
      </svg>

      {/* Tooltip — now correctly inside SkyLayer */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="bg-slate-900 text-slate-200 text-xs whitespace-pre-line px-3 py-2 rounded-lg shadow-lg border border-slate-700">
          {poetic}
        </div>
      </div>
    </SkyLayer>
  );

  /* --------------------------------------------------
   Helpers
-------------------------------------------------- */

  function clamp(n: number) {
    return Math.min(Math.max(n, 0), 1);
  }

  function polar(angle: number, r: number, cx: number, cy: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  }

  function describeArc(
    cx: number,
    cy: number,
    r: number,
    start: number,
    end: number
  ) {
    const s = polar(start, r, cx, cy);
    const e = polar(end, r, cx, cy);
    const large = end - start <= 180 ? 0 : 1;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  function buildPoeticTooltip(pct: number, now: number, setTs: number) {
    const percent = Math.round(pct * 100);
    const msRemaining = setTs - now;
    const hrs = Math.max(0, Math.floor(msRemaining / 3_600_000));
    const mins = Math.max(0, Math.floor((msRemaining % 3_600_000) / 60_000));

    if (pct < 0.5) {
      return `The day is still young.\n${percent}% of light has passed.\nTwilight arrives in ${hrs}h ${mins}m.`;
    }

    return `The sun is past its peak.\n${percent}% of daylight has passed.\nTwilight arrives in ${hrs}h ${mins}m.`;
  }
}
