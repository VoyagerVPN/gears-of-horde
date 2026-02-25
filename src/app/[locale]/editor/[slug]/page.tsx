import VisualModEditor from "@/components/mod/editor/VisualModEditor";
import { fetchModBySlug } from "@/app/actions/admin-actions";
import { notFound, redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function EditModPage({ params }: PageProps) {
    const { slug } = await params;

    // Redirect /editor/new to /editor (creation page)
    if (slug === 'new') {
        redirect(ROUTES.editor);
    }

    const data = (await fetchModBySlug(slug));

    if (!data) {
        notFound();
    }

    return (
        <VisualModEditor
            initialData={data}
            isNew={false}
        />
    );
}
