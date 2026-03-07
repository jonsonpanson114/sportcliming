import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const version = "v1896-REBIRTH";
  try {
    const db = getPrisma();
    const result = await db.$queryRaw`SELECT 1 as result`;
    return NextResponse.json({ 
      success: true, 
      result, 
      version,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`[${version}] API Error:`, error);
    return NextResponse.json({ 
      success: false, 
      version,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
