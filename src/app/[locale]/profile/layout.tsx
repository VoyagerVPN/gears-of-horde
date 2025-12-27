import { Link } from "@/i18n/routing";
import { getTranslations } from 'next-intl/server';
import { LogOut } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SidebarNav from "@/components/ui/SidebarNav";
import ProfileBottomNav from "@/components/profile/ProfileBottomNav";

export default async function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Auth protection
    const session = await auth();

    if (!session) {
        redirect("/api/auth/signin");
    }

    const tCommon = await getTranslations('Admin'); // Reuse logout key

    return (
        <div className="flex min-h-screen bg-[#191919] text-[#ededed]">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 bg-surface border-r border-white/5 flex-col fixed h-full z-50">


                <SidebarNav userRole={session.user.role} />

                <div className="p-4 border-t border-white/5 mt-auto">
                    <Link href="/api/auth/signout" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors w-full">
                        <LogOut size={18} />
                        {tCommon('logout')}
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-64 pb-24 lg:pb-8 bg-[#191919]">
                {children}
            </main>

            {/* Mobile Bottom Nav */}
            <ProfileBottomNav userRole={session.user.role} />
        </div>
    );
}
