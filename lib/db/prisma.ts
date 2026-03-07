import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl && process.env.NODE_ENV === 'production') {
  throw new Error('DATABASE_URL is not set in production');
}

const finalDbUrl = dbUrl || 'file:./dev.db';

if (process.env.NODE_ENV !== 'production') {
  console.log(`[Database] Connecting to: ${finalDbUrl.split('@').pop()}`);
}

const libsql = createClient({
  url: finalDbUrl,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const adapter = new PrismaLibSql(libsql as any);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
