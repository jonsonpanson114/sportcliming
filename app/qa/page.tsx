'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Play, ClipboardList, Zap, Send, Sparkles, RefreshCw, HelpCircle } from 'lucide-react';

export default function QAPage() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAsk = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer('');
    setError('');

    try {
      const response = await fetch('/api/qa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();

      if (response.ok) {
        setAnswer(data.answer);
      } else {
        setError(data.error || '質問の送信に失敗しました');
      }
    } catch (e) {
      setError('通信エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const exampleQuestions = [
    'ダイノのコツを教えて',
    '初心者が最初に覚えるべきことは？',
    'フラッグの使い方を教えて',
    'オブザベーションの極意は？',
  ];

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
      <main className="max-max-2xl mx-auto px-6 py-8 space-y-8">
        <header className="space-y-2">
          <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            AI コーチング <Sparkles className="text-primary w-5 h-5" />
          </h2>
          <p className="text-white/40 text-sm">理論と経験に基づいたクライミングの知恵</p>
        </header>

        {/* Question Input */}
        <section>
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2 text-white/60 mb-2">
              <HelpCircle size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">Question</span>
            </div>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="例: ダイノのコツを教えて"
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors min-h-[120px] resize-none text-sm"
              disabled={loading}
            />
            <button
              onClick={handleAsk}
              disabled={loading || !question.trim()}
              className="neo-button w-full flex items-center justify-center gap-2 text-white"
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>思考中...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>コーチに質問する</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Answer Area */}
        <AnimatePresence>
          {(answer || error) && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              {answer ? (
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-accent/30 rounded-3xl blur opacity-75" />
                  <div className="relative glass-card p-6 space-y-4 border-primary/20">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-primary/20 rounded-lg">
                        <Sparkles className="text-primary w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-white/80">コーチの分析結果</h3>
                    </div>
                    <div className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                      {answer}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-card p-4 border-red-500/20 bg-red-500/5 text-center text-red-400 text-sm">
                  {error}
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>

        {/* Example Questions */}
        {!answer && (
          <section className="space-y-4 pt-4">
            <h3 className="text-[10px] font-bold text-white/30 tracking-[0.2em] uppercase px-1">Example Questions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {exampleQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setQuestion(q)}
                  className="text-left p-4 glass-card border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/20 transition-all text-xs text-white/50"
                >
                  {q}
                </button>
              ))}
            </div>
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
          <Link href="/videos" className="nav-item px-6 py-3 text-white/30 hover:text-white">
            <Play size={24} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">動画</span>
          </Link>
          <Link href="/qa" className="nav-item active px-6 py-3">
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
