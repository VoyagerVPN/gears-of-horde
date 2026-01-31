import UnifiedModLayout from "@/components/mod/UnifiedModLayout";
import { fetchModBySlug } from "@/app/actions/admin-actions";
import { getTranslations } from 'next-intl/server';
import { Metadata } from "next";
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const modData = await fetchModBySlug(slug);

    if (!modData) {
        return {
            title: 'Mod Not Found',
            description: 'The requested mod could not be found.'
        };
    }

    const ogImages = [];
    if (modData.bannerUrl) {
        ogImages.push(modData.bannerUrl);
    } else if (modData.screenshots && modData.screenshots.length > 0) {
        ogImages.push(modData.screenshots[0]);
    }

    return {
        title: modData.title,
        description: modData.description || `Check out ${modData.title} by ${modData.author} for 7 Days to Die.`,
        openGraph: {
            title: modData.title,
            description: modData.description || `Check out ${modData.title} by ${modData.author} for 7 Days to Die.`,
            type: 'website',
            images: ogImages.length > 0 ? ogImages : undefined
        },
        twitter: {
            card: 'summary_large_image',
            title: modData.title,
            description: modData.description || `Check out ${modData.title} by ${modData.author} for 7 Days to Die.`,
            images: ogImages.length > 0 ? ogImages : undefined
        }
    };
}

export default async function ModPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const modData = await fetchModBySlug(slug);
    const t = await getTranslations('Common');

    if (!modData) {
        notFound();
    }

    return (
        <UnifiedModLayout
            mod={modData}
            isEditing={false}
        />
    );
}
