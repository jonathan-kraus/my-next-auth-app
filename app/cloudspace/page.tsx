// app/cloudspace/page.tsx
import Cloudspace from '@/components/Cloudspace';
import { appLog } from '@/utils/app-log';
import { createRequestId } from '@/lib/uuidj';

console.log('[build] Generating /cloudspace page');

const requestId = createRequestId();
export default async function CloudspacePage() {
  await appLog({
    source: 'app/cloudspace/page.tsx',
    message: '---render cloudspace---',
    metadata: { action: 'view' },
  });
  console.log(`🚀 [${requestId}] /cloudspace page rendering`);

  return (
    <main className="p-6">
      <Cloudspace />
    </main>
  );
}
