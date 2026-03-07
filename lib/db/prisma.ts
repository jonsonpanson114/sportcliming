import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaInstance: PrismaClient | undefined;

const FALLBACK_URL = 'libsql://spotcliming-jonsonpanson114.aws-ap-northeast-1.turso.io';

function resolveDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) return FALLBACK_URL;

  const normalized = raw.replace(/^['"]|['"]$/g, '');
  if (!normalized || normalized.toLowerCase() === 'undefined' || normalized.toLowerCase() === 'null') {
    return FALLBACK_URL;
  }

  const isValidScheme =
    normalized.startsWith('libsql://') ||
    normalized.startsWith('file:') ||
    normalized.startsWith('http://') ||
    normalized.startsWith('https://');

  return isValidScheme ? normalized : FALLBACK_URL;
}

export const getPrisma = () => {
  if (process.env.NEXT_PHASE === 'phase-production-build' || typeof window !== 'undefined') {
    return null as any;
  }

  if (prismaInstance) return prismaInstance;
  if (globalForPrisma.prisma) {
    prismaInstance = globalForPrisma.prisma;
    return prismaInstance;
  }

  const dbUrl = resolveDatabaseUrl();
  if (dbUrl === FALLBACK_URL) {
    console.warn('[Database] DATABASE_URL is missing/invalid, using fallback URL.');
  }

  const libsql = createClient({
    url: dbUrl,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  const adapter = new PrismaLibSql(libsql as any);

  prismaInstance = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance;
  }

  return prismaInstance;
};
