import ModCard from "@/components/ModCard";
import NewsItem from "@/components/NewsItem";
import SortToolbar from "@/components/SortToolbar";
import { RotateCw, Tag as TagIcon } from "lucide-react";
import { fetchLatestNews } from "@/app/actions/news-actions";
import { fetchAllMods } from "@/app/actions/admin-actions";
import { fetchPopularTags } from "@/app/actions/tag-actions";
import { getTranslations, getLocale } from 'next-intl/server';
import Tag from "@/components/ui/Tag";
import { Link } from '@/i18n/routing';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Home({ params, searchParams }: Props) {
  // Await params and searchParams for Next.js 15+ compatibility
  const { locale } = await params;
  const { sort, dir } = await searchParams;

  const t = await getTranslations('HomePage');
  const news = await fetchLatestNews(5);

  // Cast sort/dir safely
  const sortBy = (typeof sort === 'string' ? sort : undefined) as any;
  const sortDir = (typeof dir === 'string' ? dir : undefined) as any;

  const mods = await fetchAllMods({ sortBy, sortDir });
  const popularTags = await fetchPopularTags(10);

  // === DEMO DATES ===
  const now = new Date();
  const todayISO = now.toISOString();

  return (
    <div className="w-[95%] mx-auto py-8">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* === LEFT COLUMN === */}
        <div className="hidden lg:block lg:col-span-2 space-y-6 sticky top-24">

          <div className="bg-gradient-to-b from-surface to-black rounded-xl p-5 border border-white/5 text-center group cursor-pointer hover:border-primary/30 transition-colors shadow-lg">
            <div className="mb-4 flex justify-center">
              <RotateCw className="w-12 h-12 text-primary group-hover:rotate-180 transition-transform duration-700" />
            </div>
            <h3 className="font-bold text-white mb-1 uppercase tracking-widest text-sm font-exo2">{t('spinWheel')}</h3>
            <button className="w-full mt-4 bg-primary/10 text-primary text-[10px] font-bold py-2.5 rounded border border-primary/20 hover:bg-primary hover:text-white transition-all uppercase tracking-wider">
              {t('rollRandom')}
            </button>
          </div>

          <div className="bg-surface rounded-xl p-5 border border-white/5">
            <h3 className="font-bold text-xs text-textMuted uppercase tracking-widest mb-4 flex items-center gap-2 font-exo2">
              <TagIcon size={14} /> {t('popularTags')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {popularTags.map(tag => (
                <Tag
                  key={tag.id}
                  color={tag.color || undefined}
                  href={`/search?tag=${tag.displayName}`}
                  className="cursor-pointer"
                >
                  {tag.displayName}
                </Tag>
              ))}
            </div>
          </div>
        </div>

        {/* === CENTER === */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">

          <SortToolbar />

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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
              />
            ))}
          </div>

          <div className="flex justify-center pt-6">
            <button className="text-xs uppercase tracking-widest text-textMuted hover:text-white border-b border-transparent hover:border-primary transition-all pb-1 font-bold">
              {t('loadMore')}
            </button>
          </div>
        </div>

        {/* === RIGHT COLUMN === */}
        <div className="lg:col-span-3 xl:col-span-2">
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
                  No news yet.
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
