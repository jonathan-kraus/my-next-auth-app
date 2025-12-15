// app/api/astronomy/route.ts
import { NextResponse } from 'next/server';

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
