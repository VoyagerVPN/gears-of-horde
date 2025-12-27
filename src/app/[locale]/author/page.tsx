import { auth } from "@/auth";
import { redirect } from "next/navigation";
import VisualModEditor from "@/components/mod/VisualModEditor";
import { fetchModSubmissionById } from "@/app/actions/mod-submission-actions";
import { ModStatusType } from "@/types/mod";

interface PageProps {
    searchParams: Promise<{ fromSubmission?: string }>;
}

export default async function AuthorPage({ searchParams }: PageProps) {
    const session = await auth();
    const params = await searchParams;

    if (!session) {
        redirect("/api/auth/signin");
    }

    // const t = await getTranslations('Author');

    // Check if editing from a submission
    let initialData = null;
    if (params.fromSubmission) {
        const submission = await fetchModSubmissionById(params.fromSubmission);
        if (submission) {
            initialData = {
                slug: submission.slug,
                title: submission.title,
                version: submission.version,
                author: submission.author,
                description: submission.description,
                gameVersion: submission.gameVersion,
                bannerUrl: submission.bannerUrl || '',
                isSaveBreaking: submission.isSaveBreaking,
                features: submission.features,
                installationSteps: submission.installationSteps,
                links: submission.links,
                videos: submission.videos,
                changelog: submission.changelog,
                localizations: submission.localizations,
                screenshots: submission.screenshots,
                tags: submission.tags,
                status: 'active' as ModStatusType,
                stats: { rating: 0, ratingCount: 0, downloads: "0", views: "0" },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
        }
    }

    return (
        <div className="min-h-screen bg-[#191919]">
            <VisualModEditor
                initialData={initialData || undefined}
                isNew={true}
            />
        </div>
    );
}
