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
        <div className="flex items-center gap-1 text-sm font-medium text-textMuted">
            <button
                onClick={() => switchLocale('en')}
                className={`hover:text-white transition-colors ${locale === 'en' ? 'text-white font-bold' : ''}`}
            >
                EN
            </button>
            <span>/</span>
            <button
                onClick={() => switchLocale('ru')}
                className={`hover:text-white transition-colors ${locale === 'ru' ? 'text-white font-bold' : ''}`}
            >
                RU
            </button>
        </div>
    );
}
