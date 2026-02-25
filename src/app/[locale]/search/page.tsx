import { getTranslations } from 'next-intl/server';
import { searchMods } from '@/app/actions/search-actions';
import ModCard from '@/components/ModCard';
import { Search, Filter, X } from 'lucide-react';
import { Link } from '@/i18n/routing';
import Tag from '@/components/ui/Tag';

interface SearchPageProps {
    searchParams: Promise<{
        q?: string;
        tag?: string;
        lang?: string;
        version?: string;
        status?: string;
    }>;
    params: Promise<{
        locale: string;
    }>;
}

export default async function SearchPage({ searchParams, params }: SearchPageProps) {
    const t = await getTranslations('SearchPage');
    const { q, tag, lang, version, status } = await searchParams;
    const { locale } = await params;

    const mods = await searchMods(q || '', { tag, lang, version, status });

    return (
        <div className="min-h-screen bg-background text-textMain pb-20">
            {/* Header Section */}
            <div className="bg-surface border-b border-white/5 pt-24 pb-8 px-4">
                <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
                    <h1 className="text-3xl font-bold text-white font-exo2 uppercase tracking-wide mb-4">
                        {t('title')}
                        {q && <span className="text-textMuted font-normal normal-case ml-3">&quot;{q}&quot;</span>}
                    </h1>

                    {/* Active Filters Display */}
                    {(tag || lang || version || status) && (
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-xs font-bold text-textMuted uppercase mr-2 flex items-center gap-1">
                                <Filter size={12} /> {t('activeFilters')}:
                            </span>

                            {tag && (
                                <Link href={`/search?q=${q || ''}&lang=${lang || ''}&version=${version || ''}&status=${status || ''}`}>
                                    <Tag variant="accent" className="group pr-6 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-colors">
                                        Tag: {tag}
                                        <X size={12} className="absolute right-1 top-1/2 -translate-y-1/2 opacity-50 group-hover:opacity-100" />
                                    </Tag>
                                </Link>
                            )}

                            {lang && (
                                <Link href={`/search?q=${q || ''}&tag=${tag || ''}&version=${version || ''}&status=${status || ''}`}>
                                    <Tag variant="accent" className="group pr-6 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-colors">
                                        Lang: {lang}
                                        <X size={12} className="absolute right-1 top-1/2 -translate-y-1/2 opacity-50 group-hover:opacity-100" />
                                    </Tag>
                                </Link>
                            )}

                            {version && (
                                <Link href={`/search?q=${q || ''}&tag=${tag || ''}&lang=${lang || ''}&status=${status || ''}`}>
                                    <Tag variant="accent" className="group pr-6 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-colors">
                                        Ver: {version}
                                        <X size={12} className="absolute right-1 top-1/2 -translate-y-1/2 opacity-50 group-hover:opacity-100" />
                                    </Tag>
                                </Link>
                            )}

                            {status && (
                                <Link href={`/search?q=${q || ''}&tag=${tag || ''}&lang=${lang || ''}&version=${version || ''}`}>
                                    <Tag variant="accent" className="group pr-6 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-colors">
                                        Status: {status}
                                        <X size={12} className="absolute right-1 top-1/2 -translate-y-1/2 opacity-50 group-hover:opacity-100" />
                                    </Tag>
                                </Link>
                            )}

                            <Link href="/search" className="text-xs text-textMuted hover:text-white underline ml-2">
                                {t('clearAll')}
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Results Grid */}
            <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '32px 16px' }}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white font-exo2 uppercase tracking-wide">
                        {mods.length} {t('resultsFound')}
                    </h2>
                </div>

                {mods.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {mods.map((mod) => (
                            <ModCard
                                key={mod.slug}
                                mod={mod}
                                locale={locale as 'en' | 'ru'}
                            />
                        ))}
                    </div>
                ) : (
                    <div
                        className="text-center border border-dashed border-white/10 rounded-xl bg-white/[0.02]"
                        style={{ padding: '80px 20px' }}
                    >
                        <Search size={48} className="mx-auto text-textMuted opacity-20 mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">{t('noResultsTitle')}</h3>
                        <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '400px', margin: '0 auto' }}>
                            {t('noResultsDesc')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

