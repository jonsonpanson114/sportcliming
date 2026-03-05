import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/records/[id] - 特定の練習記録を取得する
 */
export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const record = await prisma.practiceRecord.findUnique({
            where: { id: params.id },
        });

        if (!record) {
            return NextResponse.json(
                { error: '記録が見つかりません' },
                { status: 404 }
            );
        }

        return NextResponse.json({ record });
    } catch (error) {
        console.error('Records Get Error:', error);
        return NextResponse.json(
            { error: '記録の取得に失敗しました' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/records/[id] - 練習記録を更新する
 */
export async function PUT(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const body = await request.json();
        const { gymName, duration, routes, reflection, nextGoal } = body;

        const record = await prisma.practiceRecord.update({
            where: { id: params.id },
            data: {
                gymName,
                duration,
                routes: routes ? JSON.stringify(routes) : undefined,
                reflection,
                nextGoal,
            },
        });

        return NextResponse.json({ record });
    } catch (error) {
        console.error('Records Update Error:', error);
        return NextResponse.json(
            { error: '練習記録の更新に失敗しました' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/records/[id] - 練習記録を削除する
 */
export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        await prisma.practiceRecord.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Records Delete Error:', error);
        return NextResponse.json(
            { error: '記録の削除に失敗しました' },
            { status: 500 }
        );
    }
}
