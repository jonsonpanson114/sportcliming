import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaInstance: PrismaClient;

export const getPrisma = () => {
  if (prismaInstance) return prismaInstance;
  if (globalForPrisma.prisma) {
    prismaInstance = globalForPrisma.prisma;
    return prismaInstance;
  }

  let dbUrl = process.env.DATABASE_URL;
  
  // Build-time guard: Next.js pre-rendering might try to call this during build
  // when DATABASE_URL is not yet available, causing it to bake in 'undefined'.
  if (!dbUrl || dbUrl === 'undefined' || dbUrl === '') {
    if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.VERCEL) {
       console.warn('[Database] Skipping initialization during build/missing env phase.');
       // We throw a plain error that we can catch, but let's be more descriptive
       throw new Error(`[Database] Missing DATABASE_URL (detected in phase: ${process.env.NEXT_PHASE || 'unknown'})`);
    }
    dbUrl = 'file:./dev.db';
  }
  
  const authToken = process.env.DATABASE_AUTH_TOKEN;

  try {
    const libsql = createClient({
      url: dbUrl,
      authToken: authToken,
    });

    const adapter = new PrismaLibSql(libsql as any);

    prismaInstance = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaInstance;
    return prismaInstance;
  } catch (error) {
    console.error('Prisma Initialization Error:', error);
    throw error;
  }
};

// Everyone must use getPrisma() to ensure proper initialization on Vercel
