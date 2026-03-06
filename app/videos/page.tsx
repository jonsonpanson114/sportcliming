'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Video {
  id: string;
  youtubeId: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  summary: string | null;
  difficultyLevel: string | null;
  publishedAt: string;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  useEffect(() => {
    async function fetchVideos() {
      try {
        const response = await fetch('/api/videos');
        if (response.ok) {
          const data = await response.json();
          setVideos(data.videos || []);
        } else {
          setError('動画の取得に失敗しました');
        }
      } catch (e) {
        setError('エラーが発生しました');
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, []);

  const filteredVideos = videos.filter(v =>
    filter === 'all' || v.difficultyLevel === filter
  );

  const getDifficultyColor = (level: string | null) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (level: string | null) => {
    switch (level) {
      case 'beginner': return '初級';
      case 'intermediate': return '中級';
      case 'advanced': return '上級';
      default: return '未設定';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 bg-surface border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">🧗</span>
            <span className="text-lg font-semibold">Climbing Coach</span>
          </Link>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-md mx-auto px-4 py-6 pb-24">
        <h1 className="text-2xl font-bold mb-6">📺 動画一覧</h1>

        {/* フィルター */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              filter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            すべて
          </button>
          <button
            onClick={() => setFilter('beginner')}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              filter === 'beginner' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            初級
          </button>
          <button
            onClick={() => setFilter('intermediate')}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              filter === 'intermediate' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            中級
          </button>
          <button
            onClick={() => setFilter('advanced')}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              filter === 'advanced' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            上級
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">読み込み中...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-8 text-gray-600">動画が見つかりません</div>
        ) : (
          <div className="space-y-4">
            {filteredVideos.map((video) => (
              <Link
                key={video.id}
                href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full aspect-video object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-video bg-gray-200 flex items-center justify-center">
                      <span className="text-4xl">🎬</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{video.title}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    {video.difficultyLevel && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(video.difficultyLevel)}`}>
                        {getDifficultyLabel(video.difficultyLevel)}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(video.publishedAt).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                  {video.summary && (
                    <p className="text-gray-700 line-clamp-2 text-sm">
                      {video.summary}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* ボトムナビゲーション */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2">
        <div className="max-w-md mx-auto flex justify-around">
          <Link
            href="/"
            className="flex flex-col items-center gap-1 px-4 py-2 text-gray-600 hover:text-primary transition-colors"
          >
            <span className="text-xl">🏠</span>
            <span className="text-xs font-medium">ホーム</span>
          </Link>
          <Link
            href="/videos"
            className="flex flex-col items-center gap-1 px-4 py-2 text-primary"
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
