import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import path from 'path'

// Use DATABASE_URL from environment or fallback to local path
const defaultDbPath = path.resolve(process.cwd(), 'prisma', 'dev.db');
const dbUrl = process.env.DATABASE_URL || `file://${defaultDbPath}`;

console.log('[Prisma] Initializing with database:', dbUrl);

// New Prisma 6.6.0+ way: pass options directly to PrismaLibSql, not a pre-created client
const adapter = new PrismaLibSql({
  url: dbUrl,
});

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
