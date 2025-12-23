"use client";

import { useState, useEffect } from "react";
import {
    Download, ChevronLeft, Tags, Languages, Users, Coins, Trash2, Zap, FileCog,
    Link as LinkIcon, ExternalLink, MessageSquare, History, AlertTriangle, Plus, X as XIcon, Disc as Discord, Check, GripVertical, Heart
} from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Link } from "@/i18n/routing";
import { useTranslations, useLocale } from 'next-intl';
import Image from "next/image";
import { toggleSubscription, getSubscriptionStatus, recordDownload, recordView } from "@/app/actions/profile-actions";

import { ModData, ModStatusType, ModLink, TagData } from "@/types/mod";
import DateDisplay from "@/components/DateDisplay";
import FeatureList from "@/components/mod/FeatureList";
import MediaGallery from "@/components/mod/MediaGallery";
import InstallationAccordion from "@/components/mod/InstallationAccordion";
import FeedbackSection from "@/components/mod/FeedbackSection";
import SuggestTranslationModal from "@/components/mod/SuggestTranslationModal";
import VersionTag from "@/components/VersionTag";
import Tag from "@/components/ui/Tag";
import DatePicker from "@/components/ui/DatePicker";
import GameVersionSelector from "@/components/ui/GameVersionSelector";

// Extracted components
import ModHeader from "@/components/mod/ModHeader";
import ModAboutSection from "@/components/mod/ModAboutSection";
import ViewModeActions from "@/components/mod/ViewModeActions";

// Admin Components
import EditableChangelog from "@/components/mod/EditableChangelog";
import SimpleMultilineEditor from "@/components/ui/SimpleMultilineEditor";
import EditableLanguageTags from "@/components/mod/EditableLanguageTags";
import TagSelector from "@/components/TagSelector";
import { SIDEBAR_HEADER_STYLE } from "@/lib/constants/ui-constants";
import { getDomain } from "@/lib/utils";

// Helper function to extract YouTube video ID from URL
function getYouTubeVideoId(url: string): string | null {
    if (!url) return null;

    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }

    return null;
}

interface UnifiedModLayoutProps {
    mod: ModData;
    isEditing?: boolean;
    onUpdate?: (data: ModData) => void;
    initialStatus?: ModStatusType;
    isNew?: boolean;
    gameVersionTags?: TagData[];
    onGameVersionTagsRefresh?: () => void;
}

