// lib/dbFetch.ts
import db from "@/lib/db";
import { stackServerApp } from "@/stack/server";

type DbContext = {
  requestId?: string;
  requireUser?: boolean;
};

type DbClient = typeof db;

type DbArgs = {
  db: DbClient;
  user: { id: string } | null;
};

export async function dbFetch<T>(
  ctx: DbContext,
  fn: (args: DbArgs) => Promise<T>,
): Promise<T> {
  const user = await stackServerApp.getUser();
  if (ctx.requireUser && !user) {
    throw new Error("User authentication required.");
  }
  console.log(`Request ID: ${ctx.requestId}, User: ${user?.id ?? "Guest"}`);
  return fn({ db, user });
}
