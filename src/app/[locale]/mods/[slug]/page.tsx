import UnifiedModLayout from "@/components/mod/UnifiedModLayout";
import { fetchModBySlug } from "@/app/actions/admin-actions";
import { getTranslations } from 'next-intl/server';
import { Metadata } from "next";

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
            ...(originalObj => {
                const obj: any = {
                    type: 'website',
                };
                if (ogImages.length > 0) {
                    obj.images = ogImages;
                }
                return obj;
            })({})
        },
        twitter: {
            card: 'summary_large_image',
            title: modData.title,
            description: modData.description || `Check out ${modData.title} by ${modData.author} for 7 Days to Die.`,
            ...(originalObj => {
                const obj: any = {};
                if (ogImages.length > 0) {
                    obj.images = ogImages;
                }
                return obj;
            })({})
        }
    };
}

export default async function ModPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const modData = await fetchModBySlug(slug);
    const t = await getTranslations('Common');

    if (!modData) {
        return <div className="text-white text-center py-20">{t('modNotFound')}</div>;
    }

    return (
        <UnifiedModLayout
            mod={modData}
            isEditing={false}
        />
    );
}
