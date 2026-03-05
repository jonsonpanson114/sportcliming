import { NextResponse } from 'next/server';
import { getChannelIdByHandle } from '@/lib/youtube/get-channel-id';

/**
 * POST /api/get-channel-id - チャンネルIDを取得する
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { handle } = body;

    if (!handle) {
      return NextResponse.json(
        { error: 'handleが必要です' },
        { status: 400 }
      );
    }

    // チャンネルIDを取得
    const channelId = await getChannelIdByHandle(handle);

    if (!channelId) {
      return NextResponse.json(
        { error: 'チャンネルが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      channelId,
      handle,
    });
  } catch (error) {
    console.error('Get Channel ID Error:', error);
    return NextResponse.json(
      { error: 'チャンネルIDの取得に失敗しました' },
      { status: 500 }
    );
  }
}
