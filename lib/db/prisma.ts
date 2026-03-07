import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
const isRemote = dbUrl.startsWith('libsql://') || dbUrl.startsWith('https://');

if (process.env.NODE_ENV !== 'production') {
  console.log(`[Database] Connecting to: ${dbUrl.split('@').pop()} (Remote: ${isRemote})`);
}

const libsql = createClient({
  url: dbUrl,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

// The constructor takes the Client object directly in recent versions
const adapter = new PrismaLibSql(libsql as any);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: isRemote ? adapter : undefined,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
