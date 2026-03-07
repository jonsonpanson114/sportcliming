'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Trophy, Play, MessageCircle, ClipboardList, Target, Flame, RefreshCw, Layers, Zap, Plus, Lightbulb } from 'lucide-react';

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
    setSyncStatus('繝代Ν繧ｹ蜷梧悄荳ｭ...');
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: 'UCBtRI97Yh3l6pZzLvBYPq8Q', limit: 5 }),
      });
      if (response.ok) setSyncStatus('蜷梧悄螳御ｺ・);
      else setSyncStatus('蜷梧悄螟ｱ謨・);
    } catch (error) {
      setSyncStatus('繧ｨ繝ｩ繝ｼ逋ｺ逕・);
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
              <p className="text-[10px] text-primary font-bold tracking-[0.2em] uppercase">AI 繧ｯ繝ｩ繧､繝溘Φ繧ｰ繧ｳ繝ｼ繝・/p>
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
              縺薙ｓ縺ｫ縺｡縺ｯ縲・span className="text-white font-bold">繧ｯ繝ｩ繧､繝槭・</span>
            </h2>
            <p className="text-white/40 text-sm">鬆ゆｸ翫′蠕・▲縺ｦ縺・ｋ縲よｺ門ｙ縺ｯ縺・＞縺具ｼ・/p>
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
                  <h3 className="text-lg font-bold">莉頑律縺ｮ邱ｴ鄙偵Γ繝九Η繝ｼ</h3>
                  <p className="text-white/40 text-xs">AI縺悟・譫舌＠縺滓怙驕ｩ縺ｪ繝医Ξ繝ｼ繝九Φ繧ｰ</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setLoading(true);
                  location.reload();
                }}
                className="p-2 text-white/40 hover:text-white transition-colors"
                title="繝｡繝九Η繝ｼ繧呈峩譁ｰ"
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
                              {item.difficulty === 'beginner' ? '蛻晉ｴ・ : item.difficulty === 'intermediate' ? '荳ｭ邏・ : '荳顔ｴ・}
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
                    {loading ? '繝代Ν繧ｹ繧貞・譫蝉ｸｭ...' : '莉頑律縺ｮ繝｡繝九Η繝ｼ縺ｯ縺ゅｊ縺ｾ縺帙ｓ'}
                  </p>
                </div>
              )}
            </div>

            <Link href="/practice" className="neo-button w-full mt-6 text-center block text-white">
              繧ｻ繝・す繝ｧ繝ｳ繧帝幕蟋・            </Link>
          </motion.div>
        </section>

        {/* Main Stats / Record Quick Access */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-bold text-white/40 tracking-[0.2em] uppercase">縺ゅ↑縺溘・騾ｲ謐・/h3>
            <Link href="/records" className="text-xs text-primary font-bold hover:underline">蜈ｨ險倬鹸繧定ｦ九ｋ</Link>
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
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">邯咏ｶ壽律謨ｰ</span>
              </div>
              <p className="text-2xl font-display font-black text-white">7 <span className="text-sm font-medium text-white/40">譌･髢・/span></p>
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
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">譛鬮倥げ繝ｬ繝ｼ繝・/span>
              </div>
              <p className="text-2xl font-display font-black text-white">B3 <span className="text-sm font-medium text-white/40">邏・/span></p>
            </motion.div>
          </div>

          <Link href="/records" className="block p-4 glass-card border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all text-center group">
            <div className="flex items-center justify-center gap-2">
              <Plus className="text-primary w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-sm text-primary uppercase tracking-widest">繧ｻ繝・す繝ｧ繝ｳ繧定ｨ倬鹸縺吶ｋ</span>
            </div>
          </Link>

          <Link href="/tips" className="block p-4 glass-card border-accent/20 bg-accent/5 hover:bg-accent/10 transition-all text-center group">
            <div className="flex items-center justify-center gap-2">
              <Lightbulb className="text-accent w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-sm text-accent uppercase tracking-widest">繝繝ｼ繝悶・讌ｵ諢上ｒ隕九ｋ</span>
            </div>
          </Link>
        </section>

        {/* Search Pulse */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-bold text-white/40 tracking-[0.2em] uppercase">蜍慕判繧呈爾縺・/h3>
            <Link href="/videos" className="text-xs text-primary font-bold hover:underline">縺吶∋縺ｦ陦ｨ遉ｺ</Link>
          </div>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity blur" />
            <div className="relative bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 transition-all">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
              <input 
                type="text" 
                placeholder="繝・け繝九ャ繧ｯ繧・虚逕ｻ繧呈､懃ｴ｢..."
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
            {syncing ? '繝代Ν繧ｹ蜷梧悄荳ｭ...' : (syncStatus || '繧ｳ繧｢繧ｨ繝ｳ繧ｸ繝ｳ遞ｼ蜒堺ｸｭ')}
          </button>
        </div>
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-md z-[100]">
        <div className="glass-card p-2 flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-white/10">
          <Link href="/" className="nav-item active px-6 py-3">
            <Zap size={24} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">繝帙・繝</span>
          </Link>
          <Link href="/videos" className="nav-item px-6 py-3 text-white/30 hover:text-white">
            <Play size={24} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">蜍慕判</span>
          </Link>
          <Link href="/qa" className="nav-item px-6 py-3 text-white/30 hover:text-white">
            <MessageCircle size={24} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">繧ｳ繝ｼ繝・/span>
          </Link>
          <Link href="/records" className="nav-item px-6 py-3 text-white/30 hover:text-white">
            <ClipboardList size={24} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">險倬鹸</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
