'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search,
  Trophy,
  Play,
  MessageCircle,
  ClipboardList,
  Target,
  Flame,
  RefreshCw,
  Layers,
  Zap,
  Plus,
  Lightbulb,
} from 'lucide-react';

interface DailyMenuItem {
  name: string;
  description: string;
  duration: string;
  difficulty?: string;
}

interface DailyMenu {
  greeting?: string;
  dailyMenu?: DailyMenuItem[];
}

export default function Home() {
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [dailyMenu, setDailyMenu] = useState<DailyMenu | null>(null);
  const [stats, setStats] = useState({ videos: 0, processed: 0, tips: 0, records: 0, streak: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuRes, statsRes] = await Promise.all([
          fetch('/api/daily-practice'),
          fetch('/api/stats')
        ]);
        
        if (menuRes.ok) {
          const data = await menuRes.json();
          setDailyMenu(data ?? null);
        }
        
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      setSyncStatus(response.ok ? '同期完了' : '同期失敗');
    } catch (error) {
      console.error(error);
      setSyncStatus('エラー発生');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen pb-28">
      {/* header remains same */}
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
          <button className="p-2 glass-card !rounded-full text-white/60 hover:text-white transition-colors">
            <Trophy size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-10">
        <section className="relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <h2 className="text-3xl font-display font-medium text-white/90">
              こんにちは、<span className="text-white font-bold">クライマー</span>
            </h2>
            <p className="text-white/40 text-sm">頂上が待っている。準備はいいか？</p>
          </motion.div>
        </section>

        <section>
          <motion.div whileHover={{ scale: 1.01 }} className="group glass-card p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-colors" />
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/5 rounded-2xl"><Target className="text-primary w-6 h-6" /></div>
                <div>
                  <h3 className="text-lg font-bold">今日の練習メニュー</h3>
                  <p className="text-white/40 text-xs">AIが分析した最適なトレーニング</p>
                </div>
              </div>
              <button 
                onClick={() => { setLoading(true); window.location.reload(); }} 
                className="p-2 text-white/40 hover:text-white transition-colors" 
                title="メニューを更新"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="space-y-4">
              {!loading && dailyMenu?.dailyMenu?.length ? (
                dailyMenu.dailyMenu.slice(0, 3).map((item, i) => (
                  <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group/item hover:bg-white/10 transition-colors">
                    <div className="flex-1 pr-4">
                      <p className="font-bold text-sm text-white/90">{item.name}</p>
                      <p className="text-white/30 text-[10px] line-clamp-1 mt-0.5">{item.description}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <p className="text-primary text-[9px] font-black uppercase tracking-widest">{item.duration}</p>
                      <Play className="text-primary/40 group-hover/item:text-primary transition-colors" size={14} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-24 flex items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                  <p className="text-white/20 text-sm font-medium">
                    {loading ? 'パルスを分析中...' : '今日のメニューはありません'}
                  </p>
                </div>
              )}
            </div>
            <Link href="/practice" className="relative group/btn w-full mt-6 block">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-25 group-hover/btn:opacity-50 transition duration-1000 group-hover/btn:duration-200 animate-pulse" />
              <div className="relative neo-button !bg-slate-900 border-primary/50 w-full text-center py-4 flex items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                  <Play className="text-primary fill-primary" size={16} />
                </div>
                <span className="text-xl font-display font-black tracking-widest text-white">
                  練習を開始する
                </span>
              </div>
            </Link>
          </motion.div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-bold text-white/40 tracking-[0.2em] uppercase">あなたの進捗</h3>
            <Link href="/records" className="text-xs text-primary font-bold hover:underline">全記録を見る</Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-5 border-primary/20 bg-primary/5">
              <Zap className="text-primary w-4 h-4 mb-2" />
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-tighter">同期済み動画</p>
              <p className="text-2xl font-display font-black text-white">{stats.processed}<span className="text-xs text-white/40 ml-1">件</span></p>
            </div>
            <div className="glass-card p-5 border-accent/20 bg-accent/5">
              <Lightbulb className="text-accent w-4 h-4 mb-2" />
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-tighter">習得したコツ</p>
              <p className="text-2xl font-display font-black text-white">{stats.tips}<span className="text-xs text-white/40 ml-1">項目</span></p>
            </div>
          </div>
          <Link href="/records" className="block p-4 glass-card border-white/10 bg-white/5 hover:bg-white/10 transition-all text-center group">
            <div className="flex items-center justify-center gap-2">
              <Plus className="text-primary w-5 h-5" />
              <span className="font-bold text-sm text-white/90 uppercase tracking-widest">セッションを記録する</span>
            </div>
          </Link>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-bold text-white/40 tracking-[0.2em] uppercase">動画を探す</h3>
            <Link href="/videos" className="text-xs text-primary font-bold hover:underline">すべて表示</Link>
          </div>
          <div className="relative bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 group focus-within:border-primary/50 transition-colors">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={20} />
            <input type="text" placeholder={`${stats.videos}件の動画から検索...`} className="w-full bg-transparent outline-none text-white placeholder:text-white/20 text-sm" />
          </div>
        </section>

        <div className="pt-10 border-t border-white/5">
          <button onClick={handleSync} disabled={syncing} className="text-[9px] font-mono flex items-center gap-2 mx-auto text-white/20 hover:text-white/40 transition-colors">
            <div className={`w-1.5 h-1.5 rounded-full ${syncing ? 'bg-yellow-400 animate-pulse' : 'bg-green-400/50'}`} />
            {syncing ? 'パルス同期中...' : (syncStatus || `コアエンジン稼働中 - v2.0.2 (Resolved)`)}
          </button>
        </div>
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-md z-[100]">
        <div className="glass-card p-2 flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-white/10">
          <Link href="/" className="nav-item active px-6 py-3"><Zap size={24} /><span className="text-[9px] font-bold uppercase tracking-tighter">ホーム</span></Link>
          <Link href="/videos" className="nav-item px-6 py-3 text-white/30 hover:text-white"><Play size={24} /><span className="text-[9px] font-bold uppercase tracking-tighter">動画</span></Link>
          <Link href="/qa" className="nav-item px-6 py-3 text-white/30 hover:text-white"><MessageCircle size={24} /><span className="text-[9px] font-bold uppercase tracking-tighter">コーチ</span></Link>
          <Link href="/records" className="nav-item px-6 py-3 text-white/30 hover:text-white"><ClipboardList size={24} /><span className="text-[9px] font-bold uppercase tracking-tighter">記録</span></Link>
        </div>
      </nav>
    </div>
  );
}
