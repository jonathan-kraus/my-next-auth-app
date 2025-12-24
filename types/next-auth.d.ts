// types/next-auth.d.ts
import type { Adapter } from 'next-auth/adapters';

declare module 'next-auth/adapters' {
  export interface Adapter {
    getAdapter?: () => Promise<Adapter>;
  }
}
