import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

function previewEnv(value: string | undefined): string {
  if (!value) return '<empty>';
  return value.length > 30 ? `${value.slice(0, 30)}...` : value;
}

export async function GET() {
  const version = 'v2001-OMEGA';
  const rawDbUrl = process.env.DATABASE_URL;

  try {
    const db = getPrisma();
    const result = await db.$queryRaw`SELECT 1 as result`;
    return NextResponse.json({
      success: true,
      result,
      version,
      dbUrlPreview: previewEnv(rawDbUrl),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`[${version}] API Error:`, error);
    return NextResponse.json(
      {
        success: false,
        version,
        dbUrlPreview: previewEnv(rawDbUrl),
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
