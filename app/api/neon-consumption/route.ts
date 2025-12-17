// app/api/neon-basic/route.ts
import { NextResponse } from 'next/server';
import { createRequestId } from '@/lib/uuidj';
import { appLog } from '@/utils/app-log';
import { db } from '@/lib/db';
import { number } from 'zod';

export async function GET(request: Request) {
  const requestId = createRequestId();

  try {
    await appLog({
      source: 'app/api/neon-basic/route.ts',
      message: 'Basic Neon route invoked',
      metadata: { stage: 'init', request: request, requestId: requestId },
    });

    const apiKey = process.env.NEON_API_KEY;
    if (!apiKey) {
      await appLog({
        source: 'app/api/neon-basic/route.ts',
        message: 'Missing NEON_API_KEY',
        metadata: { stage: 'error', requestId },
      });
      return NextResponse.json(
        { error: 'NEON_API_KEY not configured' },
        { status: 500 }
      );
    }
    const activeResult = await db.$queryRaw<{ count: bigint }[]>`
  SELECT count(*)::bigint AS count 
  FROM pg_stat_activity 
  WHERE state = 'active'
`;

    const idleResult = await db.$queryRaw<{ count: bigint }[]>`
  SELECT count(*)::bigint AS count 
  FROM pg_stat_activity 
  WHERE state = 'idle'
`;

    const activeConnections = Number(activeResult[0].count);
    const idleConnections = Number(idleResult[0].count);
    await appLog({
      source: 'app/api/neon-basic/route.ts',
      message: 'Neon connection data fetched',
      metadata: {
        activeConnections: activeConnections,
        idleConnections: idleConnections,
        stage: 'fetched',
        requestId,
      },
    });
    // Fetch projects (works on free plans)
    const response = await fetch('https://console.neon.tech/api/v2/projects', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      await appLog({
        source: 'app/api/neon-basic/route.ts',
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
    const projects = data.projects ?? [];

    // Extract basic metrics
    const metrics = projects.map((p: any) => ({
      id: p.id,
      name: p.name,
      activeTimeHours: +(p.active_time / 3600).toFixed(2),
      cpuHours: +(p.cpu_used_sec / 3600).toFixed(2),
      storageGB: +(p.storage_size / 1024 / 1024 / 1024).toFixed(2),
      storageMB: +(p.synthetic_storage_size / 1024 / 1024).toFixed(2),
      lastActive: p.compute_last_active_at,
      activeConnections: activeConnections,
      idleConnections: idleConnections,
    }));

    await appLog({
      source: 'app/api/neon-basic/route.ts',
      message: 'Fetched basic Neon project metrics',
      metadata: {
        stage: 'success',
        requestId,
        projectCount: projects.length,
        idleConnections,
        activeConnections,
      },
    });

    return NextResponse.json({ success: true, projects, metrics });
  } catch (error) {
    await appLog({
      source: 'app/api/neon-basic/route.ts',
      message: 'Unhandled error',
      metadata: {
        stage: 'error',
        error: error instanceof Error ? error.message : String(error),
        requestId,
      },
    });
    return NextResponse.json(
      { error: 'Failed to fetch basic Neon metrics' },
      { status: 500 }
    );
  }
}
