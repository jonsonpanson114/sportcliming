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
  
  if (!dbUrl || dbUrl === 'undefined') {
    console.warn('[Database] DATABASE_URL is not set or invalid. Falling back to local SQLite.');
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
