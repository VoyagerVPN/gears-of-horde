"use client";

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const switchLocale = (newLocale: 'en' | 'ru') => {
        router.replace({ pathname }, { locale: newLocale });
    };

    return (
        <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
            <button
                onClick={() => switchLocale('en')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${locale === 'en'
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-textMuted hover:text-white hover:bg-white/5'
                    }`}
            >
                EN
            </button>
            <button
                onClick={() => switchLocale('ru')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${locale === 'ru'
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-textMuted hover:text-white hover:bg-white/5'
                    }`}
            >
                RU
            </button>
        </div>
    );
}