export default function UnifiedModLayout({
    mod,
    isEditing = false,
    onUpdate,
    initialStatus,
    isNew = false,
    gameVersionTags = [],
    onGameVersionTagsRefresh
}: UnifiedModLayoutProps) {
    const t = useTranslations('Common');
    const locale = useLocale() as 'en' | 'ru';

    // Find gamever tag to get database color for Technical Specs (no displayName match needed)
    const gameVerTag = mod.tags.find(t => t.category === 'gamever');

    // --- HELPER UPDATERS (Only used if isEditing is true) ---
    const updateField = <K extends keyof ModData>(field: K, value: ModData[K]) => {
        if (onUpdate) onUpdate({ ...mod, [field]: value });
    };

    const updateVideo = (type: 'trailer' | 'review', value: string) => {
        if (onUpdate) onUpdate({ ...mod, videos: { ...mod.videos, [type]: value } });
    };

    const updateLinkItem = (category: 'community' | 'donations', index: number, key: 'name' | 'url', value: string) => {
        if (!onUpdate) return;
        const newLinks = { ...mod.links };
        newLinks[category] = [...newLinks[category]];
        newLinks[category][index] = { ...newLinks[category][index], [key]: value };
        updateField('links', newLinks);
    };

    const addLinkItem = (category: 'community' | 'donations') => {
        if (!onUpdate) return;
        const newLinks = { ...mod.links };
        newLinks[category] = [...newLinks[category], { name: "", url: "" }];
        updateField('links', newLinks);
    };

    const removeLinkItem = (category: 'community' | 'donations', index: number) => {
        if (!onUpdate) return;
        const newLinks = { ...mod.links };
        newLinks[category] = newLinks[category].filter((_, i) => i !== index);
        updateField('links', newLinks);
    };

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = e.currentTarget.value.trim();
            if (val && !mod.tags.some(t => t.displayName === val && t.category === 'tag')) {
                // New tags always go to category 'tag'
                updateField('tags', [...mod.tags, { displayName: val, category: 'tag' }]);
                e.currentTarget.value = "";
            }
        }
    };

    const removeTag = (tagToRemove: string) => {
        // Only remove tags with category 'tag', not author/gamever
        updateField('tags', mod.tags.filter(t => t.displayName !== tagToRemove || t.category !== 'tag'));
    };

    // Handler for screenshot drag-and-drop reordering
    const onScreenshotDragEnd = (result: DropResult) => {
        if (!result.destination || !onUpdate) return;

        const items = Array.from(mod.screenshots);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        updateField('screenshots', items);
    };

    // --- RENDER HELPERS ---
    const renderLinkBlock = (title: string, icon: any, links: ModLink[], category: 'community' | 'donations') => {
        if (isEditing) {
            return (
                <div className="bg-surface rounded-xl p-4 border border-white/5 flex flex-col">
                    <h3 className={SIDEBAR_HEADER_STYLE}>
                        <Users size={16} className="text-primary" /> {title}
                    </h3>
                    <div className="space-y-2 mt-1">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-textMuted font-exo2">{t('links')}</span>
                            <button type="button" onClick={() => addLinkItem(category)} className="text-primary hover:text-white flex items-center gap-1 text-xs uppercase font-bold font-exo2"><Plus size={12} /> {t('add')}</button>
                        </div>
                        {links.map((link, idx) => (
                            <div key={idx} className="flex gap-2 group items-center">
                                <input type="text" value={link.name} onChange={e => updateLinkItem(category, idx, 'name', e.target.value)} className="w-1/3 bg-black/20 border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-primary/50 placeholder:text-white/20" placeholder={t('name')} />
                                <input type="text" value={link.url} onChange={e => updateLinkItem(category, idx, 'url', e.target.value)} className="flex-1 bg-black/20 border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-primary/50 placeholder:text-white/20" placeholder={t('url')} />
                                <button type="button" onClick={() => removeLinkItem(category, idx)} className="text-textMuted hover:text-red-400 opacity-50 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                            </div>
                        ))}
                        {links.length === 0 && (
                            <div className="text-xs text-textMuted italic opacity-50 text-center py-2">{t('noLinksAdded')}</div>
                        )}
                    </div>
                </div>
            );
        }

        // View Mode
        const Icon = icon;
        return (
            <div className="bg-surface rounded-xl p-4 border border-white/5 flex flex-col">
                <h3 className={SIDEBAR_HEADER_STYLE}>
                    <Icon size={16} className="text-primary" /> {title}
                </h3>
                <div className="flex flex-col gap-2 flex-1">
                    {links.map((link, idx) => {
                        const domain = getDomain(link.url);
                        return (
                            <a
                                key={idx}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-colors group"
                            >
                                {domain && (
                                    <Image
                                        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                                        alt={link.name}
                                        width={16}
                                        height={16}
                                        className="rounded-sm opacity-80 group-hover:opacity-100 transition-opacity shrink-0"
                                        unoptimized
                                    />
                                )}
                                <span className="text-xs font-bold text-textMain group-hover:text-white truncate">{link.name}</span>
                                <ExternalLink size={12} className="ml-auto text-textMuted group-hover:text-white opacity-50 group-hover:opacity-100 transition-all shrink-0" />
                            </a>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-[1600px] mx-auto px-4 py-8">

            {/* Back Link (Only in View Mode or if desired in Edit) */}
            {!isEditing && (
                <Link href="/" className="inline-flex items-center gap-2 text-textMuted hover:text-white transition-colors mb-6 text-xs uppercase tracking-widest font-bold font-exo2">
                    <ChevronLeft size={16} /> {t('backToCatalog')}
                </Link>
            )}

            {/* === HEADER SECTION === */}
            <ModHeader
                mod={mod}
                isEditing={isEditing}
                initialStatus={initialStatus}
                onUpdate={updateField}
                isNew={isNew}
            />

            {/* === MAIN GRID === */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* === LEFT COLUMN (Content) === */}
                <div className="lg:col-span-8 space-y-8">

                    {/* About */}
                    <ModAboutSection
                        description={mod.description}
                        isEditing={isEditing}
                        onUpdate={(value) => updateField('description', value)}
                    />

                    {/* Features List */}
                    {isEditing ? (
                        <SimpleMultilineEditor
                            title={t('features')}
                            icon={Zap}
                            items={mod.features}
                            onChange={(newItems) => updateField('features', newItems)}
                            placeholder="Paste features list here (one per line)..."
                            countLabel="features"
                        />
                    ) : (
                        <FeatureList features={mod.features} />
                    )}

                    {/* Media Gallery */}
                    {isEditing ? (
                        <div className="bg-surface rounded-xl p-6 border border-white/5 space-y-6">
                            <h2 className="text-lg font-bold text-white border-b border-white/5 pb-2 font-exo2 uppercase tracking-wide flex items-center gap-2">
                                <Zap size={20} className="text-primary" /> {t('mediaGallery')}
                            </h2>

                            {/* Videos */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-textMuted uppercase font-exo2">{t('trailerUrl')}</label>
                                    <input
                                        type="text"
                                        value={mod.videos?.trailer || ''}
                                        onChange={e => updateVideo('trailer', e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs text-white outline-none focus:border-primary placeholder:text-white/20"
                                        placeholder="https://youtube.com/..."
                                    />
                                    {/* Trailer Preview */}
                                    {mod.videos?.trailer && (
                                        <div className="aspect-video rounded-lg overflow-hidden border border-white/10 mt-2">
                                            <iframe
                                                src={`https://www.youtube.com/embed/${getYouTubeVideoId(mod.videos.trailer)}`}
                                                title="Trailer Preview"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="w-full h-full"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-textMuted uppercase font-exo2">{t('reviewUrl')}</label>
                                    <input
                                        type="text"
                                        value={mod.videos?.review || ''}
                                        onChange={e => updateVideo('review', e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs text-white outline-none focus:border-primary placeholder:text-white/20"
                                        placeholder="https://youtube.com/..."
                                    />
                                    {/* Review Preview */}
                                    {mod.videos?.review && (
                                        <div className="aspect-video rounded-lg overflow-hidden border border-white/10 mt-2">
                                            <iframe
                                                src={`https://www.youtube.com/embed/${getYouTubeVideoId(mod.videos.review)}`}
                                                title="Review Preview"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="w-full h-full"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Screenshots - Horizontal Carousel with Drag & Drop */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-textMuted uppercase font-exo2">{t('screenshots')}</label>

                                <DragDropContext onDragEnd={onScreenshotDragEnd}>
                                    <Droppable droppableId="screenshots" direction="horizontal">
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className="flex overflow-x-auto gap-4 pb-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-primary/50"
                                            >
                                                {mod.screenshots.map((url, idx) => (
                                                    <Draggable key={`screenshot-${idx}`} draggableId={`screenshot-${idx}`} index={idx}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                className={`flex-shrink-0 w-64 space-y-2 ${snapshot.isDragging ? 'opacity-90 scale-105' : ''}`}
                                                            >
                                                                {/* Preview Card */}
                                                                <div key={url} className="relative aspect-[16/9] bg-black/40 rounded-lg border border-white/10 overflow-hidden group">
                                                                    {url ? (
                                                                        <>
                                                                            <img
                                                                                src={url}
                                                                                alt={`Screenshot ${idx + 1}`}
                                                                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                                                onError={(e) => {
                                                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                                                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                                                                }}
                                                                            />
                                                                            <div className="hidden absolute inset-0 flex-col items-center justify-center text-red-400/60 bg-black/60">
                                                                                <XIcon size={24} className="mb-1" />
                                                                                <span className="text-xs uppercase font-bold font-exo2">{t('invalidUrl')}</span>
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20">
                                                                            <span className="text-xs uppercase font-bold tracking-wider font-exo2">{t('pasteUrl')}</span>
                                                                        </div>
                                                                    )}

                                                                    {/* Drag Handle */}
                                                                    <div
                                                                        {...provided.dragHandleProps}
                                                                        className="absolute top-2 left-2 p-1.5 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg text-white/40 hover:text-white cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-all"
                                                                        title="Drag to reorder"
                                                                    >
                                                                        <GripVertical size={14} />
                                                                    </div>

                                                                    {/* Delete Overlay */}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => updateField('screenshots', mod.screenshots.filter((_, i) => i !== idx))}
                                                                        className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg text-white/60 hover:text-red-400 hover:bg-red-500/20 hover:border-red-400/50 opacity-0 group-hover:opacity-100 transition-all"
                                                                        title={t('remove')}
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>

                                                                    {/* Index Badge */}
                                                                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-xs font-bold text-white/60 font-mono">
                                                                        #{idx + 1}
                                                                    </div>
                                                                </div>

                                                                {/* URL Input */}
                                                                <input
                                                                    type="text"
                                                                    value={url}
                                                                    onChange={e => {
                                                                        const newScreens = [...mod.screenshots];
                                                                        newScreens[idx] = e.target.value;
                                                                        updateField('screenshots', newScreens);
                                                                    }}
                                                                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs text-white/80 outline-none focus:border-primary/50 placeholder:text-white/20 truncate"
                                                                    placeholder={t('pasteUrl')}
                                                                />
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}

                                                {/* Add New Slot Button */}
                                                <div
                                                    onClick={() => updateField('screenshots', [...mod.screenshots, ""])}
                                                    className="flex-shrink-0 w-48 aspect-[16/9] border-2 border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
                                                >
                                                    <Plus size={24} className="text-white/20 group-hover:text-primary transition-colors" />
                                                    <span className="text-xs text-textMuted group-hover:text-white transition-colors uppercase font-bold font-exo2">{t('add')}</span>
                                                </div>
                                            </div>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                            </div>
                        </div>
                    ) : (
                        <MediaGallery screenshots={mod.screenshots} videos={mod.videos} />
                    )}

                    {/* Changelog */}
                    {isEditing ? (
                        <EditableChangelog
                            logs={mod.changelog}
                            onChange={(newLogs) => updateField('changelog', newLogs)}
                        />
                    ) : (
                        <section className="bg-surface rounded-xl p-6 border border-white/5">
                            <h2 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-2 font-exo2 uppercase tracking-wide flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <History size={20} className="text-primary" /> {t('changelog')}
                                </span>
                                <div className="flex items-center gap-2 text-xs text-textMuted font-normal normal-case tracking-normal">
                                    {t('lastUpdated')}: <DateDisplay date={mod.changelog[0]?.date || new Date().toISOString()} locale={locale} />
                                </div>
                            </h2>
                            <div className="space-y-6">
                                {mod.changelog.map((log, idx) => (
                                    <div key={idx} className="relative pl-6 border-l border-white/10">
                                        <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-surface border-2 border-primary"></div>
                                        <div className="flex items-baseline gap-3 mb-2">
                                            <span className="text-base font-bold text-white">{log.version}</span>
                                            <DateDisplay date={log.date} locale={locale} className="text-xs text-textMuted font-mono" />
                                        </div>
                                        <ul className="list-disc list-inside text-sm text-textMuted space-y-1">
                                            {log.changes.map((change, cIdx) => (
                                                <li key={cIdx}>{change}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}


                    {/* Feedback & Reviews */}
                    {isEditing ? (
                        <div className="p-6 border border-dashed border-white/10 rounded-xl text-center text-textMuted text-sm bg-white/[0.02]">
                            {t('feedbackReadOnly')}
                        </div>
                    ) : (
                        <FeedbackSection locale={locale} />
                    )}

                </div>

                {/* === RIGHT COLUMN (Sidebar) === */}
                <div className="lg:col-span-4 space-y-6 sticky top-24">

                    {/* ACTIONS BLOCK */}
                    <div className="bg-surface rounded-xl p-6 border border-white/5 shadow-[0_0_30px_-10px_rgba(0,0,0,0.5)] relative overflow-hidden space-y-4">
                        {mod.isSaveBreaking && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-3 items-start">
                                <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
                                <div>
                                    <div className="text-red-400 font-bold text-xs uppercase mb-0.5 font-exo2">{t('wipeRequired')}</div>
                                    <p className="text-red-400/70 text-[10px] leading-tight">{t('wipeRequiredDesc')}</p>
                                </div>
                            </div>
                        )}

                        {isEditing ? (
                            // EDIT MODE ACTIONS
                            <>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className={SIDEBAR_HEADER_STYLE.replace('mb-3', 'mb-0')}>
                                        <LinkIcon size={16} className="text-primary" /> {t('actions')}
                                    </h3>
                                    <button
                                        onClick={() => updateField('isSaveBreaking', !mod.isSaveBreaking)}
                                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border text-[12px] font-bold ${mod.isSaveBreaking ? 'bg-red-500 text-white border-red-500 hover:bg-red-600 shadow-lg shadow-red-900/20' : 'bg-transparent text-textMuted border-white/10 hover:text-white hover:border-white/30'}`}
                                    >
                                        <AlertTriangle size={12} className={mod.isSaveBreaking ? "fill-white" : ""} />
                                        {mod.isSaveBreaking ? t('wipeRequired') : `${t('wipeRequired')}?`}
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-textMuted uppercase font-exo2">{t('downloadUrl')}</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={mod.links.download}
                                                onChange={e => updateField('links', { ...mod.links, download: e.target.value })}
                                                className="w-full bg-black/40 border border-transparent hover:border-white/10 focus:border-primary/50 rounded p-2 pl-8 text-xs text-white outline-none transition-colors"
                                                placeholder="https://nexusmods.com/..."
                                            />
                                            <Download size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-textMuted opacity-50" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-textMuted uppercase font-exo2">{t('discordUrl')}</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={mod.links.discord}
                                                onChange={e => updateField('links', { ...mod.links, discord: e.target.value })}
                                                className="w-full bg-black/40 border border-transparent hover:border-white/10 focus:border-[#5865F2]/50 rounded p-2 pl-8 text-xs text-white outline-none transition-colors"
                                                placeholder="https://discord.gg/..."
                                            />
                                            <MessageSquare size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-textMuted opacity-50" />
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            // VIEW MODE ACTIONS
                            <ViewModeActions
                                mod={mod}
                                t={t}
                            />
                        )}

                        {/* Installation Instructions */}
                        {isEditing ? (
                            <SimpleMultilineEditor
                                title={t('installationGuide')}
                                icon={FileCog}
                                items={mod.installationSteps}
                                onChange={(newItems) => updateField('installationSteps', newItems)}
                                placeholder="Paste installation steps here (one per line)..."
                                countLabel="steps"
                            />
                        ) : (
                            <InstallationAccordion steps={mod.installationSteps} />
                        )}
                    </div>

                    {/* TAGS BLOCK - FULL WIDTH */}
                    <div className="bg-surface rounded-xl p-4 border border-white/5">
                        <h3 className={SIDEBAR_HEADER_STYLE}>
                            <Tags size={16} className="text-primary" /> {t('tags')}
                        </h3>
                        {isEditing ? (
                            <TagSelector
                                selectedTags={mod.tags.filter(t => t.category === 'tag')}
                                onTagsChange={(newTags) => {
                                    // Keep non-tag categories and replace 'tag' category
                                    const otherTags = mod.tags.filter(t => t.category !== 'tag');
                                    updateField('tags', [...otherTags, ...newTags]);
                                }}
                                category="tag"
                                showPopular={true}
                            />
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {mod.tags
                                    .filter(t => t.category === 'tag')
                                    .sort((a, b) => a.displayName.localeCompare(b.displayName))
                                    .map(tag => (
                                        <Tag
                                            key={tag.id || tag.displayName}
                                            color={tag.color || undefined}
                                            href={`/search?tag=${tag.displayName}`}
                                        >
                                            {tag.displayName}
                                        </Tag>
                                    ))}
                            </div>
                        )}
                    </div>

                    {/* LOCALIZATIONS - FULL WIDTH TAG-BASED */}
                    <div className="bg-surface rounded-xl p-4 border border-white/5">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className={SIDEBAR_HEADER_STYLE.replace('mb-3', 'mb-0')}>
                                <Languages size={16} className="text-primary" /> {t('localizations')}
                            </h3>
                        </div>

                        {isEditing ? (
                            <EditableLanguageTags
                                items={mod.tags.filter(t => t.category === 'lang')}
                                onChange={(newLangTags) => {
                                    // Keep non-lang categories and replace 'lang' category
                                    const otherTags = mod.tags.filter(t => t.category !== 'lang');
                                    onUpdate && onUpdate({ ...mod, tags: [...otherTags, ...newLangTags] });
                                }}
                            />
                        ) : (
                            <>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {mod.tags
                                        .filter(t => t.category === 'lang')
                                        .map((loc, idx) => {
                                            const displayName = loc.displayName || 'Unknown';
                                            const hasExternalLink = loc.externalLink && loc.externalLink.trim().length > 0;
                                            return !hasExternalLink ? (
                                                <Tag key={idx} category="lang" value="builtin">
                                                    {displayName}
                                                </Tag>
                                            ) : (
                                                <Tag
                                                    key={idx}
                                                    category="lang"
                                                    value="external"
                                                    href={`/search?lang=${loc.value}`}
                                                    onAction={() => window.open(loc.externalLink, '_blank')}
                                                    actionIcon={<Download size={14} />}
                                                >
                                                    {displayName}
                                                </Tag>
                                            );
                                        })}
                                </div>
                                <SuggestTranslationModal modSlug={mod.slug} modName={mod.title} />
                            </>
                        )}
                    </div>

                    {/* TECHNICAL SPECS - FULL WIDTH */}
                    <div className="bg-surface rounded-xl p-4 border border-white/5">
                        <h3 className={SIDEBAR_HEADER_STYLE}>
                            <LinkIcon size={16} className="text-primary" /> {t('technicalSpecs')}
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                <span className="text-textMuted uppercase tracking-wider font-bold font-exo2">{t('modVersion')}:</span>
                                {isEditing ? (
                                    <input type="text" value={mod.version} onChange={e => updateField('version', e.target.value)} className="bg-black/40 border border-white/10 rounded px-2.5 py-1 text-white font-mono text-[13px] font-bold w-24 text-right outline-none focus:border-primary" />
                                ) : (
                                    <VersionTag type="mod" version={mod.version} />
                                )}
                            </div>
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                <span className="text-textMuted uppercase tracking-wider font-bold font-exo2">{t('gameVersion')}:</span>
                                {isEditing ? (
                                    <GameVersionSelector
                                        value={mod.gameVersion}
                                        onChange={(value) => updateField('gameVersion', value)}
                                        gameVersionTags={gameVersionTags}
                                        onTagsRefresh={onGameVersionTagsRefresh}
                                        compact
                                    />
                                ) : (
                                    <VersionTag type="game" version={mod.gameVersion} color={gameVerTag?.color || undefined} />
                                )}
                            </div>
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                <span className="text-textMuted uppercase tracking-wider font-bold font-exo2">{t('updated')}:</span>
                                {isEditing ? (
                                    <DatePicker
                                        value={mod.changelog[0]?.date ? new Date(mod.changelog[0].date) : undefined}
                                        onChange={(date) => {
                                            const newLogs = [...mod.changelog];
                                            if (newLogs.length > 0) {
                                                newLogs[0] = { ...newLogs[0], date: date ? date.toISOString() : "" };
                                                updateField('changelog', newLogs);
                                            }
                                        }}
                                        className="text-xs py-0.5"
                                        locale={locale}
                                    />
                                ) : (
                                    <DateDisplay date={mod.changelog[0]?.date || new Date().toISOString()} locale={locale} className="font-mono text-textMain font-bold text-[13px]" />
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-textMuted uppercase tracking-wider font-bold font-exo2">{t('created')}:</span>
                                {isEditing ? (
                                    <DatePicker
                                        value={mod.createdAt ? new Date(mod.createdAt) : undefined}
                                        onChange={(date) => updateField('createdAt', date ? date.toISOString() : undefined)}
                                        className="text-xs py-0.5"
                                        locale={locale}
                                    />
                                ) : (
                                    mod.createdAt && <DateDisplay date={mod.createdAt} locale={locale} className="font-mono text-textMain font-bold text-[13px]" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* LINK BLOCKS GRID - Aligned relative to each other */}
                    <div className={`grid gap-4 ${isEditing ? 'grid-cols-1' : 'grid-cols-2'}`}>
                        {/* COMMUNITY */}
                        {renderLinkBlock(t('community'), Users, mod.links.community, 'community')}

                        {/* SUPPORT THE CREATOR */}
                        {renderLinkBlock(t('supportCreator'), Coins, mod.links.donations, 'donations')}
                    </div>

                    {/* Edit Mode Badge */}
                    {isEditing && (
                        <div className="text-xs text-center text-textMuted italic border border-dashed border-white/10 p-3 rounded-lg bg-white/[0.02]">
                            <LinkIcon size={14} className="inline-block mr-1" />
                            <span>{t('editingInAdminMode')}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
