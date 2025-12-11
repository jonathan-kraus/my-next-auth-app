// app/api/db-table-counts/route.ts
import { NextResponse } from "next/server";
import { dbFetch } from "@/lib/dbFetch";

export async function GET() {
  const rows = await dbFetch(({ db }) =>
    db.$queryRawUnsafe<
      {
        schema_name: string;
        table_name: string;
        estimated_row_count: bigint;
      }[]
    >(`
      SELECT
        n.nspname           AS schema_name,
        c.relname           AS table_name,
        c.reltuples::bigint AS estimated_row_count
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relkind = 'r'
        AND n.nspname NOT IN ('pg_catalog', 'information_schema')
      ORDER BY schema_name, table_name;
    `),
  );

  return NextResponse.json(rows);
}
