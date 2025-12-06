// scripts/test-prisma.ts
import { PrismaClient } from '@/generated/client';

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.jtemp.findMany();
  console.log("jtemp rows:", rows);
}

main()
  .catch((e) => {
    console.error("Error querying jtemp:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
