import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind CSSクラスを結合する
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
