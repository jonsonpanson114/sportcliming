'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, MessageCircle, ClipboardList, Zap, Trash2, Calendar, Clock } from 'lucide-react';

interface RouteItem {
  grade: string;
  attempts: number;
  success: boolean;
  notes?: string;
}

interface PracticeRecord {
  id: string;
  gymName?: string;
  date: string | Date;
  duration?: number;
  routes: RouteItem[] | string;
  reflection?: string;
}

export default function RecordsPage() {
  const [records, setRecords] = useState<PracticeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    try {
      const response = await fetch('/api/records');
      const data = await response.json();
      const parsed = (data.records || []).map((r: PracticeRecord) => ({
        ...r,
        routes: typeof r.routes === 'string' ? JSON.parse(r.routes) : r.routes,
      }));
      setRecords(parsed);
    } catch (error) {
      console.error('Failed to fetch records:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleDeleteRecord = async (id: string) => {
    if (!confirm('この記録を削除しますか？')) return;
    try {
      await fetch(`/api/records/${id}`, { method: 'DELETE' });
      await fetchRecords();
    } catch (error) {
      console.error('Failed to delete record:', error);
    }
  };

  const formatDate = (date: string | Date) => new Date(date).toLocaleDateString('ja-JP');
  const formatDuration = (minutes?: number) => {
    if (!minutes) return '未設定';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}時間${mins > 0 ? `${mins}分` : ''}` : `${mins}分`;
  };

  return (
    <div className="min-h-screen pb-28">
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-primary to-accent rounded-lg flex items-center justify-center"><Zap className="text-white w-5 h-5" /></div>
            <h1 className="text-lg font-display font-black tracking-tighter text-white">SUMMIT PULSE</h1>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        <header className="space-y-2">
          <h2 className="text-2xl font-display font-bold text-white">セッションログ</h2>
          <p className="text-white/40 text-sm">あなたの練習記録</p>
        </header>

        {loading ? (
          <div className="glass-card p-12 text-center"><p className="text-white/40">読み込み中...</p></div>
        ) : records.length === 0 ? (
          <div className="glass-card p-12 text-center"><p className="text-white/20">まだ記録がありません</p></div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <motion.div key={record.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-bold">{record.gymName || 'ホームジム'}</h3>
                    <div className="flex gap-4 text-xs text-white/40 mt-1">
                      <span className="flex items-center gap-1"><Calendar size={12} />{formatDate(record.date)}</span>
                      <span className="flex items-center gap-1"><Clock size={12} />{formatDuration(record.duration)}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteRecord(record.id)} className="p-2 text-white/40 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                </div>
                {record.reflection && <p className="text-sm text-white/60 leading-relaxed">{record.reflection}</p>}
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-md z-[100]">
        <div className="glass-card p-2 flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-white/10">
          <Link href="/" className="nav-item px-6 py-3 text-white/30 hover:text-white"><Zap size={24} /><span className="text-[9px] font-bold uppercase tracking-tighter">ホーム</span></Link>
          <Link href="/videos" className="nav-item px-6 py-3 text-white/30 hover:text-white"><Play size={24} /><span className="text-[9px] font-bold uppercase tracking-tighter">動画</span></Link>
          <Link href="/qa" className="nav-item px-6 py-3 text-white/30 hover:text-white"><MessageCircle size={24} /><span className="text-[9px] font-bold uppercase tracking-tighter">コーチ</span></Link>
          <Link href="/records" className="nav-item active px-6 py-3"><ClipboardList size={24} /><span className="text-[9px] font-bold uppercase tracking-tighter">記録</span></Link>
        </div>
      </nav>
    </div>
  );
}
