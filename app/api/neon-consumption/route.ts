// app/api/neon-consumption/route.ts
import { NextResponse } from 'next/server';
import { createRequestId } from '@/lib/uuidj';
import { appLog } from '@/utils/app-log';

export async function GET(request: Request) {
  const requestId = createRequestId();

  try {
    // INIT log: every request gets one
    await appLog({
      source: 'app/api/neon-consumption/route.ts',
      message: 'Route invoked',
      metadata: { stage: 'init', requestId },
    });

    const apiKey = process.env.NEON_API_KEY;
    if (!apiKey) {
      await appLog({
        source: 'app/api/neon-consumption/route.ts',
        message: 'Missing NEON_API_KEY',
        metadata: { stage: 'error', requestId },
      });
      return NextResponse.json(
        { error: 'NEON_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Neon fetch
    const response = await fetch('https://console.neon.tech/api/v2/projects', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      await appLog({
        source: 'app/api/neon-consumption/route.ts',
        message: 'Neon API error',
        metadata: {
          stage: 'error',
          status: response.status,
          details: errorText,
          requestId,
        },
      });
      return NextResponse.json(
        { error: 'Neon API error', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    // SUCCESS log
    await appLog({
      source: 'app/api/neon-consumption/route.ts',
      message: 'Neon API success',
      metadata: {
        stage: 'success',
        itemCount: data.items?.length || 0,
        requestId,
      },
    });

    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    await appLog({
      source: 'app/api/neon-consumption/route.ts',
      message: 'Unhandled error',
      metadata: {
        stage: 'error',
        error: error instanceof Error ? error.message : String(error),
        requestId,
      },
    });
    return NextResponse.json(
      { error: 'Failed to fetch consumption metrics' },
      { status: 500 }
    );
  }
}

await appLog({
  source: 'app/api/neon-consumption/route.ts',
  message: '---neon info invoked---',
  metadata: {
    action: 'create',
  },
});
