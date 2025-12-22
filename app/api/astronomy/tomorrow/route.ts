// app/api/astronomy/route.ts
import { appLog } from '@/utils/app-log';
import { NextResponse } from 'next/server';
import { meta } from 'zod/v4/core';

const TOMORROW_API_KEY = process.env.TOMORROW_API_KEY;
const BASE_URL = 'https://api.tomorrow.io/v4/timelines';

export async function GET() {
  if (!TOMORROW_API_KEY) {
    return NextResponse.json(
      { error: 'TOMORROW_API_KEY not set' },
      { status: 500 }
    );
  }

  const body = {
    location: [40.0913, -75.3802], // KOP – adjust or parametrize later
    fields: [
      'sunriseTime',
      'sunsetTime',
      'moonriseTime',
      'moonsetTime',
      'moonPhase',
    ],
    timesteps: ['1d'],
    units: 'imperial',
    timezone: 'America/New_York',
  };

  const res = await fetch(`${BASE_URL}?apikey=${TOMORROW_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: `Tomorrow.io API error: ${res.status} ${res.statusText}` },
      { status: 500 }
    );
  }

  const data = await res.json();
  const daily = data?.data?.timelines?.[0]?.intervals?.[0]?.values ?? null;
  const next = data?.data?.timelines?.[1]?.intervals?.[1]?.values ?? null;
  const moonset = daily?.moonsetTime;
  console.log('Moonset time:', moonset);

  const moonrise = daily?.moonriseTime ?? next?.moonriseTime ?? null;
  const sunrise = daily?.sunriseTime ?? next?.sunriseTime ?? null;
  const sunset = daily?.sunsetTime ?? next?.sunsetTime ?? null;
  if (!moonset) {
    console.log('Moonset time not found in daily data, checking next data');
    const moonsetFinal = moonrise + 1000;
    console.log('Final moonset time:', moonsetFinal);
  }
  await appLog({
    source: 'app/api/env-info/route.ts',
    message: '---astro times received/fixed---',
    metadata: {
      daily: daily,
      next: next,
      moonset: moonset,
      sunset: sunset,
      moonrise: moonrise,
      sunrise: sunrise,
    },
  });
  return NextResponse.json({
    success: !!daily,
    data: daily
      ? {
          sunrise: daily.sunriseTime,
          sunset: daily.sunsetTime,
          moonrise: daily.moonriseTime,
          moonset: daily.moonsetTime,
          moonPhase: daily.moonPhase,
        }
      : null,
  });
}
