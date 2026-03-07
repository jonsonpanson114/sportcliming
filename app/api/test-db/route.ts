import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await getPrisma().$queryRaw`SELECT 1 as result`;
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
