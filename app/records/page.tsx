'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

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
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📋</span>
              <h1 className="text-xl font-bold text-gray-900">練習記録</h1>
            </div>
            <Button onClick={handleAddRecord} variant="primary" size="md">
              <Plus className="h-5 w-5 mr-2" />
              新規作成
            </Button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-md mx-auto px-4 py-6 pb-24">
        {/* 今日の練習メニュー */}
        {practiceMenu && (
          <div className="mb-6">
            <div className="bg-gradient-to-br from-primary to-orange-500 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl">🎯</span>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">今日の練習メニュー</h2>
                  <p className="text-white/90 text-base">{practiceMenu.content}</p>
                </div>
              </div>
              <Button
                onClick={() => {
                  setCurrentRecord({
                    id: '',
                    date: new Date(),
                    practiceMenuId: practiceMenu.id,
                    routes: [],
                  } as PracticeRecord);
                  setIsModalOpen(true);
                }}
                variant="ghost"
                className="w-full bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 text-lg py-4"
              >
                このメニューで記録
              </Button>
            </div>
          </div>
        )}

        {/* 練習記録一覧 */}
        <div className="space-y-4">
          {records.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center border-2 border-dashed border-gray-300">
              <div className="mb-4">
                <span className="text-5xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">まだ記録がありません</h3>
              <p className="text-gray-500 mb-6">今日の練習を記録しましょう！</p>
              <Button onClick={handleAddRecord} variant="primary" size="lg">
                <Plus className="h-5 w-5 mr-2" />
                最初の記録を作成
              </Button>
            </div>
          ) : (
            records.map((record) => (
              <div key={record.id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
                {/* カードヘッダー */}
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-gray-900">{record.gymName || '未記入'}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{formatDate(record.date)}</span>
                        <span>・{formatDuration(record.duration)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleEditRecord(record)} variant="ghost" size="sm">
                        編集
                      </Button>
                      <Button onClick={() => handleDeleteRecord(record.id)} variant="danger" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 課題一覧 */}
                <div className="p-4">
                  {record.routes.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">課題</h4>
                      {record.routes.map((route, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border-2 ${route.success ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                            }`}
                        >
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-xl font-bold">{route.grade}</span>
                            <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                              {route.attempts}回
                            </span>
                            <span className={`text-sm font-semibold ${route.success ? 'text-green-600' : 'text-red-600'}`}>
                              {route.success ? '成功' : '失敗'}
                            </span>
                          </div>
                          {route.notes && <p className="text-sm text-gray-600 mt-1">{route.notes}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">課題はありません</p>
                  )}
                </div>

                {/* 振り返り */}
                {(record.reflection || record.nextGoal) && (
                  <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="space-y-4">
                      {record.reflection && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">振り返り</h4>
                          <p className="text-sm text-gray-600 bg-white rounded-lg p-3 border border-gray-200">
                            {record.reflection}
                          </p>
                        </div>
                      )}
                      {record.nextGoal && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">次回の目標</h4>
                          <p className="text-sm text-gray-600 bg-white rounded-lg p-3 border border-gray-200">
                            {record.nextGoal}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>

      {/* モーダル */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCurrentRecord(null);
        }}
        title={currentRecord?.id ? '記録を編集' : '新しい記録を作成'}
      >
        <div className="space-y-4">
          {/* ジム名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ジム名</label>
            <input
              type="text"
              value={currentRecord?.gymName || ''}
              onChange={(e) => setCurrentRecord({ ...currentRecord!, gymName: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="例: クライミングジムXXX"
            />
          </div>

          {/* 練習時間 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">練習時間（分）</label>
            <input
              type="number"
              value={currentRecord?.duration || ''}
              onChange={(e) =>
                setCurrentRecord({ ...currentRecord!, duration: parseInt(e.target.value) || undefined })
              }
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="例: 90"
              min="0"
            />
          </div>

          {/* 課題 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">課題</label>
            <div className="space-y-3">
              {(currentRecord?.routes || []).map((route, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">グレード</label>
                      <input
                        type="text"
                        value={route.grade}
                        onChange={(e) => {
                          const newRoutes = [...(currentRecord?.routes || [])];
                          newRoutes[index] = { ...route, grade: e.target.value };
                          setCurrentRecord({ ...currentRecord!, routes: newRoutes });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="5.10c"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">試行回数</label>
                      <input
                        type="number"
                        value={route.attempts}
                        onChange={(e) => {
                          const newRoutes = [...(currentRecord?.routes || [])];
                          newRoutes[index] = { ...route, attempts: parseInt(e.target.value) || 1 };
                          setCurrentRecord({ ...currentRecord!, routes: newRoutes });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        min="1"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mb-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={route.success}
                        onChange={(e) => {
                          const newRoutes = [...(currentRecord?.routes || [])];
                          newRoutes[index] = { ...route, success: e.target.checked };
                          setCurrentRecord({ ...currentRecord!, routes: newRoutes });
                        }}
                        className="h-5 w-5 text-primary focus:ring-2 focus:ring-primary"
                      />
                      <span>成功した</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">メモ</label>
                    <textarea
                      value={route.notes}
                      onChange={(e) => {
                        const newRoutes = [...(currentRecord?.routes || [])];
                        newRoutes[index] = { ...route, notes: e.target.value };
                        setCurrentRecord({ ...currentRecord!, routes: newRoutes });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
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
                    className="w-full text-red-500 hover:text-red-700 text-sm font-semibold py-2 border border-red-300 rounded-lg hover:bg-red-50 mt-2"
                  >
                    課題を削除
                  </button>
                </div>
              ))}
              <Button
                onClick={() => {
                  setCurrentRecord({
                    ...currentRecord!,
                    routes: [...(currentRecord?.routes || []), { grade: '', attempts: 1, success: false, notes: '' }],
                  });
                }}
                variant="ghost"
                size="md"
                className="w-full text-primary border-2 border-primary/30 hover:bg-primary/5"
              >
                課題を追加
              </Button>
            </div>
          </div>

          {/* 振り返り */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">振り返り</label>
            <textarea
              value={currentRecord?.reflection || ''}
              onChange={(e) => setCurrentRecord({ ...currentRecord!, reflection: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={3}
              placeholder="今日の練習を振り返ってみよう..."
            />
          </div>

          {/* 次回の目標 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">次回の目標</label>
            <textarea
              value={currentRecord?.nextGoal || ''}
              onChange={(e) => setCurrentRecord({ ...currentRecord!, nextGoal: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={2}
              placeholder="次回の目標を設定しよう..."
            />
          </div>

          {/* ボタン */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => {
                setIsModalOpen(false);
                setCurrentRecord(null);
              }}
              variant="ghost"
              fullWidth
              size="md"
            >
              キャンセル
            </Button>
            <Button onClick={handleSaveRecord} variant="primary" fullWidth size="md">
              保存
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
