// scripts/test-prisma.ts
import { PrismaClient } from "@/src/generated/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import dotenv from "dotenv";
import db from "../lib/db";

dotenv.config();
const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });
async function main() {
  const rows = await db.jtemp.findMany();
  console.log("jtemp rows:", rows);
}

main()
  .catch((e) => {
    console.error("Error querying jtemp:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
