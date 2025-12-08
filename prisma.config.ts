// prisma.config.ts
import "dotenv/config";
import db from "./lib/db";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
    },
  },
);
