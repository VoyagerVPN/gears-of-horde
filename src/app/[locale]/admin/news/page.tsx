import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { fetchAllNews } from "@/app/actions/news-actions";
import NewsManagementClient from "./NewsManagementClient";
import UnifiedTopBar from "@/components/ui/UnifiedTopBar";

interface NewsManagementPageProps {
    params: Promise<{
        locale: string;
    }>;
}

export default async function NewsManagementPage({ params }: NewsManagementPageProps) {
    const { locale } = await params;

    // Auth protection - ADMIN only
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: dbUser } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
    if (!dbUser || dbUser.role !== "ADMIN") {
        redirect("/profile");
    }

    const t = await getTranslations("Admin");
    const news = await fetchAllNews();

    return (
        <div className="max-w-6xl">
            <UnifiedTopBar title={t("newsManagement")} />

            <div className="px-6 lg:px-8">
                <NewsManagementClient initialNews={news} locale={locale as 'en' | 'ru'} />
            </div>
        </div>
    );
}

