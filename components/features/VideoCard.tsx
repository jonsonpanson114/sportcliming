'use client';

import Link from 'next/link';
import { Clock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface VideoCardProps {
  id: string;
  youtubeId: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  publishedAt: Date;
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  duration?: string;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
}

export function VideoCard({
  id,
  youtubeId,
  title,
  description,
  thumbnailUrl,
  publishedAt,
  difficultyLevel,
  duration,
  isFavorite = false,
  onFavoriteToggle,
}: VideoCardProps) {
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };

  const difficultyLabels = {
    beginner: '初級',
    intermediate: '中級',
    advanced: '上級',
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return '今日';
    if (diff === 1) return '昨日';
    if (diff < 7) return `${diff}日前`;
    if (diff < 30) return `${Math.floor(diff / 7)}週間前`;
    return `${Math.floor(diff / 30)}ヶ月前`;
  };

  return (
    <Link href={`/videos/${id}`} className="block group">
      <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        {/* サムネイル */}
        <div className="relative aspect-video bg-gray-200">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-300">
              <span className="text-4xl">🎬</span>
            </div>
          )}

          {/* お気に入りボタン */}
          <button
            onClick={(e) => {
              e.preventDefault();
              onFavoriteToggle?.();
            }}
            className={cn(
              'absolute top-3 right-3 p-2 rounded-full transition-transform',
              'bg-white shadow-md hover:scale-110'
            )}
          >
            <Sparkles
              className={cn(
                'h-5 w-5',
                isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'
              )}
            />
          </button>

          {/* 再生時間 */}
          {duration && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/70 px-2 py-1 rounded text-white text-xs">
              <Clock className="h-3 w-3" />
              {duration}
            </div>
          )}
        </div>

        {/* コンテンツ */}
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* 難易度と公開日 */}
          <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
            {difficultyLevel && (
              <span
                className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium',
                  difficultyColors[difficultyLevel]
                )}
              >
                {difficultyLabels[difficultyLevel]}
              </span>
            )}
            <span>{formatDate(publishedAt)}</span>
          </div>

          {/* 説明 */}
          {description && (
            <p className="text-gray-700 line-clamp-2">{description}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
