import { ModSubmission, ModData } from "@/types/mod";

/**
 * Convert a ModSubmission to ModData for pre-filling the editor
 */
export function convertSubmissionToModData(submission: ModSubmission): ModData {
    return {
        title: submission.title,
        slug: submission.slug,
        version: submission.version,
        author: submission.author,
        description: submission.description,
        status: 'active', // Default status for new mods
        gameVersion: submission.gameVersion,
        bannerUrl: submission.bannerUrl,
        isSaveBreaking: submission.isSaveBreaking,
        features: submission.features,
        tags: submission.tags,
        installationSteps: submission.installationSteps,
        links: submission.links,
        stats: { rating: 0, ratingCount: 0, downloads: "0", views: "0" },
        videos: submission.videos,
        screenshots: submission.screenshots,
        changelog: submission.changelog,
        localizations: submission.localizations
    };
}
