'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Play, Sparkles, Target, Zap, Clock, Calendar, RefreshCw, AlertCircle, Bookmark, Share2, MessageSquare, ClipboardList } from 'lucide-react';

interface Video {
  id: string;
  youtubeId: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  summary: string | null;
  summaryData: string | null;
  difficultyLevel: string | null;
  publishedAt: string;
}

interface SummaryData {
  keyPoints?: string[];
  techniques?: string[];
  difficultyLevel?: string;
}

export default function VideoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchVideo() {
      try {
        const response = await fetch(`/api/videos/${id}`);
        if (response.ok) {
          const data = await response.json();
          setVideo(data.video);
        } else {
          setError('動画が見つかりませんでした');
        }
      } catch (e) {
        setError('エラーが発生しました');
      } finally {
        setLoading(false);
      }
    }
    fetchVideo();
  }, [id]);

  const parsedSummaryData: SummaryData = video?.summaryData 
    ? JSON.parse(video.summaryData) 
    : {};

  const getDifficultyLabel = (level: string | null) => {
    switch (level) {
      case 'beginner': return { text: '初級', color: 'text-green-400', bg: 'bg-green-500/10' };
      case 'intermediate': return { text: '中級', color: 'text-orange-400', bg: 'bg-orange-500/10' };
      case 'advanced': return { text: '上級', color: 'text-red-400', bg: 'bg-red-500/10' };
      default: return { text: '未設定', color: 'text-white/40', bg: 'bg-white/5' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <RefreshCw className="text-primary animate-spin" size={40} />
        <p className="text-white/20 font-bold uppercase tracking-widest text-xs">シンクロ率 80% ...</p>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
          <AlertCircle className="text-red-500" size={32} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Error</h2>
          <p className="text-white/40 text-sm">{error || '不明なエラーが発生しました'}</p>
        </div>
        <Link href="/videos" className="neo-button text-white px-8">戻る</Link>
      </div>
    );
  }

  const difficulty = getDifficultyLabel(video.difficultyLevel);

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link href="/videos" className="p-2 hover:bg-white/5 rounded-xl transition-colors text-white/40 hover:text-white">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-xs font-bold text-white/80 line-clamp-1 flex-1 uppercase tracking-widest">
            {video.title}
          </h1>
          <div className="flex gap-2">
            <button className="p-2 text-white/40 hover:text-white"><Bookmark size={20} /></button>
            <button className="p-2 text-white/40 hover:text-white"><Share2 size={20} /></button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* Video Player Section */}
        <section className="space-y-4">
          <div className="relative aspect-video rounded-3xl overflow-hidden bg-black/40 border border-white/10 shadow-2xl">
            <iframe
              src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=0&modestbranding=1&rel=0`}
              title={video.title}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="flex items-center justify-between px-2">
            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${difficulty.bg} ${difficulty.color}`}>
              {difficulty.text}
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                {new Date(video.publishedAt).toLocaleDateString('ja-JP')}
              </div>
            </div>
          </div>
          <h2 className="text-xl font-display font-black text-white leading-tight">
            {video.title}
          </h2>
        </section>

        {/* AI Summary Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-accent/30 rounded-3xl blur opacity-75 group-hover:opacity-100 transition-opacity" />
          <div className="relative glass-card p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-xl">
                <Sparkles className="text-primary w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">AI 分析要約</h3>
                <p className="text-[10px] text-white/30 uppercase tracking-widest">Powered by Gemini 3 Flash</p>
              </div>
            </div>
            
            <div className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
              {video.summary || 'AIによる解説を生成中です...'}
            </div>

            {/* Key Points */}
            {parsedSummaryData.keyPoints && parsedSummaryData.keyPoints.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                  <Target size={12} className="text-accent" />
                  重要チェックポイント
                </h4>
                <div className="grid gap-2">
                  {parsedSummaryData.keyPoints.map((point, i) => (
                    <div key={i} className="flex gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-primary font-display font-black text-xs">{i + 1}</span>
                      <p className="text-xs text-white/80 leading-snug">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.section>

        {/* Action Button - Quiz */}
        <section className="pt-4">
          <Link 
            href={`/qa?video=${video.id}`}
            className="neo-button w-full flex items-center justify-center gap-3 text-white py-5"
          >
            <Zap size={20} className="text-accent" />
            <span className="font-bold tracking-widest">この動画についてもっと詳しく聞く</span>
          </Link>
        </section>

        {/* Original Description (Optional) */}
        {video.description && (
          <section className="space-y-4 pt-4 opacity-50">
             <details className="group">
                <summary className="list-none flex items-center justify-between cursor-pointer">
                  <h3 className="text-[10px] font-bold text-white/30 tracking-[0.2em] uppercase">元の説明文を表示</h3>
                  <div className="w-1 h-1 bg-white/20 rounded-full group-open:bg-primary transition-colors" />
                </summary>
                <div className="pt-4 text-xs text-white/40 leading-relaxed whitespace-pre-wrap">
                  {video.description}
                </div>
             </details>
          </section>
        )}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-md z-[100]">
        <div className="glass-card p-2 flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-white/10">
          <Link href="/" className="nav-item px-6 py-3 text-white/30 hover:text-white">
            <Zap size={24} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">ホーム</span>
          </Link>
          <Link href="/videos" className="nav-item active px-6 py-3">
            <Play size={24} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">動画</span>
          </Link>
          <Link href="/qa" className="nav-item px-6 py-3 text-white/30 hover:text-white">
            <MessageSquare size={24} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">コーチ</span>
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
