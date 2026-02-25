import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/layouts/DashboardLayout";

export default async function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Auth protection
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
    if (!dbUser) redirect("/login");

    return (
        <DashboardLayout userRole={dbUser.role}>
            {children}
        </DashboardLayout>
    );
}
