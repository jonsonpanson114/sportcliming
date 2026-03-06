// @ts-ignore
import prismaModule from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined
};

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? 'file:./dev.db',
});

const PrismaClientClass = (prismaModule as any).PrismaClient || prismaModule;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClientClass({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    adapter,
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
