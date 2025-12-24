import { auth } from '@/lib/auth';
import { appLog } from '@/utils/app-log';
import { createRequestId } from '@/lib/uuidj';
import { timeStamp } from 'node:console';

export async function GET() {
  //const session = await auth();
  const session = ' a';
  const requestId = createRequestId();
  if (!session) {
    await appLog({
      source: 'app/api/test-log/route.ts',
      message: '---NO USER---',
      requestId: requestId,
      metadata: {
        action: 'check',
        timeStamp: timeStamp(),
      },
    });
  }
  await appLog({
    source: 'app/api/test-log/route.ts',
    message: '---We have a user---',
    requestId: requestId,
    metadata: {
      action: 'check',
      //user: session?.user.email,
      timeStamp: timeStamp(),
    },
  });

  //return Response.json({ user: session?.user });
  return Response.json({ user: session });
}
