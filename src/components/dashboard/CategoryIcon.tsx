import React from 'react';
import {
  Utensils,
  Fuel,
  Shirt,
  Sparkles,
  Film,
  MoreHorizontal
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface CategoryIconProps {
  category: string;
  className?: string;
}

export interface CategoryStyle {
  icon: LucideIcon;
  color: string;
  hex: string;
  bg: string;
}

const CATEGORY_MAP: Record<string, CategoryStyle> = {
  'food': { icon: Utensils, color: 'text-amber-500', hex: '#f59e0b', bg: 'bg-amber-500/10' },
  'petrol': { icon: Fuel, color: 'text-emerald-500', hex: '#10b981', bg: 'bg-emerald-500/10' },
  'dress': { icon: Shirt, color: 'text-pink-500', hex: '#ec4899', bg: 'bg-pink-500/10' },
  'accessories': { icon: Sparkles, color: 'text-cyan-500', hex: '#06b6d4', bg: 'bg-cyan-500/10' },
  'cinema': { icon: Film, color: 'text-rose-500', hex: '#f43f5e', bg: 'bg-rose-500/10' },
  'movies': { icon: Film, color: 'text-rose-500', hex: '#f43f5e', bg: 'bg-rose-500/10' },
  'entertainment': { icon: Film, color: 'text-rose-500', hex: '#f43f5e', bg: 'bg-rose-500/10' },
  'other expenses': { icon: MoreHorizontal, color: 'text-purple-500', hex: '#8b5cf6', bg: 'bg-purple-500/10' },
  'others': { icon: MoreHorizontal, color: 'text-purple-500', hex: '#8b5cf6', bg: 'bg-purple-500/10' },
  'food & dining': { icon: Utensils, color: 'text-amber-500', hex: '#f59e0b', bg: 'bg-amber-500/10' },
  'transportation': { icon: Fuel, color: 'text-emerald-500', hex: '#10b981', bg: 'bg-emerald-500/10' },
  'shopping': { icon: Shirt, color: 'text-pink-500', hex: '#ec4899', bg: 'bg-pink-500/10' },
};

// Fallback palette for any unexpected category name
const FALLBACK_PALETTE: CategoryStyle[] = [
  { icon: Utensils, color: 'text-amber-500', hex: '#f59e0b', bg: 'bg-amber-500/10' },
  { icon: Fuel, color: 'text-emerald-500', hex: '#10b981', bg: 'bg-emerald-500/10' },
  { icon: Shirt, color: 'text-pink-500', hex: '#ec4899', bg: 'bg-pink-500/10' },
  { icon: Sparkles, color: 'text-cyan-500', hex: '#06b6d4', bg: 'bg-cyan-500/10' },
  { icon: Film, color: 'text-rose-500', hex: '#f43f5e', bg: 'bg-rose-500/10' },
  { icon: MoreHorizontal, color: 'text-purple-500', hex: '#8b5cf6', bg: 'bg-purple-500/10' },
];

export const getCategoryStyles = (category: string): CategoryStyle => {
  const normalized = (category || '').trim().toLowerCase();
  if (CATEGORY_MAP[normalized]) {
    return CATEGORY_MAP[normalized];
  }
  // Generate consistent pseudo-hash for unknown category
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash + normalized.charCodeAt(i)) % FALLBACK_PALETTE.length;
  }
  return FALLBACK_PALETTE[hash] || FALLBACK_PALETTE[5];
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({ category, className = "w-4 h-4" }) => {
  const style = getCategoryStyles(category);
  const IconComponent = style.icon;
  return <IconComponent className={`${style.color} ${className}`} />;
};
