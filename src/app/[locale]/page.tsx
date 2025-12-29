import NewsItem from "@/components/NewsItem";
import HeroSection from "@/components/HeroSection";
import ModSection from "@/components/ModSection";
import { fetchLatestNews } from "@/app/actions/news-actions";
import { fetchModsByCategory } from "@/app/actions/admin-actions";
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;

  const t = await getTranslations('HomePage');

  // Fetch data for all three sections in parallel
  const [news, updatedMods, featuredMods, topRatedMods] = await Promise.all([
    fetchLatestNews(5),
    fetchModsByCategory('updated', 6),
    fetchModsByCategory('featured', 6),
    fetchModsByCategory('top_rated', 6)
  ]);

  return (
    <div className="w-[95%] max-w-[1800px] mx-auto py-8">

      {/* Hero Section - Full width */}
      <HeroSection />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

        {/* === LEFT: Mod Sections (3 columns on large screens) === */}
        <div className="lg:col-span-3 space-y-6">

          {/* Recently Updated Section */}
          <ModSection
            titleKey="recentlyUpdated"
            iconType="updated"
            mods={updatedMods}
            viewAllHref="/mods?sort=updated"
            locale={locale as 'en' | 'ru'}
          />

          {/* Featured Section (Hot this month by downloads) */}
          <ModSection
            titleKey="featured"
            iconType="featured"
            mods={featuredMods}
            viewAllHref="/mods?sort=downloads"
            locale={locale as 'en' | 'ru'}
          />

          {/* Top Rated Section */}
          <ModSection
            titleKey="topRated"
            iconType="topRated"
            mods={topRatedMods}
            viewAllHref="/mods?sort=rating"
            locale={locale as 'en' | 'ru'}
          />

        </div>

        {/* === RIGHT: News Sidebar === */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
              <h3 className="font-bold text-xl text-white uppercase tracking-widest font-exo2">
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
