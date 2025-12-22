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

  // const res = await fetch(`${BASE_URL}?apikey=${TOMORROW_API_KEY}`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(body),
  //   cache: 'no-store',
  // });
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: TOMORROW_API_KEY!,
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();

  const intervals = json?.data?.timelines?.[0]?.intervals ?? [];

  for (const interval of intervals) {
    const { sunriseTime, sunsetTime, moonriseTime, moonsetTime, moonPhase } =
      interval.values ?? {};

    console.log('DAY:', interval.startTime);
    console.log('ASTRO NORMALIZED', {
      sunrise: sunriseTime,
      sunset: sunsetTime,
      moonrise: moonriseTime,
      moonset: moonsetTime,
      moonPhase,
    });
  }

  return NextResponse.json({
    success: true,
    data: {
      sunrise: sunriseTime,
      sunset: sunsetTime,
      moonrise: moonriseTime,
      moonset: moonsetTime,
      moonPhase,
    },
  });
}
