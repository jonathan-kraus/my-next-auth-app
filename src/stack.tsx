console.log("Stack Project ID:", process.env.NEXT_PUBLIC_STACK_PROJECT_ID);
export const stackServerApp = new StackServerApp({
  projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID!,
  tokenStore: "nextjs-cookie",
});