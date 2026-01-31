'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Home, Search, Newspaper, FileQuestion, ArrowRight, LayoutGrid } from 'lucide-react';

export default function NotFound() {
    const t = useTranslations('NotFound');

    return (
        <main className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in zoom-in-95 duration-300">

                {/* 1. Main 404 Title - Spans 2 cols, 2 rows (LG) */}
                <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 bg-surface border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <h1 className="text-[120px] md:text-[160px] lg:text-[180px] font-bold text-white/5 font-locust leading-none select-none transition-transform group-hover:scale-105 duration-500">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <FileQuestion size={80} className="text-primary animate-pulse" />
                    </div>
                </div>

                {/* 2. Message Card */}
                <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-surface/50 border border-white/5 rounded-2xl p-8 flex flex-col justify-center backdrop-blur-sm">
                    <h2 className="text-2xl font-bold text-white mb-2">{t('title')}</h2>
                    <p className="text-textMuted text-lg">
                        {t('description')}
                    </p>
                </div>

                {/* 3. Return Home */}
                <Link
                    href="/"
                    className="col-span-1 bg-surface border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-primary/50 hover:bg-surfaceHover transition-all group"
                >
                    <div className="bg-white/5 w-12 h-12 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        <Home size={24} />
                    </div>
                    <div className="mt-8">
                        <div className="flex items-center justify-between text-white font-medium">
                            <span className="text-lg">{t('returnHome')}</span>
                            <ArrowRight size={20} className="-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
                        </div>
                    </div>
                </Link>

                {/* 4. Search */}
                <Link
                    href="/search"
                    className="col-span-1 bg-surface border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-primary/50 hover:bg-surfaceHover transition-all group"
                >
                    <div className="bg-white/5 w-12 h-12 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        <Search size={24} />
                    </div>
                    <div className="mt-8">
                        <div className="flex items-center justify-between text-white font-medium">
                            <span className="text-lg">{t('search')}</span>
                            <ArrowRight size={20} className="-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
                        </div>
                    </div>
                </Link>

                {/* 5. Browse Mods */}
                <Link
                    href="/mods"
                    className="col-span-1 bg-surface border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-primary/50 hover:bg-surfaceHover transition-all group"
                >
                    <div className="bg-white/5 w-12 h-12 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        <LayoutGrid size={24} />
                    </div>
                    <div className="mt-8">
                        <div className="flex items-center justify-between text-white font-medium">
                            <span className="text-lg">{t('browseMods')}</span>
                            <ArrowRight size={20} className="-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
                        </div>
                    </div>
                </Link>

                {/* 6. News */}
                <Link
                    href="/news"
                    className="col-span-1 bg-surface border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-primary/50 hover:bg-surfaceHover transition-all group"
                >
                    <div className="bg-white/5 w-12 h-12 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        <Newspaper size={24} />
                    </div>
                    <div className="mt-8">
                        <div className="flex items-center justify-between text-white font-medium">
                            <span className="text-lg">{t('readNews')}</span>
                            <ArrowRight size={20} className="-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
                        </div>
                    </div>
                </Link>

            </div>
        </main>
    );
}
