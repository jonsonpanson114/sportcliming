'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, Play, CheckCircle2, Clock, ChevronLeft, Target } from 'lucide-react';

interface DailyMenuItem {
  name: string;
  description: string;
  duration: string;
}

export default function PracticePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState<DailyMenuItem[]>([]);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await fetch('/api/daily-practice');
        if (res.ok) {
          const data = await res.json();
          setMenu(data.dailyMenu || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (s: number) => {
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    return `${hrs > 0 ? `${hrs}:` : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFinish = () => {
    const duration = Math.floor(seconds / 60);
    router.push(`/records/new?duration=${duration}`);
  };

  return (
    <div className="min-h-screen pb-28">
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ChevronLeft size={20} />
            <span className="text-sm font-bold">戻る</span>
          </Link>
          <div className="flex items-center gap-2">
            <Zap className="text-primary w-5 h-5" />
            <h1 className="text-lg font-display font-black tracking-tighter text-white">SUMMIT PULSE</h1>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-10">
        <section className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            セッション進行中
          </div>
          <div className="text-6xl font-display font-black text-white tabular-nums tracking-tighter">
            {formatTime(seconds)}
          </div>
          <button 
            onClick={() => setIsActive(!isActive)}
            className="text-xs font-bold text-white/40 hover:text-white transition-colors flex items-center gap-2 mx-auto"
          >
            {isActive ? <><Clock size={14} /> 一時停止</> : <><Play size={14} /> 再開</>}
          </button>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1 text-white/40">
            <Target size={16} />
            <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase">今日のミッション</h3>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              <div className="h-40 glass-card flex items-center justify-center">
                <p className="text-white/20 text-sm">メニューを読み込み中...</p>
              </div>
            ) : menu.length > 0 ? (
              menu.map((item, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="glass-card p-5 space-y-2 border-white/5 bg-white/[0.02]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="font-bold text-white/90 leading-tight">{item.name}</h4>
                    <span className="text-primary text-[10px] font-black whitespace-nowrap">{item.duration}</span>
                  </div>
                  <p className="text-xs text-white/40 leading-relaxed">{item.description}</p>
                </motion.div>
              ))
            ) : (
              <div className="glass-card p-8 text-center border-dashed border-white/10">
                <p className="text-white/20 text-sm">メニューを設定していません</p>
              </div>
            )}
          </div>
        </section>

        <button onClick={handleFinish} className="neo-button w-full py-5 text-white flex items-center justify-center gap-3 group">
          <CheckCircle2 className="group-hover:scale-110 transition-transform" />
          <span className="text-lg font-bold">セッションを終了して記録する</span>
        </button>
      </main>
    </div>
  );
}
