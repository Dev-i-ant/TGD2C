import "dotenv/config";
import { defineConfig } from "prisma/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

// Use absolute path for SQLite database
const dbPath = path.resolve(process.cwd(), 'prisma', 'dev.db');
const dbUrl = `file://${dbPath}`;

console.log('[prisma.config.ts] Database URL:', dbUrl);

// New Prisma 6.6.0+ way: pass options directly to PrismaLibSql
const adapter = new PrismaLibSql({
  url: dbUrl,
});

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: 'node prisma/seed.js',
  },
  datasource: {
    adapter,
    url: dbUrl,
  },
} as any);
