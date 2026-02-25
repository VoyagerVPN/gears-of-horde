import { MetadataRoute } from 'next';
import { createClient } from "@/utils/supabase/server";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://gears-of-horde.com';
const LOCALES = ['en', 'ru'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = await createClient();
    const { data: mods } = await supabase
        .from('mods')
        .select('slug, updatedAt');
    
    if (!mods) return [];

    const sitemapEntries: MetadataRoute.Sitemap = [];

    // Static pages for each locale
    for (const locale of LOCALES) {
        sitemapEntries.push(
            {
                url: `${BASE_URL}/${locale}`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 1,
            },
            {
                url: `${BASE_URL}/${locale}/news`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 0.9,
            },
            {
                url: `${BASE_URL}/${locale}/info`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.5,
            },
            {
                url: `${BASE_URL}/${locale}/privacy`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.3,
            },
            {
                url: `${BASE_URL}/${locale}/terms`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.3,
            }
        );

        // Mod pages for each locale
        for (const mod of mods) {
            sitemapEntries.push({
                url: `${BASE_URL}/${locale}/mods/${mod.slug}`,
                lastModified: mod.updatedAt ? new Date(mod.updatedAt) : new Date(),
                changeFrequency: 'weekly',
                priority: 0.8,
            });
        }
    }

    return sitemapEntries;
}
