'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, MessageSquare, ClipboardList, Zap, Plus, X, MapPin, Clock, Calendar, CheckCircle2, ChevronRight, Edit3, Trash2 } from 'lucide-react';

export interface Route {
  grade: string;
  attempts: number;
  success: boolean;
  notes: string;
}

export interface PracticeRecord {
  id: string;
  gymName?: string;
  date: string | Date;
  duration?: number;
  practiceMenuId?: string;
  videoId?: string;
  routes: Route[];
  reflection?: string;
  nextGoal?: string;
}

export default function RecordsPage() {
  const [records, setRecords] = useState<PracticeRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<PracticeRecord | null>(null);
  const [practiceMenu, setPracticeMenu] = useState<{ id: string; content: string } | null>(null);

  useEffect(() => {
    fetchRecords();
    fetchPracticeMenu();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await fetch('/api/records');
      const data = await response.json();
      const parsed = (data.records || []).map((r: PracticeRecord & { routes: string }) => ({
        ...r,
        routes: typeof r.routes === 'string' ? JSON.parse(r.routes) : r.routes,
      }));
      setRecords(parsed);
    } catch (error) {
      console.error('Failed to fetch records:', error);
    }
  };

  const fetchPracticeMenu = async () => {
    try {
      const response = await fetch('/api/daily-practice');
      const data = await response.json();
      const menu = Array.isArray(data) ? data[0] : data;
      setPracticeMenu(menu ? { id: 'daily', content: menu.greeting } : null);
    } catch (error) {
      console.error('Failed to fetch practice menu:', error);
    }
  };

  const handleAddRecord = () => {
    setCurrentRecord({ id: '', date: new Date().toISOString(), routes: [] } as PracticeRecord);
    setIsModalOpen(true);
  };

  const handleEditRecord = (record: PracticeRecord) => {
    setCurrentRecord(record);
    setIsModalOpen(true);
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm('この記録を削除してもよろしいですか？')) return;
    try {
      await fetch(`/api/records/${id}`, { method: 'DELETE' });
      await fetchRecords();
    } catch (error) {
      console.error('Failed to delete record:', error);
    }
  };

  const handleSaveRecord = async () => {
    if (!currentRecord) return;
    try {
      const body = {
        gymName: currentRecord.gymName,
        duration: currentRecord.duration,
        practiceMenuId: currentRecord.practiceMenuId,
        videoId: currentRecord.videoId,
        routes: currentRecord.routes,
        reflection: currentRecord.reflection,
        nextGoal: currentRecord.nextGoal,
      };

      if (currentRecord.id) {
        await fetch(`/api/records/${currentRecord.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        await fetch('/api/records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }

      setIsModalOpen(false);
      setCurrentRecord(null);
      await fetchRecords();
    } catch (error) {
      console.error('Failed to save record:', error);
    }
  };

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' });

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '未設定';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}時間${mins > 0 ? mins + '分' : ''}` : `${mins}分`;
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
          <button
            onClick={handleAddRecord}
            className="p-2 bg-primary/20 text-primary rounded-xl hover:bg-primary/30 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        <header className="space-y-2">
          <h2 className="text-2xl font-display font-bold text-white">セッションログ</h2>
          <p className="text-white/40 text-sm">あなたの成長の軌跡</p>
        </header>

        {/* Records List */}
        {records.length === 0 ? (
          <div className="glass-card p-12 text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
              <ClipboardList className="text-white/20" size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white/80">まだ記録がありません</h3>
              <p className="text-sm text-white/40">今日の練習を記録して、変化を可視化しましょう</p>
            </div>
            <button
              onClick={handleAddRecord}
              className="neo-button inline-block text-white"
            >
              最初の記録を作成
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {records.map((record) => (
              <motion.div 
                key={record.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-white/90 flex items-center gap-2">
                      <MapPin size={14} className="text-primary" />
                      {record.gymName || 'ホームジム'}
                    </h3>
                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-white/30">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(record.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatDuration(record.duration)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditRecord(record)} className="p-2 text-white/40 hover:text-primary transition-colors">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => handleDeleteRecord(record.id)} className="p-2 text-white/40 hover:text-red-400 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Routes */}
                <div className="p-5 space-y-4">
                  {record.routes.length > 0 ? (
                    <div className="grid gap-3">
                      {record.routes.map((route, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-black text-primary font-display">{route.grade}</span>
                            <div className="w-1 h-1 rounded-full bg-white/20" />
                            <span className="text-[10px] font-bold text-white/40 uppercase">{route.attempts} ATTEMPTS</span>
                          </div>
                          {route.success && <CheckCircle2 size={14} className="text-green-500" />}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-white/20 italic">課題の記録はありません</p>
                  )}

                  {/* Reflection */}
                  {record.reflection && (
                    <div className="pt-2">
                      <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2">振り返り</h4>
                      <div className="p-3 bg-white/5 rounded-xl text-xs text-white/60 leading-relaxed">
                        {record.reflection}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg glass-card p-0 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <h2 className="text-lg font-bold text-white">
                  {currentRecord?.id ? '記録を編集' : '新しい記録'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-white/40 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">ジム名</label>
                    <input
                      type="text"
                      value={currentRecord?.gymName || ''}
                      onChange={(e) => setCurrentRecord({ ...currentRecord!, gymName: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                      placeholder="例: B-PUMP"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">時間 (分)</label>
                    <input
                      type="number"
                      value={currentRecord?.duration || ''}
                      onChange={(e) =>
                        setCurrentRecord({ ...currentRecord!, duration: parseInt(e.target.value) || undefined })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                      placeholder="90"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">課題</label>
                    <button
                      onClick={() => {
                        setCurrentRecord({
                          ...currentRecord!,
                          routes: [...(currentRecord?.routes || []), { grade: '', attempts: 1, success: true, notes: '' }],
                        });
                      }}
                      className="text-[10px] font-bold text-primary hover:underline"
                    >
                      + 追加
                    </button>
                  </div>
                  <div className="space-y-3">
                    {(currentRecord?.routes || []).map((route, idx) => (
                      <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-2xl relative group">
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <input
                            type="text"
                            value={route.grade}
                            onChange={(e) => {
                              const newRoutes = [...currentRecord!.routes];
                              newRoutes[idx].grade = e.target.value;
                              setCurrentRecord({ ...currentRecord!, routes: newRoutes });
                            }}
                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
                            placeholder="5.10c"
                          />
                          <input
                            type="number"
                            value={route.attempts}
                            onChange={(e) => {
                              const newRoutes = [...currentRecord!.routes];
                              newRoutes[idx].attempts = parseInt(e.target.value) || 1;
                              setCurrentRecord({ ...currentRecord!, routes: newRoutes });
                            }}
                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
                            min="1"
                          />
                          <button
                            onClick={() => {
                              const newRoutes = [...currentRecord!.routes];
                              newRoutes[idx].success = !newRoutes[idx].success;
                              setCurrentRecord({ ...currentRecord!, routes: newRoutes });
                            }}
                            className={`rounded-lg text-[10px] font-bold transition-all ${
                              route.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {route.success ? '成功' : '失敗'}
                          </button>
                        </div>
                        <button
                          onClick={() => {
                            const newRoutes = currentRecord!.routes.filter((_, i) => i !== idx);
                            setCurrentRecord({ ...currentRecord!, routes: newRoutes });
                          }}
                          className="absolute -top-1 -right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={10} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">振り返り / 目標</label>
                  <textarea
                    value={currentRecord?.reflection || ''}
                    onChange={(e) => setCurrentRecord({ ...currentRecord!, reflection: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors h-24 resize-none"
                    placeholder="今日の気づきは？"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-white/10 flex gap-3 bg-white/[0.02]">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-white/10 rounded-xl text-xs font-bold text-white/40 hover:bg-white/5 transition-colors"
                >
                  キャンセル
                </button>
                <button 
                  onClick={handleSaveRecord}
                  className="flex-[2] neo-button text-white"
                >
                  記録を保存
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
          <Link href="/records" className="nav-item active px-6 py-3">
            <ClipboardList size={24} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">記録</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
