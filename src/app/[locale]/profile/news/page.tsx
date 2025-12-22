import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { fetchAllNews, deleteNews } from "@/app/actions/news-actions";
import NewsManagementClient from "./NewsManagementClient";

export default async function NewsManagementPage() {
    // Auth protection - ADMIN only
    const session = await auth();

    if (!session) {
        redirect("/api/auth/signin");
    }

    if (session.user.role !== "ADMIN") {
        redirect("/profile");
    }

    const t = await getTranslations("Admin");
    const news = await fetchAllNews();

    return (
        <div className="max-w-6xl">
            <h1 className="text-2xl font-bold text-white font-exo2 uppercase tracking-wide mb-6">
                {t("newsManagement")}
            </h1>

            <NewsManagementClient initialNews={news} />
        </div>
    );
}
