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
  
  // Extreme logging for Vercel debugging - DO NOT REMOVE UNTIL FIXED
  const envKeys = Object.keys(process.env).sort();
  console.log('[Database] Available Env Keys:', envKeys.join(', '));
  
  console.log('[Database] Debugging DATABASE_URL existence:', {
    hasUrl: !!dbUrl,
    urlType: typeof dbUrl,
    urlValueLength: dbUrl ? dbUrl.length : 0,
    isUndefinedString: dbUrl === 'undefined',
    isEmptyString: dbUrl === '',
    prefix: dbUrl ? dbUrl.substring(0, 10) : 'none'
  });

  if (!dbUrl || dbUrl === 'undefined' || dbUrl === '') {
    console.warn('[Database] DATABASE_URL is missing or "undefined" string. Vercel Environment Variables might not be applied correctly.');
    // Check if we are on Vercel
    if (process.env.VERCEL) {
       console.error('[Database] CRITICAL: Running on Vercel but DATABASE_URL is missing! Please check Vercel Settings -> Environment Variables.');
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
