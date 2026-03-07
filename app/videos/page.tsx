'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, MessageCircle, ClipboardList, Zap, Filter, ChevronRight, Search, RefreshCw } from 'lucide-react';

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
      case 'beginner': return '初紁E;
      case 'intermediate': return '中紁E;
      case 'advanced': return '上紁E;
      default: return '未設宁E;
    }
  };

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-primary to-accent rounded-lg flex items-center justify-center">
              <Zap className="text-white w-5 h-5" />
            </div>
            <h1 className="text-lg font-display font-black tracking-tighter text-white">
              SUMMIT PULSE
            </h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        <header className="space-y-2">
          <h2 className="text-2xl font-display font-bold text-white">動画パルス</h2>
          <p className="text-white/40 text-sm">最新のチE��ニックと解説動画</p>
        </header>

        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filter === 'all' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 text-white/40 border border-white/5'
            }`}
          >
            すべて
          </button>
          <button
            onClick={() => setFilter('beginner')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filter === 'beginner' ? 'bg-green-500/80 text-white shadow-lg shadow-green-500/20' : 'bg-white/5 text-white/40 border border-white/5'
            }`}
          >
            初紁E          </button>
          <button
            onClick={() => setFilter('intermediate')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filter === 'intermediate' ? 'bg-orange-500/80 text-white shadow-lg shadow-orange-500/20' : 'bg-white/5 text-white/40 border border-white/5'
            }`}
          >
            中紁E          </button>
          <button
            onClick={() => setFilter('advanced')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filter === 'advanced' ? 'bg-red-500/80 text-white shadow-lg shadow-red-500/20' : 'bg-white/5 text-white/40 border border-white/5'
            }`}
          >
            上紁E          </button>
        </div>

        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4">
            <RefreshCw className="text-primary animate-spin" size={32} />
            <p className="text-white/20 text-sm font-medium">チE�Eタの波形を読み取り中...</p>
          </div>
        ) : error ? (
          <div className="glass-card p-8 text-center space-y-4">
            <p className="text-red-400 font-medium">{error}</p>
            <button onClick={() => location.reload()} className="text-xs text-primary font-bold">再読み込み</button>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-white/20 text-sm font-medium">該当する動画が見つかりませんでした</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredVideos.map((video, idx) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link
                  href={`/videos/${video.id}`}
                  className="group block glass-card overflow-hidden hover:border-primary/30 transition-all p-3"
                >
                  <div className="flex gap-4">
                    <div className="relative w-32 h-20 flex-shrink-0">
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/5 rounded-xl flex items-center justify-center">
                          <Play size={24} className="text-white/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                        <Play size={20} className="text-white fill-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                      <h3 className="font-bold text-sm text-white/90 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                        {video.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {video.difficultyLevel && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-tighter ${
                              video.difficultyLevel === 'beginner' ? 'bg-green-500/10 text-green-400' :
                              video.difficultyLevel === 'intermediate' ? 'bg-orange-500/10 text-orange-400' :
                              'bg-red-500/10 text-red-400'
                            }`}>
                              {getDifficultyLabel(video.difficultyLevel)}
                            </span>
                          )}
                          <span className="text-[10px] text-white/20">
                            {new Date(video.publishedAt).toLocaleDateString('ja-JP')}
                          </span>
                        </div>
                        <ChevronRight size={14} className="text-white/10 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-md z-[100]">
        <div className="glass-card p-2 flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-white/10">
          <Link href="/" className="nav-item px-6 py-3 text-white/30 hover:text-white">
            <Zap size={24} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">ホ�Eム</span>
          </Link>
          <Link href="/videos" className="nav-item active px-6 py-3">
            <Play size={24} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">動画</span>
          </Link>
          <Link href="/qa" className="nav-item px-6 py-3 text-white/30 hover:text-white">
            <MessageCircle size={24} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">コーチE/span>
          </Link>
          <Link href="/records" className="nav-item px-6 py-3 text-white/30 hover:text-white">
            <ClipboardList size={24} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">記録</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
