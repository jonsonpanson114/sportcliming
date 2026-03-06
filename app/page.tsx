'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Trophy, Play, MessageSquare, ClipboardList, Target, Flame, RefreshCw, Layers, Zap, Plus } from 'lucide-react';

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
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [dailyMenu, setDailyMenu] = useState<DailyMenu | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDailyMenu() {
      try {
        const response = await fetch('/api/daily-practice');
        if (response.ok) {
          const data = await response.json();
          // The API returns an array, but the UI expects an object or first item
          const menuData = Array.isArray(data) ? data[0] : data;
          setDailyMenu(menuData);
        }
      } catch (error) {
        console.error('Failed to fetch daily menu:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDailyMenu();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setSyncStatus('パルス同期中...');
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: 'UCBtRI97Yh3l6pZzLvBYPq8Q', limit: 5 }),
      });
      if (response.ok) setSyncStatus('同期完了');
      else setSyncStatus('同期失敗');
    } catch (error) {
      setSyncStatus('エラー発生');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-tr from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-display font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                SUMMIT PULSE
              </h1>
              <p className="text-[10px] text-primary font-bold tracking-[0.2em] uppercase">AI クライミングコーチ</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="p-2 glass-card !rounded-full text-white/60 hover:text-white transition-colors">
              <Trophy size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-10">
        {/* Welcome Section */}
        <section className="relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <h2 className="text-3xl font-display font-medium text-white/90">
              こんにちは、<span className="text-white font-bold">クライマー</span>
            </h2>
            <p className="text-white/40 text-sm">頂上が待っている。準備はいいか？</p>
          </motion.div>
        </section>

        {/* AI Daily Target */}
        <section>
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="group glass-card p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-colors" />
            
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/5 rounded-2xl">
                  <Target className="text-primary w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">今日の練習メニュー</h3>
                  <p className="text-white/40 text-xs">AIが分析した最適なトレーニング</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setLoading(true);
                  location.reload();
                }}
                className="p-2 text-white/40 hover:text-white transition-colors"
                title="メニューを更新"
              >
                <RefreshCw size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {!loading && dailyMenu?.dailyMenu ? (
                dailyMenu.dailyMenu.slice(0, 3).map((item: any, i: number) => (
                  <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-10 bg-primary/60 rounded-full shadow-[0_0_10px_rgba(56,189,248,0.5)]" />
                      <div>
                        <p className="font-bold text-sm">{item.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">{item.duration}</p>
                          {item.difficulty && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/5 text-white/30 uppercase tracking-tighter">
                              {item.difficulty === 'beginner' ? '初級' : item.difficulty === 'intermediate' ? '中級' : '上級'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Play className="text-primary/60" size={16} />
                  </div>
                ))
              ) : (
                <div className="h-24 flex items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                  <p className="text-white/20 text-sm font-medium animate-pulse">
                    {loading ? 'パルスを分析中...' : '今日のメニューはありません'}
                  </p>
                </div>
              )}
            </div>

            <Link href="/practice" className="neo-button w-full mt-6 text-center block text-white">
              セッションを開始
            </Link>
          </motion.div>
        </section>

        {/* Main Stats / Record Quick Access */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-bold text-white/40 tracking-[0.2em] uppercase">あなたの進捗</h3>
            <Link href="/records" className="text-xs text-primary font-bold hover:underline">全記録を見る</Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <motion.div 
              whileHover={{ y: -2 }}
              className="glass-card p-5 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-orange-500/10 transition-colors" />
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Flame className="text-orange-500 w-4 h-4" />
                </div>
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">継続日数</span>
              </div>
              <p className="text-2xl font-display font-black text-white">7 <span className="text-sm font-medium text-white/40">日間</span></p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -2 }}
              className="glass-card p-5 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-accent/10 transition-colors" />
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Layers className="text-accent w-4 h-4" />
                </div>
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">最高グレード</span>
              </div>
              <p className="text-2xl font-display font-black text-white">B3 <span className="text-sm font-medium text-white/40">級</span></p>
            </motion.div>
          </div>

          <Link href="/records" className="block p-4 glass-card border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all text-center group">
            <div className="flex items-center justify-center gap-2">
              <Plus className="text-primary w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-sm text-primary uppercase tracking-widest">セッションを記録する</span>
            </div>
          </Link>
        </section>

        {/* Search Pulse */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-bold text-white/40 tracking-[0.2em] uppercase">動画を探す</h3>
            <Link href="/videos" className="text-xs text-primary font-bold hover:underline">すべて表示</Link>
          </div>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity blur" />
            <div className="relative bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 transition-all">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
              <input 
                type="text" 
                placeholder="テクニックや動画を検索..."
                className="w-full bg-transparent outline-none text-white placeholder:text-white/20 text-sm"
              />
            </div>
          </div>
        </section>

        {/* Sync Status (Dev only/Small) */}
        <div className="pt-10 border-t border-white/5">
          <button 
            onClick={handleSync}
            disabled={syncing}
            className="text-[9px] font-mono flex items-center gap-2 mx-auto text-white/20 hover:text-white/40 transition-colors"
          >
            <div className={`w-1.5 h-1.5 rounded-full ${syncing ? 'bg-yellow-400 animate-pulse' : 'bg-green-400/50'}`} />
            {syncing ? 'パルス同期中...' : (syncStatus || 'コアエンジン稼働中')}
          </button>
        </div>
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-md z-[100]">
        <div className="glass-card p-2 flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-white/10">
          <Link href="/" className="nav-item active px-6 py-3">
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
