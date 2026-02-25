'use server'


import { createClient } from "@/utils/supabase/server"
import { type UserRole } from "@/schemas"
import { revalidatePath } from "next/cache"
import { ROUTES } from "@/lib/routes"
import { db } from "@/lib/db"

export interface UserData {
    id: string
    name: string | null
    email: string | null
    image: string | null
    role: UserRole
    isBanned: boolean
    createdAt: string
    _count: {
        mods: number
    }
}

const USER_SELECT = `
    id,
    name,
    email,
    image,
    role,
    isBanned,
    createdAt,
    mods:Mod(count)
`;

export async function fetchAllUsers(): Promise<UserData[]> {
    const { data: users, error } = await db
        .from('User')
        .select(USER_SELECT)
        .order('createdAt', { ascending: false });

    if (error) {
        console.error("Failed to fetch users:", error.message);
        return [];
    }

    return (users || []).map((user) => ({
        id: user.id as string,
        name: user.name as string | null,
        email: user.email as string | null,
        image: user.image as string | null,
        role: user.role as UserRole,
        isBanned: user.isBanned as boolean,
        createdAt: typeof user.createdAt === 'string' ? user.createdAt : (user.createdAt as Date).toISOString(),
        _count: {
            mods: (user.mods as unknown as { count: number }[])?.[0]?.count ?? 0
        }
    }));
}

async function checkAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: dbUser } = await supabase
        .from('User')
        .select('role')
        .eq('id', user.id)
        .single();

    if (dbUser?.role !== 'ADMIN') throw new Error("Unauthorized")
    return user;
}

export async function updateUserRole(userId: string, role: UserRole) {
    await checkAdmin();

    const { error } = await db
        .from('User')
        .update({ role })
        .eq('id', userId);

    if (error) {
        console.error("Failed to update user role:", error.message);
        throw new Error("Failed to update user role");
    }

    revalidatePath(ROUTES.users)
}

export async function toggleUserBan(userId: string) {
    await checkAdmin();

    const { data: targetUser, error: fetchError } = await db
        .from('User')
        .select('isBanned')
        .eq('id', userId)
        .single();

    if (fetchError || !targetUser) throw new Error("User not found");

    const { error: updateError } = await db
        .from('User')
        .update({ isBanned: !targetUser.isBanned })
        .eq('id', userId);

    if (updateError) {
        console.error("Failed to toggle user ban:", updateError.message);
        throw new Error("Failed to toggle user ban");
    }

    revalidatePath(ROUTES.users)
}
