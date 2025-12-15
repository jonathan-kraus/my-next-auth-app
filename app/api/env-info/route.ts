// app/api/env-info/route.ts
import { NextResponse } from 'next/server';
import { createRequestId } from '@/lib/uuidj';
import { appLog } from '@/utils/app-log';
import { neon } from '@neondatabase/serverless';

console.log('DB module loaded');

export async function checkDbConnection() {
  if (!process.env.DATABASE_URL) {
    return 'No DATABASE_URL environment variable';
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const countWeatherLog =
      await sql`SELECT COUNT(*)::int as count FROM "WeatherLog"`;

    await appLog({
      source: 'app/api/env-info/route.ts',
      message: '---env-info invoked---',
      metadata: {
        action: 'create',
        CWL: countWeatherLog[0].count,
      },
    });

    return countWeatherLog[0].count;
  } catch (error) {
    console.error('DB connection error:', error);
    return null;
  }
} // ✅ Close checkDbConnection function

export async function GET() {
  const requestId = createRequestId();
  console.log('Env-info route checking DB connection');

  // Parse database URL to get host (safely)
  let dbHost = 'N/A';
  let dbName = 'N/A';
  let weatherLogCount = null;

  if (process.env.DATABASE_URL) {
    console.log('Parsing DATABASE_URL for host and name');
    try {
      const url = new URL(process.env.DATABASE_URL);
      dbHost = url.hostname;
      dbName = url.pathname.slice(1); // Remove leading slash

      // Query WeatherLog count
      const sql = neon(process.env.DATABASE_URL);
      const result = await sql`SELECT COUNT(*)::int as count FROM "WeatherLog"`;
      weatherLogCount = result[0]?.count ?? null;
      await appLog({
        source: 'app/api/env-info/route.ts',
        message: '---DB host check---',
        requestId: requestId,
        metadata: {
          action: 'check',
          dbHost: dbHost,
          dbName: dbName,
        },
      });
    } catch {
      dbHost = 'Unable to parse';
      weatherLogCount = null;
    }
  }

  await appLog({
    source: 'app/api/env-info/route.ts',
    message: '---DB check---',
    requestId: requestId,
    metadata: {
      action: 'create',
      CWL: weatherLogCount,
    },
  });

  const envInfo = {
    deploymentUrl: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : typeof window !== 'undefined'
        ? window.location.origin
        : 'localhost',
    environment:
      process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
    vercelRegion: process.env.VERCEL_REGION || 'N/A',
    gitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'N/A',
    gitCommitMessage: process.env.VERCEL_GIT_COMMIT_MESSAGE || 'N/A',
    gitCommitAuthor: process.env.VERCEL_GIT_COMMIT_AUTHOR_NAME || 'N/A',
    VERCEL_DEPLOYMENT_ID: process.env.VERCEL_DEPLOYMENT_ID || 'N/A',
    VERCEL_GIT_PROVIDER: process.env.VERCEL_GIT_PROVIDER || 'N/A',
    VERCEL_GIT_REPO_SLUG: process.env.VERCEL_GIT_REPO_SLUG || 'N/A',
    VERCEL_GIT_REPO_OWNER: process.env.VERCEL_GIT_REPO_OWNER || 'N/A',
    databaseHost: dbHost,
    databaseName: dbName,
    weatherLogCount,
  };

  await appLog({
    source: 'app/api/env-info/route.ts',
    message: '---vercel info---',
    metadata: {
      action: 'view',
      environment: envInfo.environment,
      region: envInfo.vercelRegion,
      dbHost: dbHost,
      gitSha: envInfo.gitCommitSha,
      CWL: weatherLogCount,
    },
  });

  return NextResponse.json(envInfo);
} // ✅ Close GET function
