// app/api/test-log/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { dbFetch } from '@/lib/dbFetch';
import { safeMetadata } from '@/utils/safe-metadata';
import { stackServerApp } from '@/stack/server';
import { createRequestId } from '@/lib/uuidj';
import { appLog } from '@/utils/app-log';
import { triggerEmail } from '@/utils/triggerEmail';

export async function GET(request: NextRequest) {
  const requestId = createRequestId();
  const TEST_NAME = `TestUser-${Date.now()}`;
  const USER_ID = '70044dfe-d497-41d9-99ae-3d9e39761e6d'; // Melissa’s id

  // get current session user
  const session = await getServerSession(authOptions);
  console.log('Current session user:', session?.user);

  // or via your stackServerApp wrapper
  const user1 = await stackServerApp.getUser();
  console.log('Current user via stackServerApp:', user1);
  await appLog({
    source: 'app/api/test-log/route.ts',
    message: 'get user via stackServerApp',
    metadata: {
      userAgent: request.headers.get('User-Agent') || 'Unknown',
      ip: request.headers.get('X-Forwarded-For') || 'Unknown',
      user: session?.user
        ? { id: session.user.id, email: session.user.email }
        : null,
    },
  });
  // astronomy fetch
  async function fetchAstronomy() {
    const TOMORROW_API_KEY = process.env.TOMORROW_API_KEY;
    const BASE_URL = 'https://api.tomorrow.io/v4/timelines';
    const body = {
      location: [40.0913, -75.3802],
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
    });
    if (!res.ok)
      throw new Error(`Tomorrow.io API error: ${res.status} ${res.statusText}`);
    const data = await res.json();
    console.log(
      'Astronomy data:',
      data?.data?.timelines?.[0]?.intervals?.[0]?.values
    );
  }
  await fetchAstronomy();

  // send test email
  try {
    await triggerEmail(
      'in test-log route',
      requestId,
      `Subject here: ${TEST_NAME}`,
      `Created by ${USER_ID}\n\nTest content here.`
    );
  } catch (err) {
    console.error('Failed to send email:', err);
  }

  // write a log row
  const safeUser = user1 ? { id: user1.id, user1: user1 } : null;
  await dbFetch(({ db }) =>
    db.log.create({
      data: {
        userId: USER_ID,
        severity: 'info',
        source: 'test-log',
        message: 'Invoked /api/test-log',
        requestId,
        metadata: {
          userAgent: request.headers.get('User-Agent') || 'Unknown',
          action: 'write jtemp',
          ip:
            request.headers.get('X-Forwarded-For') ||
            request.headers.get('Remote-Addr') ||
            'Unknown',
          user: safeMetadata(user1),
        },
      },
    })
  );

  // create a jtemp row
  const jtemp = await dbFetch(({ db }) =>
    db.jtemp.create({
      data: {
        name: TEST_NAME,
        email: 'bob@Email.com',
      },
    })
  );
  console.log(`JTemp record created with ID: ${jtemp.id}`);

  return NextResponse.json({
    success: true,
    message: 'JTemp created and email sent',
  });
}
