import { searchModsAdvanced, fetchGameVersions, fetchStatuses, fetchPopularTagsForFilters } from "@/app/actions/search-actions";
import ModsClient from "./ModsClient";

type Props = {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ModsPage({ params, searchParams }: Props) {
    const { locale } = await params;
    const searchParamsResolved = await searchParams;

    // Parse search params
    const query = typeof searchParamsResolved.q === 'string' ? searchParamsResolved.q : '';
    const version = typeof searchParamsResolved.version === 'string' ? searchParamsResolved.version : '';
    const sortBy = typeof searchParamsResolved.sort === 'string' ? searchParamsResolved.sort as 'updated' | 'rating' | 'downloads' | 'views' | 'newest' : 'updated';
    const includeTags = typeof searchParamsResolved.tags === 'string' ? searchParamsResolved.tags.split(',').filter(Boolean) : [];
    const excludeTags = typeof searchParamsResolved.exclude === 'string' ? searchParamsResolved.exclude.split(',').filter(Boolean) : [];
    const includeStatuses = typeof searchParamsResolved.status === 'string' ? searchParamsResolved.status.split(',').filter(Boolean) : [];
    const excludeStatuses = typeof searchParamsResolved.statusExclude === 'string' ? searchParamsResolved.statusExclude.split(',').filter(Boolean) : [];

    // Fetch initial data in parallel
    const [initialResult, gameVersions, statuses, popularTags] = await Promise.all([
        searchModsAdvanced({
            query,
            gameVersion: version,
            includeTags,
            excludeTags,
            includeStatuses,
            excludeStatuses,
            sortBy,
            page: 1,
            limit: 24
        }),
        fetchGameVersions(),
        fetchStatuses(),
        fetchPopularTagsForFilters()
    ]);

    return (
        <ModsClient
            locale={locale as 'en' | 'ru'}
            initialMods={initialResult.mods}
            initialTotalCount={initialResult.totalCount}
            initialHasMore={initialResult.hasMore}
            gameVersions={gameVersions}
            statuses={statuses}
            popularTags={popularTags}
        />
    );
}
