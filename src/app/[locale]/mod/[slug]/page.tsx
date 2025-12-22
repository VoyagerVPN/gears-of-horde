import UnifiedModLayout from "@/components/mod/UnifiedModLayout";
import { fetchModBySlug } from "@/app/actions/admin-actions";
import { getTranslations } from 'next-intl/server';

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
