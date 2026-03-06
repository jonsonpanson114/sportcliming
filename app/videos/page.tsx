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

  const getDifficultyLabel = (level: string | null) => {
    switch (level) {
      case 'beginner': return '初級';
      case 'intermediate': return '中級';
      case 'advanced': return '上級';
      default: return '未設定';
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-semibold text-[#0066cc]">Climb</span>
            <span className="text-xl font-semibold text-[#1a1a1a]">Coach</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-5 pb-20">
        <h1 className="text-xl font-semibold mb-4">動画一覧</h1>

        {/* Filter */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              filter === 'all' ? 'bg-[#1a1a1a] text-white' : 'bg-white border border-gray-200 text-[#666]'
            }`}
          >
            すべて
          </button>
          <button
            onClick={() => setFilter('beginner')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              filter === 'beginner' ? 'bg-[#22c55e] text-white' : 'bg-white border border-gray-200 text-[#666]'
            }`}
          >
            初級
          </button>
          <button
            onClick={() => setFilter('intermediate')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              filter === 'intermediate' ? 'bg-[#f59e0b] text-white' : 'bg-white border border-gray-200 text-[#666]'
            }`}
          >
            中級
          </button>
          <button
            onClick={() => setFilter('advanced')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              filter === 'advanced' ? 'bg-[#ef4444] text-white' : 'bg-white border border-gray-200 text-[#666]'
            }`}
          >
            上級
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-[#666]">読み込み中...</div>
        ) : error ? (
          <div className="text-center py-12 text-[#ef4444]">{error}</div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-12 text-[#999]">動画が見つかりません</div>
        ) : (
          <div className="space-y-3">
            {filteredVideos.map((video) => (
              <Link
                key={video.id}
                href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex gap-3">
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-28 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                  ) : (
                    <div className="w-28 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                      <span className="text-2xl">🎬</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm mb-2 line-clamp-2 leading-snug">{video.title}</h3>
                    <div className="flex items-center gap-2">
                      {video.difficultyLevel && (
                        <span className={`tag tag-${video.difficultyLevel}`}>
                          {getDifficultyLabel(video.difficultyLevel)}
                        </span>
                      )}
                      <span className="text-xs text-[#999]">
                        {new Date(video.publishedAt).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-lg mx-auto flex justify-around h-16">
          <Link
            href="/"
            className="flex-1 flex flex-col items-center justify-center gap-1 text-[#999] hover:text-[#0066cc]"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="text-xs font-medium">ホーム</span>
          </Link>
          <Link
            href="/videos"
            className="flex-1 flex flex-col items-center justify-center gap-1 text-[#0066cc]"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="14" x="2" y="3" rx="2" ry="2" />
              <line x1="8" x2="16" y1="21" y2="21" />
              <line x1="12" x2="12" y1="17" y2="21" />
            </svg>
            <span className="text-xs font-medium">動画</span>
          </Link>
          <Link
            href="/qa"
            className="flex-1 flex flex-col items-center justify-center gap-1 text-[#999] hover:text-[#0066cc]"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <path d="M12 17h.01" />
            </svg>
            <span className="text-xs font-medium">Q&A</span>
          </Link>
          <Link
            href="/records"
            className="flex-1 flex flex-col items-center justify-center gap-1 text-[#999] hover:text-[#0066cc]"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span className="text-xs font-medium">記録</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
