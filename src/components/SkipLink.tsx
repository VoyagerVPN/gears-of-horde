"use client";

import { useTranslations } from "next-intl";

/**
 * Skip Link Component (WCAG 2.4.1 - Bypass Blocks)
 * Allows keyboard users to skip navigation and go directly to main content.
 * Visually hidden but appears on focus.
 */
export default function SkipLink() {
    const t = useTranslations("Accessibility");

    return (
        <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:font-bold focus:text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
        >
            {t("skipToContent")}
        </a>
    );
}
