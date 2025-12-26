import type { AppLogInput } from '@/lib/log/types';

export async function clientLog(input: AppLogInput) {
  try {
    await fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      keepalive: true,
    });
  } catch {
    // Logging must never break the UI
  }
}
