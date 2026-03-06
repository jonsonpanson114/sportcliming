'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export interface Route {
  grade: string;
  attempts: number;
  success: boolean;
  notes: string;
}

export interface PracticeRecord {
  id: string;
  gymName?: string;
  date: Date;
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
      const response = await fetch('/api/practice');
      const data = await response.json();
      setPracticeMenu(data.menu || null);
    } catch (error) {
      console.error('Failed to fetch practice menu:', error);
    }
  };

  const handleAddRecord = () => {
    setCurrentRecord({ id: '', date: new Date(), routes: [] } as PracticeRecord);
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

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' });

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '未記入';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}時間${mins > 0 ? mins + '分' : ''}` : `${mins}分`;
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-semibold text-[#0066cc]">Climb</span>
            <span className="text-xl font-semibold text-[#1a1a1a]">Coach</span>
          </Link>
          <button
            onClick={handleAddRecord}
            className="bg-[#0066cc] text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            新規作成
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-5 pb-20">
        {/* Today's Practice Menu */}
        {practiceMenu && (
          <div className="mb-5">
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🎯</span>
                <h2 className="font-semibold">今日の練習メニュー</h2>
              </div>
              <p className="text-sm text-[#666] mb-3">{practiceMenu.content}</p>
              <button
                onClick={() => {
                  setCurrentRecord({
                    id: '',
                    date: new Date(),
                    practiceMenuId: practiceMenu.id,
                    routes: [],
                  } as PracticeRecord);
                  setIsModalOpen(true);
                }}
                className="w-full bg-[#e6f0ff] text-[#0066cc] px-4 py-3 rounded-xl text-sm font-medium"
              >
                このメニューで記録
              </button>
            </div>
          </div>
        )}

        {/* Records List */}
        {records.length === 0 ? (
          <div className="bg-white border border-gray-200 border-dashed rounded-2xl p-8 text-center">
            <div className="mb-4">
              <span className="text-5xl">📝</span>
            </div>
            <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">まだ記録がありません</h3>
            <p className="text-sm text-[#999] mb-6">今日の練習を記録しましょう！</p>
            <button
              onClick={handleAddRecord}
              className="bg-[#0066cc] text-white px-6 py-3 rounded-xl font-medium"
            >
              最初の記録を作成
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <div key={record.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                {/* Card Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-[#1a1a1a]">{record.gymName || '未記入'}</h3>
                    <div className="flex items-center gap-2 text-sm text-[#999] mt-1">
                      <span>{formatDate(record.date)}</span>
                      <span>・</span>
                      <span>{formatDuration(record.duration)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditRecord(record)}
                      className="text-[#0066cc] text-sm font-medium hover:underline"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDeleteRecord(record.id)}
                      className="text-[#ef4444] text-sm font-medium hover:underline"
                    >
                      削除
                    </button>
                  </div>
                </div>

                {/* Routes */}
                <div className="p-4">
                  {record.routes.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-[#666] mb-3">課題</h4>
                      {record.routes.map((route, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-xl border ${
                            route.success ? 'border-[#bbf7d0] bg-[#f0fdf4]' : 'border-[#fecaca] bg-[#fef2f2]'
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-lg font-bold">{route.grade}</span>
                            <span className="text-xs text-[#666] bg-gray-100 px-2 py-1 rounded-full">
                              {route.attempts}回
                            </span>
                            <span className={`text-sm font-medium ${
                              route.success ? 'text-[#166534]' : 'text-[#991b1b]'
                            }`}>
                              {route.success ? '成功' : '失敗'}
                            </span>
                          </div>
                          {route.notes && <p className="text-sm text-[#666] mt-1">{route.notes}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#999]">課題はありません</p>
                  )}

                  {/* Reflection & Next Goal */}
                  {(record.reflection || record.nextGoal) && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="space-y-3">
                        {record.reflection && (
                          <div>
                            <h4 className="text-sm font-medium text-[#666] mb-2">振り返り</h4>
                            <p className="text-sm text-[#666] bg-[#fafafa] rounded-lg p-3 border border-gray-100">
                              {record.reflection}
                            </p>
                          </div>
                        )}
                        {record.nextGoal && (
                          <div>
                            <h4 className="text-sm font-medium text-[#666] mb-2">次回の目標</h4>
                            <p className="text-sm text-[#666] bg-[#fafafa] rounded-lg p-3 border border-gray-100">
                              {record.nextGoal}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {currentRecord?.id ? '記録を編集' : '新しい記録を作成'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setCurrentRecord(null);
                }}
                className="text-[#999] hover:text-[#1a1a1a]"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Gym Name */}
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">ジム名</label>
                <input
                  type="text"
                  value={currentRecord?.gymName || ''}
                  onChange={(e) => setCurrentRecord({ ...currentRecord!, gymName: e.target.value })}
                  className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl focus:outline-none focus:border-[#0066cc]"
                  placeholder="例: クライミングジムXXX"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">練習時間（分）</label>
                <input
                  type="number"
                  value={currentRecord?.duration || ''}
                  onChange={(e) =>
                    setCurrentRecord({ ...currentRecord!, duration: parseInt(e.target.value) || undefined })
                  }
                  className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl focus:outline-none focus:border-[#0066cc]"
                  placeholder="例: 90"
                  min="0"
                />
              </div>

              {/* Routes */}
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-3">課題</label>
                <div className="space-y-3">
                  {(currentRecord?.routes || []).map((route, index) => (
                    <div key={index} className="p-4 bg-[#fafafa] rounded-xl border border-gray-200">
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs text-[#666] mb-1">グレード</label>
                          <input
                            type="text"
                            value={route.grade}
                            onChange={(e) => {
                              const newRoutes = [...(currentRecord?.routes || [])];
                              newRoutes[index] = { ...route, grade: e.target.value };
                              setCurrentRecord({ ...currentRecord!, routes: newRoutes });
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0066cc]"
                            placeholder="5.10c"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[#666] mb-1">試行回数</label>
                          <input
                            type="number"
                            value={route.attempts}
                            onChange={(e) => {
                              const newRoutes = [...(currentRecord?.routes || [])];
                              newRoutes[index] = { ...route, attempts: parseInt(e.target.value) || 1 };
                              setCurrentRecord({ ...currentRecord!, routes: newRoutes });
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0066cc]"
                            min="1"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <label className="flex items-center gap-2 text-sm font-medium text-[#1a1a1a]">
                          <input
                            type="checkbox"
                            checked={route.success}
                            onChange={(e) => {
                              const newRoutes = [...(currentRecord?.routes || [])];
                              newRoutes[index] = { ...route, success: e.target.checked };
                              setCurrentRecord({ ...currentRecord!, routes: newRoutes });
                            }}
                            className="h-5 w-5 accent-[#0066cc]"
                          />
                          <span>成功した</span>
                        </label>
                      </div>
                      <div>
                        <label className="block text-xs text-[#666] mb-1">メモ</label>
                        <textarea
                          value={route.notes}
                          onChange={(e) => {
                            const newRoutes = [...(currentRecord?.routes || [])];
                            newRoutes[index] = { ...route, notes: e.target.value };
                            setCurrentRecord({ ...currentRecord!, routes: newRoutes });
                          }}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0066cc] resize-none"
                          rows={2}
                          placeholder="メモを入力..."
                        />
                      </div>
                      <button
                        onClick={() => {
                          const newRoutes = [...(currentRecord?.routes || [])];
                          newRoutes.splice(index, 1);
                          setCurrentRecord({ ...currentRecord!, routes: newRoutes });
                        }}
                        className="w-full text-[#ef4444] text-sm font-medium py-2 border border-[#fecaca] rounded-lg hover:bg-[#fef2f2] mt-2"
                      >
                        課題を削除
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setCurrentRecord({
                        ...currentRecord!,
                        routes: [...(currentRecord?.routes || []), { grade: '', attempts: 1, success: false, notes: '' }],
                      });
                    }}
                    className="w-full text-[#0066cc] text-sm font-medium py-3 border border border-[#b3d9ff] rounded-lg hover:bg-[#e6f0ff]"
                  >
                    課題を追加
                  </button>
                </div>
              </div>

              {/* Reflection */}
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">振り返り</label>
                <textarea
                  value={currentRecord?.reflection || ''}
                  onChange={(e) => setCurrentRecord({ ...currentRecord!, reflection: e.target.value })}
                  className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl focus:outline-none focus:border-[#0066cc] resize-none"
                  rows={3}
                  placeholder="今日の練習を振り返ってみよう..."
                />
              </div>

              {/* Next Goal */}
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">次回の目標</label>
                <textarea
                  value={currentRecord?.nextGoal || ''}
                  onChange={(e) => setCurrentRecord({ ...currentRecord!, nextGoal: e.target.value })}
                  className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl focus:outline-none focus:border-[#0066cc] resize-none"
                  rows={2}
                  placeholder="次回の目標を設定しよう..."
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setCurrentRecord(null);
                  }}
                  className="flex-1 border border-gray-200 text-[#666] px-6 py-3 rounded-xl font-medium hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button onClick={handleSaveRecord} className="flex-1 bg-[#0066cc] text-white px-6 py-3 rounded-xl font-medium">
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
            className="flex-1 flex flex-col items-center justify-center gap-1 text-[#999] hover:text-[#0066cc]"
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
            className="flex-1 flex flex-col items-center justify-center gap-1 text-[#0066cc]"
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
