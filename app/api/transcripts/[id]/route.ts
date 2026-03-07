import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db/prisma';
import { getVideoCaptions } from '@/lib/youtube/transcript';

/**
 * GET /api/transcripts/[id] - 字幕を取得する
 */
export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const db = getPrisma();
    const params = await props.params;
    // データベースから動画を取得
    const video = await db.video.findUnique({
      where: { id: params.id },
    });

    if (!video) {
      return NextResponse.json(
        { error: '動画が見つかりません' },
        { status: 404 }
      );
    }

    // 既に字幕がある場合
    if (video.transcript) {
      return NextResponse.json({
        transcript: video.transcript,
        cached: true,
      });
    }

    // YouTubeから字幕を取得
    let transcript: string;
    try {
      transcript = await getVideoCaptions(video.youtubeId);
    } catch (error) {
      console.error('Transcript Error:', error);
      return NextResponse.json(
        { error: '字幕の取得に失敗しました。この動画には字幕がないかもしれません。' },
        { status: 400 }
      );
    }

    // データベースに保存
    await db.video.update({
      where: { id: params.id },
      data: { transcript },
    });

    return NextResponse.json({
      transcript,
      cached: false,
    });
  } catch (error) {
    console.error('Transcript API Error:', error);
    return NextResponse.json(
      { error: '字幕の取得に失敗しました' },
      { status: 500 }
    );
  }
}
