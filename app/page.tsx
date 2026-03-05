'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [channelId, setChannelId] = useState('');
  const [channelHandle, setChannelHandle] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [fetchingChannelId, setFetchingChannelId] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');

  const handleFetchChannelId = async () => {
    if (!channelHandle) {
      setSyncStatus('チャンネルハンドルを入力してください（例: @sportclimbing-coach）');
      return;
    }

    setFetchingChannelId(true);
    setSyncStatus('チャンネルIDを取得中...');

    try {
      const handle = channelHandle.startsWith('@') ? channelHandle : `@${channelHandle}`;
      const response = await fetch('/api/get-channel-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ handle }),
      });

      const data = await response.json();

      if (response.ok) {
        setChannelId(data.channelId);
        setSyncStatus(`チャンネルIDを取得しました: ${data.channelId}`);
      } else {
        setSyncStatus(`エラー: ${data.error}`);
      }
    } catch (error) {
      setSyncStatus('エラーが発生しました');
    } finally {
      setFetchingChannelId(false);
    }
  };

  const handleSync = async () => {
    if (!channelId) {
      setSyncStatus('チャンネルIDを入力してください');
      return;
    }

    setSyncing(true);
    setSyncStatus('同期中...');

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ channelId, limit: 5 }),
      });

      const data = await response.json();

      if (response.ok) {
        setSyncStatus(`成功！${data.total} 件の動画を取得しました。`);
      } else {
        setSyncStatus(`エラー: ${data.error}`);
      }
    } catch (error) {
      setSyncStatus('エラーが発生しました');
    } finally {
      setSyncing(false);
    }
  };
  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 bg-surface border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">🧗</span>
            <span className="text-lg font-semibold">Climbing Coach</span>
          </div>
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            🔔
          </button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-md mx-auto px-4 py-6 pb-24">
        {/* 検索バー */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-xl font-bold mb-4 text-center">
            今日の練習は？
          </h1>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="動画やテクニックを検索..."
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
              検索
            </button>
          </div>

          {/* チャンネル同期（開発用） */}
          <div className="border-t border-gray-200 pt-4">
            <h2 className="text-sm font-semibold mb-2 text-gray-600">YouTubeチャンネル同期</h2>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="チャンネルハンドル（例: @sportclimbing-coach）"
                  value={channelHandle}
                  onChange={(e) => setChannelHandle(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                />
                <button
                  onClick={handleFetchChannelId}
                  disabled={fetchingChannelId}
                  className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
                >
                  {fetchingChannelId ? '取得中...' : 'ID取得'}
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="チャンネルID（例: UCxxxxxx）"
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                />
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="bg-secondary text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
                >
                  {syncing ? '同期中...' : '同期'}
                </button>
              </div>
            </div>
            {syncStatus && (
              <p className="text-sm mt-2 text-gray-600">{syncStatus}</p>
            )}
          </div>
        </div>

        {/* 今日の練習メニュー */}
        <section className="mb-6">
          <Link
            href="/practice"
            className="block bg-gradient-to-r from-primary to-orange-600 rounded-2xl shadow-lg p-6 text-white hover:scale-105 transition-transform"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🎯</span>
              <h2 className="text-xl font-bold">今日の練習メニュー</h2>
            </div>
            <p className="text-sm opacity-90">AIがおすすめする練習プランを見る</p>
          </Link>
        </section>

        {/* ストリーク表示 */}
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <span className="text-4xl">🔥</span>
          <div>
            <div className="text-green-700 font-bold text-lg">連続7日！</div>
            <div className="text-green-600 text-sm">続けてください！</div>
          </div>
        </div>

        {/* 動画一覧セクション */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">🔥 人気動画</h2>
            <Link
              href="/videos"
              className="text-primary font-semibold hover:underline"
            >
              すべて見る →
            </Link>
          </div>

          {/* 動画カードサンプル */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <div className="aspect-video bg-gray-200 flex items-center justify-center">
                  <span className="text-4xl">🎬</span>
                </div>
                <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform">
                  💫
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">ホールド保持のコツ</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <span>⏱️ 3:24</span>
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">初級</span>
                </div>
                <p className="text-gray-700 line-clamp-2">
                  ホールドをしっかり握ることが重要です。足を置く場所も意識して、安定感を得ましょう。
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <div className="aspect-video bg-gray-200 flex items-center justify-center">
                  <span className="text-4xl">🎬</span>
                </div>
                <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform">
                  💫
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">スタート位置の極意</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <span>⏱️ 5:12</span>
                  <span className="bg-secondary/10 text-secondary px-2 py-1 rounded-full text-xs">中級</span>
                </div>
                <p className="text-gray-700 line-clamp-2">
                  スタート位置はルートの成功に大きく影響します。最初の3つのムーブでしっかりとることを意識しましょう。
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ボトムナビゲーション */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2">
        <div className="max-w-md mx-auto flex justify-around">
          <Link
            href="/"
            className="flex flex-col items-center gap-1 px-4 py-2 text-primary"
          >
            <span className="text-xl">🏠</span>
            <span className="text-xs font-medium">ホーム</span>
          </Link>
          <Link
            href="/videos"
            className="flex flex-col items-center gap-1 px-4 py-2 text-gray-600 hover:text-primary transition-colors"
          >
            <span className="text-xl">📺</span>
            <span className="text-xs font-medium">動画</span>
          </Link>
          <Link
            href="/qa"
            className="flex flex-col items-center gap-1 px-4 py-2 text-gray-600 hover:text-primary transition-colors"
          >
            <span className="text-xl">🤔</span>
            <span className="text-xs font-medium">Q&A</span>
          </Link>
          <Link
            href="/records"
            className="flex flex-col items-center gap-1 px-4 py-2 text-gray-600 hover:text-primary transition-colors"
          >
            <span className="text-xl">📋</span>
            <span className="text-xs font-medium">記録</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
