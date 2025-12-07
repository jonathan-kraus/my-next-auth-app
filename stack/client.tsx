import { StackClientApp } from "@stackframe/stack";

export const stackClientApp = new StackClientApp({
  id: "project_e58ed77b-32d6-412e-9c56-1cb7e6ffd2a4", // from Stack dashboard
  name: "My NextAuth App", // optional, but useful
  providers: ["github"], // whatever you enabled
  tokenStore: "nextjs-cookie", // ✅ keep this
});
