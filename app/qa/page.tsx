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
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 bg-surface border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">🧗</span>
            <span className="text-lg font-semibold">Climbing Coach</span>
          </Link>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-md mx-auto px-4 py-6 pb-24">
        <h1 className="text-2xl font-bold mb-6">🤔 Q&A</h1>

        {/* 質問入力エリア */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            クライミングについて質問する
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="例: ダイノのコツを教えて"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[120px] resize-none"
            disabled={loading}
          />
          <button
            onClick={handleAsk}
            disabled={loading || !question.trim()}
            className="w-full mt-4 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '考えています...' : '質問する'}
          </button>
        </div>

        {/* 回答エリア */}
        {answer && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🧑‍🏫</span>
              <h2 className="text-lg font-semibold text-blue-900">コーチの回答</h2>
            </div>
            <p className="text-gray-800 whitespace-pre-wrap">{answer}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* 例の質問 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">💡 例の質問</h2>
          <div className="space-y-2">
            {exampleQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => setQuestion(q)}
                className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm text-gray-700 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* ボトムナビゲーション */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2">
        <div className="max-w-md mx-auto flex justify-around">
          <Link
            href="/"
            className="flex flex-col items-center gap-1 px-4 py-2 text-gray-600 hover:text-primary transition-colors"
          >
            <span className="text-xl">🏠</span>
            <span className="text-xs font-medium">ホーム</span>
          </Link>
          <Link
            href="/videos"
            className="flex flex-col items-center gap-1 px-4 py-2 text-gray-600 hover:text-primary transition-colors"
          >
            <span className="text-xl">📺</span>
            <span className="text-xs font-medium">動画</span>
          </Link>
          <Link
            href="/qa"
            className="flex flex-col items-center gap-1 px-4 py-2 text-primary"
          >
            <span className="text-xl">🤔</span>
            <span className="text-xs font-medium">Q&A</span>
          </Link>
          <Link
            href="/records"
            className="flex flex-col items-center gap-1 px-4 py-2 text-gray-600 hover:text-primary transition-colors"
          >
            <span className="text-xl">📋</span>
            <span className="text-xs font-medium">記録</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
