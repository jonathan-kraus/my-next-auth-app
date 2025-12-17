// app/api/env-info/route.ts
import { NextResponse } from 'next/server';
import { createRequestId } from '@/lib/uuidj';
import { appLog } from '@/utils/app-log';
import { neon } from '@neondatabase/serverless';
import { env } from 'node:process';

console.log('DB module loaded');

export async function checkDbConnection() {
  if (!process.env.DATABASE_URL) {
    return 'No DATABASE_URL environment variable';
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const countWeatherLog = 7;
    //await sql`SELECT COUNT(*)::int as count FROM "Weather"`;

    await appLog({
      source: 'app/api/env-info/route.ts',
      message: '---env-info invoked---',
      metadata: {
        action: 'create',
        CWL: countWeatherLog,
      },
    });

    return countWeatherLog;
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
  console.log('About to parse DATABASE_URL for host and name');

  if (process.env.DATABASE_URL) {
    console.log('About to parse DATABASE_URL for host and name');
    console.log(
      'DATABASE_URL format:',
      process.env.DATABASE_URL?.substring(0, 20) + '...'
    );
    try {
      console.log('Step 1: Creating URL object'); // ✅ Add this
      const url = new URL(process.env.DATABASE_URL);
      console.log('Step 2: URL parsed successfully'); // ✅ Add this

      dbHost = url.hostname;
      dbName = url.pathname.slice(1);
      console.log('Step 3: Got hostname and dbname:', dbHost, dbName); // ✅ Add this

      console.log('Step 4: Creating Neon SQL client'); // ✅ Add this
      const sql = neon(process.env.DATABASE_URL);

      console.log('Step 5: Querying WeatherLog count'); // ✅ Add this
      const result =
        await sql`SELECT COUNT(*)::int as count FROM "WeatherCache"`;
      weatherLogCount = result[0]?.count ?? null;
      console.log('Step 6: Query completed, count:', weatherLogCount); // ✅ Add this
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
      dbName: dbName,
      gitSha: envInfo.gitCommitSha,
      envInfo: envInfo,

      CWL: weatherLogCount,
    },
  });

  return NextResponse.json(envInfo);
} // ✅ Close GET function
