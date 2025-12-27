import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/layouts/DashboardLayout";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Auth protection - Admin only
    const session = await auth();

    if (!session) {
        redirect("/api/auth/signin");
    }

    if (session.user.role !== "ADMIN") {
        redirect("/profile");
    }

    return (
        <DashboardLayout userRole={session.user.role}>
            {children}
        </DashboardLayout>
    );
}
