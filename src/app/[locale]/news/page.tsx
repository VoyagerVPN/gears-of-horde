import { getTranslations } from 'next-intl/server';
import { fetchLatestNews, fetchNewsTags } from '@/app/actions/news-actions';
import NewsFilter from '@/components/news/NewsFilter';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { auth } from '@/auth';
import NewsPageClient from './NewsPageClient';

interface NewsPageProps {
    searchParams: {
        page?: string;
        tag?: string;
    };
    params: {
        locale: string;
    };
}

export default async function NewsPage({ searchParams, params }: NewsPageProps) {
    const t = await getTranslations('NewsPage');
    const { page, tag } = await searchParams;
    const { locale } = await params;

    const currentPage = Number(page) || 1;
    const limit = 12;
    const skip = (currentPage - 1) * limit;

    const [news, tags, session] = await Promise.all([
        fetchLatestNews(limit, skip, tag),
        fetchNewsTags(),
        auth()
    ]);

    const hasMore = news.length === limit;
    const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'MODERATOR';

    return (
        <div className="min-h-screen bg-background text-textMain pb-20">
            <div className="bg-surface border-b border-white/5 pt-24 pb-8 px-4">
                <div className="max-w-[1800px] mx-auto">
                    <h1 className="text-3xl font-bold text-white font-exo2 uppercase tracking-wide">
                        {t('title')}
                    </h1>
                </div>
            </div>

            <div className="max-w-[1800px] mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Sidebar Filter */}
                    <div className="lg:col-span-3 xl:col-span-2">
                        <NewsFilter tags={tags} currentTag={tag} />
                    </div>

                    {/* News Grid */}
                    <div className="lg:col-span-9 xl:col-span-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                            <NewsPageClient
                                news={news}
                                locale={locale as 'en' | 'ru'}
                                isAdmin={isAdmin}
                            />
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-center gap-4 mt-12">
                            {currentPage > 1 && (
                                <Link
                                    href={`/news?page=${currentPage - 1}${tag ? `&tag=${tag}` : ''}`}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-bold text-white hover:bg-white/10 transition-colors uppercase tracking-wide"
                                >
                                    <ChevronLeft size={16} /> {t('prevPage')}
                                </Link>
                            )}

                            {hasMore && (
                                <Link
                                    href={`/news?page=${currentPage + 1}${tag ? `&tag=${tag}` : ''}`}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-bold text-white hover:bg-white/10 transition-colors uppercase tracking-wide"
                                >
                                    {t('nextPage')} <ChevronRight size={16} />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

