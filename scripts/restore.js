const { PrismaClient } = require("@prisma/client");
const fs = require("fs");

const prisma = new PrismaClient();

async function restore() {
  // 1. Restore Users FIRST (due to foreign keys)
  const users = JSON.parse(fs.readFileSync("./users.json", "utf8"));
  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: user,
    });
  }
  console.log(`✅ Restored ${users.length} users`);

  const sessions = JSON.parse(fs.readFileSync("./sessions.json", "utf8"));
  for (const session of sessions) {
    await prisma.session.upsert({
      where: { id: session.id },
      update: {},
      create: session,
    });
  }
  console.log(`✅ Restored ${sessions.length} sessions`);

  const logs = JSON.parse(fs.readFileSync("./logs.json", "utf8"));
  for (const log of logs) {
    await prisma.log.upsert({
      where: { id: log.id },
      update: {},
      create: log,
    });
  }

  const jtemp = JSON.parse(fs.readFileSync("./jtemp.json", "utf8"));
  for (const item of jtemp) {
    await prisma.jtemp.upsert({
      where: { id: item.id },
      update: {},
      create: item,
    });
  }
  console.log(`✅ Restored ${jtemp.length} jtemp items`);

  const account = JSON.parse(fs.readFileSync("./accounts.json", "utf8"));
  for (const acc of account) {
    await prisma.account.upsert({
      where: { id: acc.id },
      update: {},
      create: acc,
    });
  }
  console.log(`✅ Restored ${account.length} accounts`);

  // 3. Restore other tables (log, etc.)
  // Repeat pattern for each file
}

restore()
  .then(() => console.log("🎉 Full restore complete!"))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
