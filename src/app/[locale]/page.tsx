import ModCard from "@/components/ModCard";
import NewsItem from "@/components/NewsItem";
import SortToolbar from "@/components/SortToolbar";
import HeroSection from "@/components/HeroSection";
import { fetchLatestNews } from "@/app/actions/news-actions";
import { fetchAllMods } from "@/app/actions/admin-actions";
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Home({ params, searchParams }: Props) {
  const { locale } = await params;
  const { sort, dir } = await searchParams;

  const t = await getTranslations('HomePage');
  const news = await fetchLatestNews(5);

  const validSortOptions = ['updated', 'rating', 'downloads', 'views'] as const;
  const validSortDirs = ['asc', 'desc'] as const;

  const rawSort = typeof sort === 'string' ? sort : undefined;
  const rawDir = typeof dir === 'string' ? dir : undefined;

  const sortBy = (validSortOptions as readonly string[]).includes(rawSort || '') ? (rawSort as typeof validSortOptions[number]) : undefined;
  const sortDir = (validSortDirs as readonly string[]).includes(rawDir || '') ? (rawDir as typeof validSortDirs[number]) : undefined;

  const mods = await fetchAllMods({ sortBy, sortDir });

  const now = new Date();
  const todayISO = now.toISOString();

  return (
    <div className="w-[95%] max-w-[1800px] mx-auto py-8">

      {/* Hero Section - Full width */}
      <HeroSection />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

        {/* === LEFT: Mod Grid (3 columns on large screens) === */}
        <div className="lg:col-span-3 space-y-6">

          <SortToolbar />

          <div data-testid="mod-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {mods.map((mod) => (
              <ModCard
                key={mod.slug}
                title={mod.title}
                slug={mod.slug}
                version={mod.version}
                gameVersion={mod.gameVersion}
                author={mod.author}
                description={mod.description || ''}
                tags={mod.tags}
                updatedAt={mod.changelog?.[0]?.date || todayISO}
                bannerUrl={mod.bannerUrl}
                stats={{ rating: mod.stats.rating, downloads: mod.stats.downloads, views: mod.stats.views || '0' }}
                locale={locale as 'en' | 'ru'}
                status={mod.status}
              />
            ))}
          </div>

          <div className="flex justify-center pt-6">
            <button className="text-xs uppercase tracking-widest text-textMuted hover:text-white border-b border-transparent hover:border-primary transition-all pb-1 font-bold">
              {t('loadMore')}
            </button>
          </div>
        </div>

        {/* === RIGHT: News Sidebar === */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
              <h3 className="font-bold text-sm text-white uppercase tracking-widest font-exo2">
                {t('latestNews')}
              </h3>
            </div>

            <div className="flex flex-col gap-1">
              {news.length > 0 ? (
                news.map((item) => (
                  <NewsItem
                    key={item.id}
                    modName={item.modName}
                    modSlug={item.modSlug}
                    modVersion={item.modVersion}
                    gameVersion={item.gameVersion}
                    actionText={item.actionText}
                    description={item.description}
                    content={item.content}
                    date={item.date}
                    tags={item.tags}
                    wipeRequired={item.wipeRequired}
                    sourceUrl={item.sourceUrl}
                    locale={locale as 'en' | 'ru'}
                  />
                ))
              ) : (
                <div className="text-textMuted text-xs italic py-4 text-center">
                  {t('noNewsYet')}
                </div>
              )}
            </div>

            <Link
              href="/news"
              className="block w-full mt-2 text-[10px] font-bold text-textMuted hover:text-white transition-colors py-3 border border-white/5 rounded hover:bg-white/5 uppercase tracking-widest text-center"
            >
              {t('newsArchive')}
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
