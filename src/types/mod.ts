export type ModStatusType = 'active' | 'on_hold' | 'discontinued' | 'upcoming' | 'unknown';

export interface ModLink {
    name: string;
    url: string;
}

export interface ModStats {
    rating: number;
    ratingCount: number;
    downloads: string;
    views: string;
}

export interface ModChangelog {
    version: string;
    date: string;
    changes: string[];
    isSaveBreaking?: boolean;
}

export interface ModLocalization {
    code: string;
    name: string;
    type: 'builtin' | 'external';
    url?: string;
}

export interface TagData {
    id?: string;
    value?: string;
    displayName: string;
    color?: string | null;
    category?: string;
    usageCount?: number;
}

export interface ModData {
    title: string;
    slug: string;
    version: string;
    author: string;
    description: string;
    status: ModStatusType;
    gameVersion: string;
    bannerUrl?: string;
    isSaveBreaking: boolean;
    features: string[];
    tags: TagData[]; // Updated to support rich tags
    installationSteps: string[];
    links: {
        download: string;
        discord: string;
        community: ModLink[];
        donations: ModLink[];
    };
    stats: ModStats;
    videos: {
        trailer: string;
        review: string;
    };
    screenshots: string[];
    changelog: ModChangelog[];
    localizations: ModLocalization[];
    createdAt?: string; // ISO date string
    updatedAt?: string; // ISO date string
}

export interface TranslationSuggestion {
    id: string;
    modSlug: string;
    modName: string;
    author: string;
    link: string;
    languageCode: string;
    languageName: string;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: string;
}

export interface NewsItem {
    id: string;
    modSlug: string;
    modName: string;
    description: string;
    date: string;
    tags: TagData[]; // Updated to match DB tags
    gameVersion?: string;
    isSaveBreaking?: boolean;
    sourceUrl?: string;
}

export interface ModSubmission {
    id: string;
    title: string;
    slug: string;
    version: string;
    author: string;
    description: string;
    gameVersion: string;
    bannerUrl?: string;
    isSaveBreaking: boolean;
    features: string[];
    installationSteps: string[];
    links: ModData['links'];
    videos: ModData['videos'];
    changelog: ModChangelog[];
    localizations: ModLocalization[];
    screenshots: string[];
    tags: TagData[];

    // Submitter info (from Discord auth)
    submitterId: string;
    submitterName: string;
    submitterImage?: string;
    submitterNote?: string;

    // Status
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
    submittedAt: string;
    reviewedAt?: string;
}
