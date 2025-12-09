// lib/dbFetch.ts
import  db  from "../lib/db";

type DbClient = typeof db;

type DbArgs = {
  db: DbClient;
};

export async function dbFetch<T>(
  fn: (args: DbArgs) => Promise<T>,
): Promise<T> {
  return fn({ db });
}
