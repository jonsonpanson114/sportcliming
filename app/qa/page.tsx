'use client';

import { useState } from 'react';
import Link from 'next/link';

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
        setError(data.error || '質問に失敗しました');
      }
    } catch (e) {
      setError('エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const exampleQuestions = [
    'ダイノのコツを教えて',
    '初心者が最初に覚えるべきことは？',
    'フラッグの使い方を教えて',
    'オブザベーションで気をつけることは？',
  ];

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-semibold text-[#0066cc]">Climb</span>
            <span className="text-xl font-semibold text-[#1a1a1a]">Coach</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-5 pb-20">
        <h1 className="text-xl font-semibold mb-4">Q&A</h1>

        {/* Question Input */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5">
          <label className="block text-sm font-medium text-[#1a1a1a] mb-3">
            クライミングについて質問する
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="例: ダイノのコツを教えて"
            className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl focus:outline-none focus:border-[#0066cc] min-h-[120px] resize-none text-sm"
            disabled={loading}
          />
          <button
            onClick={handleAsk}
            disabled={loading || !question.trim()}
            className="w-full mt-3 bg-[#0066cc] text-white px-6 py-3 rounded-xl font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? '考えています...' : '質問する'}
          </button>
        </div>

        {/* Answer */}
        {answer && (
          <div className="bg-[#e6f0ff] border border-[#b3d9ff] rounded-2xl p-5 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <span>🧑‍🏫</span>
              <h2 className="font-medium text-[#1a1a1a]">コーチの回答</h2>
            </div>
            <p className="text-sm text-[#1a1a1a] whitespace-pre-wrap leading-relaxed">{answer}</p>
          </div>
        )}

        {error && (
          <div className="bg-[#fee2e2] border border-[#fca5a5] rounded-xl p-4 mb-5">
            <p className="text-sm text-[#991b1b]">{error}</p>
          </div>
        )}

        {/* Examples */}
        <div>
          <h2 className="text-sm font-medium text-[#666] mb-3">💡 例の質問</h2>
          <div className="space-y-2">
            {exampleQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => setQuestion(q)}
                className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-[#666] hover:border-gray-300 active:bg-gray-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-lg mx-auto flex justify-around h-16">
          <Link
            href="/"
            className="flex-1 flex flex-col items-center justify-center gap-1 text-[#999] hover:text-[#0066cc]"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="text-xs font-medium">ホーム</span>
          </Link>
          <Link
            href="/videos"
            className="flex-1 flex flex-col items-center justify-center gap-1 text-[#999] hover:text-[#0066cc]"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="14" x="2" y="3" rx="2" ry="2" />
              <line x1="8" x2="16" y1="21" y2="21" />
              <line x1="12" x2="12" y1="17" y2="21" />
            </svg>
            <span className="text-xs font-medium">動画</span>
          </Link>
          <Link
            href="/qa"
            className="flex-1 flex flex-col items-center justify-center gap-1 text-[#0066cc]"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <path d="M12 17h.01" />
            </svg>
            <span className="text-xs font-medium">Q&A</span>
          </Link>
          <Link
            href="/records"
            className="flex-1 flex flex-col items-center justify-center gap-1 text-[#999] hover:text-[#0066cc]"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span className="text-xs font-medium">記録</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
