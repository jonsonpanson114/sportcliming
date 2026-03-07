'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Play, MessageSquare, ClipboardList, Search, 
  ChevronRight, Filter, Sparkles, BookOpen, Lightbulb,
  Dumbbell, Brain, Shield, Info, RefreshCw
} from 'lucide-react';

interface Tip {
  id: string;
  title: string;
  content: string;
  category: string;
  difficulty: string | null;
  videoIds: string[];
}

const CATEGORIES = [
  { id: 'all', name: 'すべて', icon: BookOpen },
  { id: 'technique', name: 'テクニック', icon: Zap },
  { id: 'training', name: 'トレーニング', icon: Dumbbell },
  { id: 'mental', name: 'メンタル', icon: Brain },
  { id: 'equipment', name: '装備・道具', icon: Shield },
];

export default function TipsPage() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchTips() {
      try {
        setLoading(true);
        const url = activeCategory === 'all' 
          ? '/api/tips' 
          : `/api/tips?category=${activeCategory}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setTips(data.tips || []);
        } else {
          setError('コツの取得に失敗しました');
        }
      } catch (e) {
        setError('エラーが発生しました');
      } finally {
        setLoading(false);
      }
    }
    fetchTips();
  }, [activeCategory]);

  const filteredTips = tips.filter(tip => 
    tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tip.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'technique': return { color: 'text-primary', bg: 'bg-primary/10', icon: Zap };
      case 'training': return { color: 'text-orange-400', bg: 'bg-orange-400/10', icon: Dumbbell };
      case 'mental': return { color: 'text-accent', bg: 'bg-accent/10', icon: Brain };
      case 'equipment': return { color: 'text-green-400', bg: 'bg-green-400/10', icon: Shield };
      default: return { color: 'text-white/40', bg: 'bg-white/5', icon: Lightbulb };
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
            <h1 className="text-lg font-display font-black tracking-tighter text-white">SUMMIT PULSE</h1>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        <header className="space-y-2">
          <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            ムーブの極意 <Sparkles className="text-primary w-5 h-5" />
          </h2>
          <p className="text-white/40 text-sm">動画から抽出された実践的テクニック</p>
        </header>

        {/* Search */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-white/5 rounded-2xl blur opacity-30 group-focus-within:opacity-100 transition-opacity" />
          <div className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
            <Search className="text-white/20 mr-3" size={20} />
            <input 
              type="text"
              placeholder="知りたいコツを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent outline-none text-white text-sm placeholder:text-white/20"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeCategory === cat.id 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10'
                }`}
              >
                <Icon size={14} />
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Tips List */}
        <div className="space-y-4">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              <RefreshCw className="text-primary animate-spin" size={32} />
              <p className="text-white/20 text-sm font-medium">知恵の波形を読み取り中...</p>
            </div>
          ) : error ? (
            <div className="glass-card p-8 text-center space-y-4 border-red-500/20 bg-red-500/5">
              <p className="text-red-400 font-medium">{error}</p>
              <button onClick={() => location.reload()} className="text-xs text-primary font-bold">再試行</button>
            </div>
          ) : filteredTips.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <p className="text-white/20 text-sm font-medium">該当するコツが見つかりませんでした</p>
            </div>
          ) : (
            filteredTips.map((tip, idx) => {
              const theme = getCategoryTheme(tip.category);
              const ThemeIcon = theme.icon;
              return (
                <motion.div
                  key={tip.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-card p-5 group hover:border-white/20 transition-all border-white/5"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className={`flex items-center gap-2 ${theme.color} text-[10px] font-black uppercase tracking-widest`}>
                          <ThemeIcon size={12} />
                          {CATEGORIES.find(c => c.id === tip.category)?.name || '未分類'}
                        </div>
                        <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors">
                          {tip.title}
                        </h3>
                      </div>
                      {tip.difficulty && (
                        <div className="px-2 py-0.5 rounded-full bg-white/5 text-[9px] font-bold text-white/30 uppercase tracking-tighter">
                          {tip.difficulty}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-white/60 leading-relaxed line-clamp-3">
                      {tip.content}
                    </p>

                    <div className="pt-2 flex items-center justify-between">
                      {tip.videoIds && tip.videoIds.length > 0 && (
                        <Link 
                          href={`/videos/${tip.videoIds[0]}`}
                          className="flex items-center gap-2 text-[10px] font-bold text-primary hover:underline uppercase tracking-widest"
                        >
                          <Play size={10} /> 関連動画を見る
                        </Link>
                      )}
                      <div className="p-2 bg-white/5 rounded-full text-white/20 group-hover:bg-primary/20 group-hover:text-primary transition-all">
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-md z-[100]">
        <div className="glass-card p-2 flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-white/10">
          <Link href="/" className="nav-item px-6 py-3 text-white/30 hover:text-white">
            <Zap size={24} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">ホーム</span>
          </Link>
          <Link href="/videos" className="nav-item px-6 py-3 text-white/30 hover:text-white">
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
