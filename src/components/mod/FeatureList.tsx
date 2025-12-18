"use client";

import { useState } from "react";
import { ChevronDown, Check, Zap } from "lucide-react";
import { useTranslations } from 'next-intl';

interface FeatureListProps {
  features: string[];
}

export default function FeatureList({ features }: FeatureListProps) {
  const t = useTranslations('Common');
  const [isExpanded, setIsExpanded] = useState(false);

  if (!features || features.length === 0) {
    return null;
  }

  return (
    // ИСПРАВЛЕНО: Добавлен hover:border-white/20
    <div className="bg-surface border border-white/5 hover:border-white/20 rounded-xl overflow-hidden transition-colors">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left group"
      >
        <div className="flex items-center gap-2">
          <Zap size={20} className="text-primary" />
          <h2 className="text-lg font-bold text-white font-exo2 uppercase tracking-wide flex items-center gap-2">
            {t('features')}
            <span className="text-xs text-textMuted font-mono bg-white/10 px-2 py-0.5 rounded-full tracking-normal">
              {features.length}
            </span>
          </h2>
        </div>
        <ChevronDown
          size={20}
          className={`text-textMuted transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 pt-2 border-t border-white/5 bg-black/20 animate-in slide-in-from-top-2 duration-200">
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-6">
            {features.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-textMuted leading-snug">
                <Check size={14} className="text-primary mt-1 shrink-0 opacity-80" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}