import { useTranslations } from 'next-intl';

export default function PrivacyPage() {
    const t = useTranslations('PrivacyPolicy');

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">{t('title')}</h1>
            <p className="mb-4 text-zinc-400">{t('lastUpdated', { date: new Date().toLocaleDateString() })}</p>
            <p className="mb-6">{t('intro')}</p>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-2">{t('sections.collection.title')}</h2>
                <p>{t('sections.collection.content')}</p>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-2">{t('sections.usage.title')}</h2>
                <p>{t('sections.usage.content')}</p>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-2">{t('sections.sharing.title')}</h2>
                <p>{t('sections.sharing.content')}</p>
            </section>
        </div>
    );
}
