import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaInstance: PrismaClient;

export const getPrisma = () => {
  // Build-time guard: NEVER initialize during build
  if (process.env.NEXT_PHASE === 'phase-production-build' || typeof window !== 'undefined') {
    return null as any;
  }

  if (prismaInstance) return prismaInstance;
  if (globalForPrisma.prisma) {
    prismaInstance = globalForPrisma.prisma;
    return prismaInstance;
  }

  let dbUrl = process.env.DATABASE_URL;
  
  const HARDCODED_URL = "libsql://spotcliming-jonsonpanson114.aws-ap-northeast-1.turso.io";

  if (!dbUrl || dbUrl === 'undefined' || dbUrl === '') {
    console.warn('[Database] DATABASE_URL is missing, using hardcoded fallback.');
    dbUrl = HARDCODED_URL;
  }
  
  const authToken = process.env.DATABASE_AUTH_TOKEN;

  try {
    const libsql = createClient({
      url: "libsql://spotcliming-jonsonpanson114.aws-ap-northeast-1.turso.io",
      authToken: process.env.DATABASE_AUTH_TOKEN,
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
