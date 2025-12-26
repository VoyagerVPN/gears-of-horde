import NextAuth from "next-auth"
import Discord from "next-auth/providers/discord"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"
import type { Adapter } from "next-auth/adapters"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(db as any) as Adapter,
    providers: [
        Discord({
            clientId: process.env.DISCORD_CLIENT_ID!,
            clientSecret: process.env.DISCORD_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        session({ session, user }) {
            if (session.user) {
                session.user.id = user.id
                session.user.role = user.role
            }
            return session
        },
    },
    debug: true,
})
