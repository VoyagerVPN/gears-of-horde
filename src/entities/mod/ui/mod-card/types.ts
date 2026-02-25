import type { ModListItem, ModStatus } from '../../model/types';

export interface ModCardProps {
  mod: ModListItem;
  locale?: 'en' | 'ru';
  onClick?: () => void;
}

export interface ModCardStatsProps {
  rating: number;
  downloads: string;
  views: string;
  updatedAt: string;
  locale?: 'en' | 'ru';
}

export interface ModCardBannerProps {
  bannerUrl?: string;
  title: string;
}

export interface ModStatusBadgeProps {
  status: ModStatus;
  color?: string;
}
