import { getTranslations } from "next-intl/server"
import { Users, Package, Newspaper, Clock, Download } from "lucide-react"
import UnifiedTopBar from "@/components/ui/UnifiedTopBar"
import { fetchAdminStats, fetchActivityStats } from "@/app/actions/stats-actions"
import AdminCharts from "@/components/admin/AdminCharts"

export default async function AdminDashboardPage() {
    const t = await getTranslations('Admin')
    const stats = await fetchAdminStats()
    const activityData = await fetchActivityStats()

    const cards = [
        {
            label: t('users'),
            value: stats.userCount,
            icon: Users,
            color: "text-blue-400",
            bg: "bg-blue-400/10",
        },
        {
            label: t('mods'),
            value: stats.modCount,
            icon: Package,
            color: "text-green-400",
            bg: "bg-green-400/10",
        },
        {
            label: t('newsManagement'),
            value: stats.newsCount,
            icon: Newspaper,
            color: "text-purple-400",
            bg: "bg-purple-400/10",
        },
        {
            label: t('pendingModSubmissions'),
            value: stats.pendingSubmissions,
            icon: Clock,
            color: "text-amber-400",
            bg: "bg-amber-400/10",
        },
        {
            label: t('totalDownloads'),
            value: stats.downloadCount,
            icon: Download,
            color: "text-rose-400",
            bg: "bg-rose-400/10",
        },
    ]

    return (
        <div className="min-h-screen bg-zinc-950 pb-10">
            <div className="max-w-[1600px] w-full mx-auto">
                <UnifiedTopBar title={t('dashboard')} />

                <div className="px-4 lg:px-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {cards.map((card, index) => (
                            <div
                                key={index}
                                className="bg-surface border border-white/5 rounded-xl p-3 flex items-center gap-3"
                            >
                                <div className={`p-2 rounded-lg ${card.bg} shrink-0`}>
                                    <card.icon size={18} className={card.color} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-textMuted uppercase tracking-wider mb-0.5 truncate">
                                        {card.label}
                                    </p>
                                    <p className="text-lg font-bold text-white truncate">
                                        {card.value}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Charts */}
                    <AdminCharts data={activityData} />
                </div>
            </div>
        </div>
    )
}
