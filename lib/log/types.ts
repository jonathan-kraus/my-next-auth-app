export type AppLogInput = {
  source: string;
  message: string;
  metadata?: unknown;
  severity?: 'info' | 'warn' | 'error';
  requestId?: string;
};
