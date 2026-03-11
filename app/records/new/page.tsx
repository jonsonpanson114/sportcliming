'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, ClipboardList, Send, ChevronLeft, MapPin, Clock, Edit3, Target, Plus, Trash2 } from 'lucide-react';

function NewRecordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDuration = searchParams.get('duration') || '';

  const [gymName, setGymName] = useState('');
  const [duration, setDuration] = useState(initialDuration);
  const [reflection, setReflection] = useState('');
  const [nextGoal, setNextGoal] = useState('');
  const [routes, setRoutes] = useState([{ grade: '', attempts: 1, success: true }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddRoute = () => {
    setRoutes([...routes, { grade: '', attempts: 1, success: true }]);
  };

  const handleRemoveRoute = (index: number) => {
    setRoutes(routes.filter((_, i) => i !== index));
  };

  const handleRouteChange = (index: number, field: string, value: any) => {
    const newRoutes = [...routes];
    (newRoutes[index] as any)[field] = value;
    setRoutes(newRoutes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gymName,
          duration: parseInt(duration) || 0,
          routes,
          reflection,
          nextGoal,
        }),
      });

      if (res.ok) {
        router.push('/records');
      } else {
        alert('保存に失敗しました');
      }
    } catch (error) {
      console.error(error);
      alert('エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 基本情報 */}
      <section className="space-y-4">
        <label className="block space-y-2">
          <span className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">
            <MapPin size={14} /> ジム名
          </span>
          <input 
            type="text" 
            value={gymName} 
            onChange={e => setGymName(e.target.value)}
            placeholder="例: B-PUMP 荻窪"
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors"
          />
        </label>

        <label className="block space-y-2">
          <span className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">
            <Clock size={14} /> 練習時間 (分)
          </span>
          <input 
            type="number" 
            value={duration} 
            onChange={e => setDuration(e.target.value)}
            placeholder="例: 120"
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors"
          />
        </label>
      </section>

      {/* 課題の記録 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <span className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
            <Target size={14} /> 登った課題
          </span>
          <button type="button" onClick={handleAddRoute} className="text-primary text-xs font-bold flex items-center gap-1">
            <Plus size={14} /> 追加
          </button>
        </div>
        
        <div className="space-y-3">
          {routes.map((route, i) => (
            <div key={i} className="glass-card p-4 flex items-center gap-3 border-white/5 bg-white/[0.02]">
              <input 
                type="text" 
                value={route.grade} 
                onChange={e => handleRouteChange(i, 'grade', e.target.value)}
                placeholder="4級" 
                className="w-20 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-center focus:outline-none focus:border-primary/50"
              />
              <div className="flex-1 flex items-center justify-center gap-2">
                <button 
                  type="button" 
                  onClick={() => handleRouteChange(i, 'success', !route.success)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                    route.success ? 'bg-primary text-white' : 'bg-white/5 text-white/20 border border-white/10'
                  }`}
                >
                  {route.success ? '完登' : '未完'}
                </button>
              </div>
              <button type="button" onClick={() => handleRemoveRoute(i)} className="p-2 text-white/20 hover:text-red-400 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 振り返り */}
      <section className="space-y-4">
        <label className="block space-y-2">
          <span className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">
            <Edit3 size={14} /> 今日の振り返り
          </span>
          <textarea 
            value={reflection} 
            onChange={e => setReflection(e.target.value)}
            placeholder="意識したこと、良かった点、課題など..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors min-h-[120px] resize-none text-sm"
          />
        </label>
      </section>

      <button 
        type="submit" 
        disabled={isSubmitting}
        className="neo-button w-full py-5 text-white flex items-center justify-center gap-3 disabled:opacity-50"
      >
        <Send size={20} />
        <span className="text-lg font-bold">{isSubmitting ? '保存中...' : '記録を保存する'}</span>
      </button>
    </form>
  );
}

export default function NewRecordPage() {
  return (
    <div className="min-h-screen pb-28">
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/records" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ChevronLeft size={20} />
            <span className="text-sm font-bold">戻る</span>
          </Link>
          <div className="flex items-center gap-2">
            <ClipboardList className="text-primary w-5 h-5" />
            <h1 className="text-lg font-display font-black tracking-tighter text-white">セッション記録</h1>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <Suspense fallback={<div className="text-white/20 text-center">読み込み中...</div>}>
          <NewRecordForm />
        </Suspense>
      </main>
    </div>
  );
}
