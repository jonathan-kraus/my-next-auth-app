import { NextResponse } from 'next/server';
import { createRequestId } from '@/lib/uuidj';
import { appLog } from '@/utils/app-log';

export async function GET(request: Request) {
  const requestId = createRequestId();

  try {
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

    // Fetch consumption history
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
    const apiUrl = `https://console.neon.tech/api/v2/consumption_history/projects?from=${encodeURIComponent(
      oneWeekAgo.toISOString()
    )}&to=${encodeURIComponent(now.toISOString())}&limit=10&granularity=hourly`;

    const response = await fetch(apiUrl, {
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

    // Extract metrics from projects
    const projects = data.projects ?? [];
    const metrics = projects.map((p: any) => ({
      id: p.id,
      name: p.name,
      activeTimeHours: +(p.active_time / 3600).toFixed(2),
      cpuHours: +(p.cpu_used_sec / 3600).toFixed(2),
      storageMB: +(p.synthetic_storage_size / 1024 / 1024).toFixed(2),
    }));

    await appLog({
      source: 'app/api/neon-consumption/route.ts',
      message: 'Fetched consumption metrics from Neon API',
      metadata: {
        stage: 'success',
        requestId,
        projectCount: projects.length,
        metricsSummary: metrics,
      },
    });

    return NextResponse.json({ success: true, projects, metrics });
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
