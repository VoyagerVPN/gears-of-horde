import { MetadataRoute } from 'next';
import { db } from '@/lib/db';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://gears-of-horde.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const mods = await db.mod.findMany({
        select: {
            slug: true,
            updatedAt: true,
        },
    });

    const modEntries: MetadataRoute.Sitemap = mods.map((mod) => ({
        url: `${BASE_URL}/en/mods/${mod.slug}`,
        lastModified: mod.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    return [
        {
            url: `${BASE_URL}/en`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${BASE_URL}/en/news`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/en/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        ...modEntries,
    ];
}
