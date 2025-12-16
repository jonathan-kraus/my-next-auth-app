// app/api/log/route.ts
import { NextResponse } from 'next/server';
import { dbFetch } from '@/lib/dbFetch';
import { createRequestId } from '@/lib/uuidj';
import type { Prisma } from '@/src/generated';

type Body = {
  source?: string;
  message?: string;
  metadata?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
  severity?: 'info' | 'warn' | 'error';
  requestId?: string;
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Body;

  const {
    source = 'unknown',
    message = 'client log',
    metadata,
    severity = 'info',
    requestId = createRequestId(),
  } = body;

  await dbFetch(({ db }) =>
    db.log.create({
      data: {
        userId: 'cmiz0p9ro000004ldrxgn3a1c', // your fixed ID
        severity,
        source,
        message,
        requestId,
        metadata,
      },
    })
  );

  return NextResponse.json({ ok: true, requestId });
}
