"use client";

import { useCallback } from "react";
import { ModLink } from "@/schemas";
import { getFixedLinkName } from "@/lib/utils";

export function useLinkUnfurler() {
    const unfurlLinkList = useCallback(async (list: ModLink[]): Promise<ModLink[]> => {
        return await Promise.all(list.map(async (link) => {
            if (!link.url) return link;

            // Check for fixed names first (always enforce these)
            const fixedName = getFixedLinkName(link.url);
            if (fixedName) {
                return { ...link, name: fixedName };
            }

            // If URL exists but Name is empty (and looks like a URL), try to unfurl
            if (!link.name && link.url.startsWith('http')) {
                try {
                    const response = await fetch("/api/unfurl", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ url: link.url }),
                    });
                    const res = await response.json();
                    if (res.success && res.title) {
                        return { ...link, name: res.title };
                    }
                } catch (err) {
                    console.error("Failed to auto-unfurl link:", link.url, err);
                }
            }
            return link;
        }));
    }, []);

    return { unfurlLinkList };
}
