"use client";

import { useState, useCallback } from "react";
import { ModData, TagData } from "@/schemas";
import { fetchTagsByCategory } from "@/app/actions/tag-actions";
import { getLatestGameVersion, slugify } from "@/lib/utils";

const EMPTY_MOD: ModData = {
    title: "",
    slug: "",
    version: "v1.0",
    author: "",
    description: "",
    status: "active",
    gameVersion: "V1.0",
    bannerUrl: "",
    isSaveBreaking: false,
    features: [],
    tags: [
        { displayName: "English", category: "lang", value: "EN", isExternal: false }
    ],
    installationSteps: [
        "Download the mod file.",
        "Extract the archive to your 7 Days to Die 'Mods' folder.",
        "Verify the folder structure: 'Mods/ModName/ModInfo.xml'.",
        "Start the game."
    ],
    links: { download: "", discord: "", community: [], donations: [] },
    stats: { rating: 0, ratingCount: 0, downloads: "0", views: "0" },
    videos: { trailer: "", review: "" },
    screenshots: [],
    changelog: [],
    localizations: [],
    createdAt: new Date().toISOString().split('T')[0]
};

interface UseModFormProps {
    initialData?: ModData;
    isNew: boolean;
}

interface UseModFormReturn {
    data: ModData;
    setData: React.Dispatch<React.SetStateAction<ModData>>;
    gameVersionTags: TagData[];
    setGameVersionTags: React.Dispatch<React.SetStateAction<TagData[]>>;
    tempGameVersionTags: TagData[];
    setTempGameVersionTags: React.Dispatch<React.SetStateAction<TagData[]>>;
    refreshGameVersionTags: () => void;
    handleGameVersionCreate: (version: string) => void;
    handleUpdate: (newData: ModData) => void;
}

export function useModForm({ initialData, isNew }: UseModFormProps): UseModFormReturn {
    const [data, setData] = useState<ModData>(() => {
        const base = initialData || EMPTY_MOD;
        let localizations = base.localizations || [];
        if (!localizations.some(loc => loc.code === 'EN')) {
            localizations = [
                { code: "EN", name: "English", type: 'builtin', url: "" },
                ...localizations
            ];
        }
        return { ...base, localizations };
    });

    const [gameVersionTags, setGameVersionTags] = useState<TagData[]>([]);
    const [tempGameVersionTags, setTempGameVersionTags] = useState<TagData[]>([]);

    const refreshGameVersionTags = useCallback(() => {
        fetchTagsByCategory('gamever').then((tags) => {
            setGameVersionTags(tags);

            if (isNew) {
                const latest = getLatestGameVersion(tags, 'V1.4');
                setData(prev => {
                    if (prev.gameVersion === 'V1.0' || !prev.gameVersion) {
                        return { ...prev, gameVersion: latest };
                    }
                    return prev;
                });
            }
        });
    }, [isNew]);

    const handleGameVersionCreate = useCallback((version: string) => {
        const allVersions = [
            ...gameVersionTags.map(t => t.displayName),
            ...tempGameVersionTags.map(t => t.displayName),
            version
        ];

        const { calculateGameVersionColor, gameVersionToTagValue } = require("@/lib/utils");

        const newTag: TagData = {
            id: `temp-${Date.now()}`,
            displayName: version,
            value: gameVersionToTagValue(version),
            category: 'gamever',
            color: calculateGameVersionColor(version, allVersions)
        };

        setGameVersionTags(prev => prev.map(tag => ({
            ...tag,
            color: calculateGameVersionColor(tag.displayName, allVersions)
        })));

        setTempGameVersionTags(prev => {
            const updatedTempTags = prev.map(tag => ({
                ...tag,
                color: calculateGameVersionColor(tag.displayName, allVersions)
            }));
            return [...updatedTempTags, newTag];
        });

        setData(prev => ({ ...prev, gameVersion: version }));
    }, [gameVersionTags, tempGameVersionTags]);

    const handleUpdate = useCallback((newData: ModData) => {
        // Auto-generate slug from title for new mods
        if (isNew && newData.title !== data.title) {
            newData.slug = slugify(newData.title);
        }
        // Sync changelog version with mod version
        if (newData.changelog.length > 0 &&
            data.changelog.length > 0 &&
            newData.changelog[0].version !== data.changelog[0].version) {
            newData.version = newData.changelog[0].version;
        }
        setData(newData);
    }, [data.title, data.changelog, isNew]);

    return {
        data,
        setData,
        gameVersionTags,
        setGameVersionTags,
        tempGameVersionTags,
        setTempGameVersionTags,
        refreshGameVersionTags,
        handleGameVersionCreate,
        handleUpdate
    };
}
