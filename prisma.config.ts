import { defineConfig } from "@prisma/config";
import path from "path";

// Fallback for CLI local runs
const defaultDbPath = path.resolve(process.cwd(), 'prisma', 'dev.db');
const dbUrl = process.env.DATABASE_URL || `file://${defaultDbPath}`;

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: dbUrl,
  },
});
