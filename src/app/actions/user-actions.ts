'use server'

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { UserRole } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { ROUTES } from "@/lib/routes"

export interface UserData {
    id: string
    name: string | null
    email: string | null
    image: string | null
    role: UserRole
    isBanned: boolean
    createdAt: Date
    _count: {
        mods: number
    }
}

export async function fetchAllUsers(): Promise<UserData[]> {
    const users = await db.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            isBanned: true,
            createdAt: true,
            _count: { select: { mods: true } }
        }
    })
    return users
}

export async function updateUserRole(userId: string, role: UserRole) {
    const session = await auth()
    if (session?.user.role !== 'ADMIN') throw new Error("Unauthorized")

    await db.user.update({
        where: { id: userId },
        data: { role }
    })
    revalidatePath(ROUTES.users)
}

export async function toggleUserBan(userId: string) {
    const session = await auth()
    if (session?.user.role !== 'ADMIN') throw new Error("Unauthorized")

    const user = await db.user.findUnique({ where: { id: userId } })
    await db.user.update({
        where: { id: userId },
        data: { isBanned: !user?.isBanned }
    })
    revalidatePath(ROUTES.users)
}
