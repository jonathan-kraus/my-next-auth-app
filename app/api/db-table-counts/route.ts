// app/api/db-table-counts/route.ts
import { NextResponse } from 'next/server';
import { dbFetch } from '@/lib/dbFetch';

type RawRow = {
  schema_name: string;
  table_name: string;
  estimated_row_count: bigint;
};

type SerializableRow = {
  schema_name: string;
  table_name: string;
  estimated_row_count: number; // or string if you prefer
};

export async function GET() {
  const rows = await dbFetch(({ db }) =>
    db.$queryRawUnsafe<RawRow[]>(`
      SELECT
        n.nspname::text     AS schema_name,
        c.relname::text     AS table_name,
        c.reltuples::bigint AS estimated_row_count
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relkind = 'r'
        AND n.nspname NOT IN ('pg_catalog', 'information_schema')
        AND c.reltuples >= 10           -- exclude very small tables
      ORDER BY schema_name, table_name;
    `)
  );

  const serializable: SerializableRow[] = rows.map((r) => ({
    schema_name: r.schema_name,
    table_name: r.table_name,
    estimated_row_count: Number(r.estimated_row_count),
  }));

  return NextResponse.json(serializable);
}
