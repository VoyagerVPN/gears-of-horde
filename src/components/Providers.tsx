"use client"

import { SupabaseAuthProvider } from "@/components/SupabaseAuthProvider"
import { ToastProvider } from "@/shared/ui"

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SupabaseAuthProvider>
            <ToastProvider>
                {children}
            </ToastProvider>
        </SupabaseAuthProvider>
    )
}
