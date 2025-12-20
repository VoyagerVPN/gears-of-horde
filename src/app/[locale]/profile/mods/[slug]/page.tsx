import VisualModEditor from "@/components/mod/VisualModEditor";
import { fetchModBySlug } from "@/app/actions/admin-actions";
import { fetchModSubmissionById } from "@/app/actions/mod-submission-actions";
import { convertSubmissionToModData } from "@/lib/mod-utils";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ fromSubmission?: string }>;
}

export default async function EditModPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { fromSubmission } = await searchParams;

  const isNew = slug === 'new';

  let data;
  let submissionId: string | undefined;

  if (isNew && fromSubmission) {
    // Loading from a submission - pre-fill the editor with submission data
    const submission = await fetchModSubmissionById(fromSubmission);
    if (submission) {
      data = convertSubmissionToModData(submission);
      submissionId = submission.id;
    }
  } else if (!isNew) {
    // Editing existing mod
    data = (await fetchModBySlug(slug)) || undefined;
  }

  return (
    <VisualModEditor
      initialData={data}
      isNew={isNew}
      submissionId={submissionId}
    />
  );
}
