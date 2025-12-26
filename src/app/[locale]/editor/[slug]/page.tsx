import VisualModEditor from "@/components/mod/VisualModEditor";
import { fetchModBySlug } from "@/app/actions/admin-actions";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function EditModPage({ params }: PageProps) {
    const { slug } = await params;

    const data = (await fetchModBySlug(slug)) || undefined;

    return (
        <VisualModEditor
            initialData={data}
            isNew={false}
        />
    );
}
