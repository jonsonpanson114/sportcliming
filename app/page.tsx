'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DailyMenu {
  greeting: string;
  dailyMenu: Array<{
    name: string;
    description: string;
    duration: string;
    difficulty?: string;
  }>;
  tips?: string[];
}

export default function Home() {
  const [dailyMenu, setDailyMenu] = useState<DailyMenu | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDailyMenu() {
      try {
        const response = await fetch('/api/daily-practice');
        if (response.ok) {
          const data = await response.json();
          setDailyMenu(data);
        }
      } catch (error) {
        console.error('Failed to fetch daily menu:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDailyMenu();
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-semibold text-[#0066cc]">Climb</span>
            <span className="text-xl font-semibold text-[#1a1a1a]">Coach</span>
          </Link>
          <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-5 pb-20">
        {/* Today's Practice Card */}
        {!loading && dailyMenu && (
          <section className="mb-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🎯</span>
                <h1 className="text-lg font-semibold">{dailyMenu.greeting}</h1>
              </div>

              {dailyMenu.dailyMenu.map((item, index) => (
                <div key={index} className="bg-[#fafafa] border border-gray-100 rounded-xl p-4 mb-3">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-[#1a1a1a]">{item.name}</h3>
                    <div className="flex items-center gap-2">
                      {item.difficulty && (
                        <span className={`tag tag-${item.difficulty}`}>
                          {item.difficulty === 'beginner' ? '初級' :
                           item.difficulty === 'intermediate' ? '中級' : '上級'}
                        </span>
                      )}
                      <span className="text-xs text-[#999]">{item.duration}</span>
                    </div>
                  </div>
                  <p className="text-sm text-[#666] leading-relaxed">{item.description}</p>
                </div>
              ))}

              {dailyMenu.tips && dailyMenu.tips.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h3 className="font-medium text-sm text-[#666] mb-2">💡 今日のポイント</h3>
                  <ul className="space-y-1">
                    {dailyMenu.tips.map((tip, index) => (
                      <li key={index} className="text-sm text-[#666] flex gap-2">
                        <span>•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Quick Actions */}
        <section className="mb-6">
          <h2 className="text-sm font-medium text-[#666] mb-3 px-1">クイックアクション</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/videos"
              className="card-elevated p-4 flex flex-col items-center justify-center gap-2 active:scale-98 transition-transform"
            >
              <span className="text-2xl">📺</span>
              <span className="text-sm font-medium">動画を見る</span>
            </Link>
            <Link
              href="/qa"
              className="card-elevated p-4 flex flex-col items-center justify-center gap-2 active:scale-98 transition-transform"
            >
              <span className="text-2xl">🤔</span>
              <span className="text-sm font-medium">質問する</span>
            </Link>
            <Link
              href="/records"
              className="card-elevated p-4 flex flex-col items-center justify-center gap-2 active:scale-98 transition-transform"
            >
              <span className="text-2xl">📋</span>
              <span className="text-sm font-medium">記録を見る</span>
            </Link>
            <Link
              href="/videos"
              className="card-elevated p-4 flex flex-col items-center justify-center gap-2 active:scale-98 transition-transform"
            >
              <span className="text-2xl">⭐</span>
              <span className="text-sm font-medium">お気に入り</span>
            </Link>
          </div>
        </section>

        {/* Recommended Videos */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-sm font-medium text-[#666]">おすすめ動画</h2>
            <Link href="/videos" className="text-sm text-[#0066cc] font-medium">すべて見る</Link>
          </div>
          <div className="space-y-3">
            <Link href="/videos" className="block card p-0 overflow-hidden">
              <div className="flex">
                <div className="w-32 h-24 bg-gray-100 flex-shrink-0 flex items-center justify-center">
                  <span className="text-3xl">🎬</span>
                </div>
                <div className="flex-1 p-3">
                  <h3 className="font-medium text-sm mb-1 line-clamp-2">ホールド保持のコツ</h3>
                  <span className="tag tag-beginner">初級</span>
                </div>
              </div>
            </Link>
            <Link href="/videos" className="block card p-0 overflow-hidden">
              <div className="flex">
                <div className="w-32 h-24 bg-gray-100 flex-shrink-0 flex items-center justify-center">
                  <span className="text-3xl">🎬</span>
                </div>
                <div className="flex-1 p-3">
                  <h3 className="font-medium text-sm mb-1 line-clamp-2">スタート位置の極意</h3>
                  <span className="tag tag-intermediate">中級</span>
                </div>
              </div>
            </Link>
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-lg mx-auto flex justify-around h-16">
          <Link
            href="/"
            className="flex-1 flex flex-col items-center justify-center gap-1 text-[#0066cc]"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="text-xs font-medium">ホーム</span>
          </Link>
          <Link
            href="/videos"
            className="flex-1 flex flex-col items-center justify-center gap-1 text-[#999] hover:text-[#0066cc]"
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
