// app/logs/LocalTime.tsx
'use client';

import { format } from 'date-fns';

export function LocalTime({ value }: { value: string }) {
  return <span>{format(new Date(value), 'yyyy-MM-dd HH:mm:ss')}</span>;
}
