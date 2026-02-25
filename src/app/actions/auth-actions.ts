'use server';

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function signInWithDiscord() {
    const supabase = await createClient();
    const origin = (await headers()).get("origin");

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
            redirectTo: `${origin}/auth/callback`,
        },
    });

    if (error) {
        console.error("Auth error:", error);
        return redirect("/auth/error");
    }

    if (data.url) {
        return redirect(data.url);
    }
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return redirect("/");
}
