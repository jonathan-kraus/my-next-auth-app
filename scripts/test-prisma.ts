// scripts/test-prisma.ts
import { PrismaClient } from "@/src/generated/client";
import dotenv from "dotenv";
import db from "../lib/db";

dotenv.config();

async function main() {
  const rows = await db.jtemp.findMany();
  console.log("jtemp rows:", rows);
}

main()
  .catch((e) => {
    console.error("Error querying jtemp:", e);
  })
  .finally(async () => {
    await db.$disconnect();
  });
