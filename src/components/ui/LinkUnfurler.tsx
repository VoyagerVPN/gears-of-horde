"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn, getDomain } from "@/lib/utils";
import { STANDARD_INPUT_STYLE } from "@/lib/constants/ui-constants";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip";

interface LinkUnfurlerProps {
    name: string;
    url: string;
    onNameChange: (name: string) => void;
    onUrlChange: (url: string) => void;
    onRemove: () => void;
    namePlaceholder?: string;
    urlPlaceholder?: string;
    index: number;
    category: string;
}

export default function LinkUnfurler({
    name,
    url,
    onNameChange,
    onUrlChange,
    onRemove,
    urlPlaceholder,
    index,
    category,
}: LinkUnfurlerProps) {
    const t = useTranslations("Common");
    const [isLoading, setIsLoading] = useState(false);
    const [fetchedIcon, setFetchedIcon] = useState<string | null>(null);

    const handleUnfurl = async () => {
        if (!url || !url.startsWith('http')) return;
        // Only fetch if name is empty (to avoid overwriting user edits)
        if (name.trim() !== '') return;

        setIsLoading(true);
        try {
            const response = await fetch("/api/unfurl", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
            });

            const data = await response.json();

            if (data.success && data.title) {
                onNameChange(data.title);
                if (data.icon) {
                    setFetchedIcon(data.icon);
                }
                // Auto-switch to card view on success
            }
        } catch (error) {
            console.error("Failed to unfurl:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleUnfurl();
        }
    };

    const domain = getDomain(url);
    const iconUrl = fetchedIcon || (domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : null);

    // Always Render Input Mode (Simplified as per user request)
    return (
        <div className="flex gap-2 group items-center w-full">
            {/* URL input with internal icon */}
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="relative flex-1">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                                {isLoading ? (
                                    <Loader2 size={14} className="animate-spin text-primary" />
                                ) : iconUrl ? (
                                    <Image
                                        src={iconUrl}
                                        alt=""
                                        width={14}
                                        height={14}
                                        className="rounded-sm opacity-60"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-3.5 h-3.5 rounded-sm bg-white/10" />
                                )}
                            </div>

                            <input
                                id={`link-url-${category}-${index}`}
                                name={`link-url-${category}-${index}`}
                                type="text"
                                value={url}
                                onChange={(e) => onUrlChange(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className={cn(STANDARD_INPUT_STYLE, "pl-10 w-full")}
                                placeholder={urlPlaceholder || t("url")}
                                spellCheck={false}
                                autoFocus={!url}
                            />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t("pressEnterToUnfurl")}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            {/* Name input is hidden to keep UI clean (auto-fetched on save) */}
            {/* {name && (
                <input
                    id={`link-name-${category}-${index}`}
                    name={`link-name-${category}-${index}`}
                    type="text"
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
                    className={cn(STANDARD_INPUT_STYLE, "w-1/3")}
                    placeholder={namePlaceholder || t("name")}
                    spellCheck={false}
                />
            )} */}

            {/* Remove button - always render to keep alignment, but hide if empty */}
            <button
                type="button"
                onClick={onRemove}
                disabled={!url && !name}
                className={cn(
                    "text-textMuted hover:text-red-400 transition-opacity",
                    (url || name) ? "opacity-50 group-hover:opacity-100" : "opacity-0 pointer-events-none"
                )}
                title={t("remove")}
            >
                <Trash2 size={14} />
            </button>
        </div>
    );
}
