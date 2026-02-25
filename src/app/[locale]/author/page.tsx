import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import VisualModEditor from "@/components/mod/editor/VisualModEditor";
import { fetchModSubmissionById } from "@/app/actions/mod-submission-actions";
import { ModStatusType } from "@/types/mod";

interface PageProps {
    searchParams: Promise<{ fromSubmission?: string }>;
}

export default async function AuthorPage({ searchParams }: PageProps) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const params = await searchParams;

    if (!user) {
        redirect("/login");
    }
    
    const { data: dbUser } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
    if (!dbUser) {
        redirect("/profile");
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
