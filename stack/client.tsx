import { StackClientApp } from "@stackframe/stack";

export const stackClientApp = new StackClientApp({
  projectId: "e58ed77b-32d6-412e-9c56-1cb7e6ffd2a4", // from Stack dashboard
  tokenStore: "nextjs-cookie", // ✅ keep this
});
