'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export interface BottomNavItem {
  href: string;
  icon: string;
  label: string;
}

interface BottomNavProps {
  items: BottomNavItem[];
}

const navItems: BottomNavItem[] = [
  { href: '/', icon: '🏠', label: 'ホーム' },
  { href: '/videos', icon: '📺', label: '動画' },
  { href: '/qa', icon: '🤔', label: 'Q&A' },
  { href: '/practice', icon: '🎯', label: '練習' },
  { href: '/records', icon: '📋', label: '記録' },
  { href: '/tips', icon: '💡', label: 'コツ' },
];

export function BottomNav({ items = navItems }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-40">
      <div className="max-w-md mx-auto flex justify-around">
        {items.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 text-base transition-colors',
                isActive ? 'text-primary font-bold' : 'text-gray-600 hover:text-primary'
              )}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
