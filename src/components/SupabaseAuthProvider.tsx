"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { type User, type Session } from "@supabase/supabase-js";

type SupabaseContext = {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    role: string | null;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [role, setRole] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchRole = async (userId: string) => {
            // For now we get role from user_metadata if present, 
            // or we could fetch it from our public.users table.
            // Since we haven't migrated the DB yet, we can't easily fetch it from the client 
            // without a policy or reaching out to a server action.
            // However, Supabase Auth usually stores standard claims.
            // For this compact migration, we'll assume standard role handling.
            const { data } = await supabase
                .from('User')
                .select('role')
                .eq('id', userId)
                .single();
            
            if (data) {
                setRole(data.role);
            }
        };

        const getSession = async () => {
            const { data: { session: initialSession } } = await supabase.auth.getSession();
            setSession(initialSession);
            setUser(initialSession?.user ?? null);
            if (initialSession?.user) {
                fetchRole(initialSession.user.id);
            }
            setIsLoading(false);
        };

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            if (currentSession?.user) {
                fetchRole(currentSession.user.id);
            } else {
                setRole(null);
            }
            setIsLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase]);

    return (
        <Context.Provider value={{ user, session, isLoading, role }}>
            {children}
        </Context.Provider>
    );
}

export function useSupabaseAuth() {
    const context = useContext(Context);
    if (context === undefined) {
        throw new Error("useSupabaseAuth must be used within a SupabaseAuthProvider");
    }
    return context;
}
