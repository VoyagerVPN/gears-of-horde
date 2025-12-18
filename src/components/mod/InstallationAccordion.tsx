"use client";

import { useState } from "react";
import { ChevronDown, FileCog } from "lucide-react";
import { useTranslations } from 'next-intl';

interface InstallationAccordionProps {
  steps: string[];
}

export default function InstallationAccordion({ steps }: InstallationAccordionProps) {
  const t = useTranslations('Common');
  const [isOpen, setIsOpen] = useState(false);

  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    // ИСПРАВЛЕНО: Добавлен hover:border-white/20
    <div className="bg-surface border border-white/5 hover:border-white/20 rounded-xl overflow-hidden transition-colors">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left group"
      >
        <div className="flex items-center gap-3">
          <FileCog size={20} className="text-primary" />
          <h3 className="text-sm font-bold font-exo2 uppercase tracking-wider text-white">
            {t('installationGuide')}
          </h3>
        </div>
        <ChevronDown
          size={18}
          className={`text-textMuted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="px-6 pb-6 pt-2 border-t border-white/5 bg-black/20 animate-in slide-in-from-top-2 duration-200">
          <ol className="list-decimal list-inside space-y-3 text-sm text-textMuted">
            {steps.map((step, idx) => (
              <li key={idx} className="leading-snug pl-1 marker:text-primary/70 marker:font-bold">
                <span className="text-textMain">{step}</span>
              </li>
            ))}
          </ol>
          <p className="text-[10px] text-textMuted/60 mt-4 pt-3 border-t border-white/5 italic">
            {t('installationNote')}
          </p>
        </div>
      )}
    </div>
  );
}