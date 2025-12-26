import VisualModEditor from "@/components/mod/VisualModEditor";
import { fetchModSubmissionById } from "@/app/actions/mod-submission-actions";
import { convertSubmissionToModData } from "@/lib/mod-utils";

interface PageProps {
    searchParams: Promise<{ fromSubmission?: string }>;
}

export default async function EditorNewPage({ searchParams }: PageProps) {
    const { fromSubmission } = await searchParams;

    let data;
    let submissionId: string | undefined;

    if (fromSubmission) {
        // Loading from a submission - pre-fill the editor with submission data
        const submission = await fetchModSubmissionById(fromSubmission);
        if (submission) {
            data = convertSubmissionToModData(submission);
            submissionId = submission.id;
        }
    }

    return (
        <VisualModEditor
            initialData={data}
            isNew={true}
            submissionId={submissionId}
        />
    );
}
