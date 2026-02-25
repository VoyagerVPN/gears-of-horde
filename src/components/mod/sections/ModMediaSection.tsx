"use client";

import { Images } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import MediaGallery from "@/components/mod/shared/MediaGallery";
import ScreenshotDropzone from "@/components/ui/ScreenshotDropzone";
import { GripVertical, Trash2 } from "lucide-react";
import { STANDARD_INPUT_STYLE } from "@/lib/constants/ui-constants";

interface ModMediaSectionProps {
    screenshots: string[];
    videos: {
        trailer?: string;
        review?: string;
    };
    isEditing: boolean;
    onUpdateScreenshots: (urls: string[]) => void;
    onUpdateVideo: (type: 'trailer' | 'review', value: string) => void;
    invalidFields?: Set<string>;
    onClearField?: (field: string) => void;
}

// Помощник для извлечения ID видео YouTube
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

/**
 * Секция медиа: видео (трейлер/обзор) и галерея скриншотов с поддержкой Drag & Drop
 */
export default function ModMediaSection({
    screenshots,
    videos,
    isEditing,
    onUpdateScreenshots,
    onUpdateVideo,
    invalidFields = new Set(),
    onClearField
}: ModMediaSectionProps) {
    const t = useTranslations('Common');

    const onScreenshotDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const items = Array.from(screenshots);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        onUpdateScreenshots(items);
    };

    if (!isEditing) {
        return <MediaGallery screenshots={screenshots} videos={videos} />;
    }

    return (
        <div className="bg-surface rounded-xl p-6 border border-white/5 space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-white/5 pb-2 font-exo2 uppercase tracking-wide flex items-center gap-2">
                <Images size={20} className="text-primary" /> {t('mediaGallery')}
            </h2>

            {/* Секция Видео */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['trailer', 'review'] as const).map((type) => (
                    <div key={type} className="space-y-2">
                        <label htmlFor={`mod-${type}-url`} className="text-xs font-bold text-textMuted uppercase font-exo2">
                            {t(`${type}Url`)}
                        </label>
                        <input
                            id={`mod-${type}-url`}
                            type="text"
                            value={videos[type] || ''}
                            onChange={e => onUpdateVideo(type, e.target.value)}
                            className={STANDARD_INPUT_STYLE}
                            placeholder="https://youtube.com/..."
                            spellCheck={false}
                        />
                        {videos[type] && (
                            <div className="aspect-video rounded-lg overflow-hidden border border-white/10 mt-2">
                                <iframe
                                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(videos[type]!)}`}
                                    title={`${type} Preview`}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full"
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Секция Скриншотов */}
            <div className="space-y-3">
                <h4 className="text-xs font-bold text-textMuted uppercase font-exo2">{t('screenshots')}</h4>
                <DragDropContext onDragEnd={onScreenshotDragEnd}>
                    <Droppable droppableId="screenshots" direction="horizontal">
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="flex overflow-x-auto gap-4 pb-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-primary/50"
                            >
                                {screenshots.filter(url => url.trim() !== '').map((url, idx) => (
                                    <Draggable key={url} draggableId={url} index={idx}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={`flex-shrink-0 w-64 ${snapshot.isDragging ? 'opacity-90 scale-105' : ''}`}
                                            >
                                                <div className="relative aspect-[16/9] bg-black/40 rounded-lg border border-white/10 overflow-hidden group">
                                                    <Image
                                                        src={url}
                                                        alt={`Screenshot ${idx + 1}`}
                                                        fill
                                                        className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                                        loading="lazy"
                                                    />
                                                    <div {...provided.dragHandleProps} className="absolute top-2 left-2 p-1.5 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg text-white opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-all">
                                                        <GripVertical size={14} />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => onUpdateScreenshots(screenshots.filter((_, i) => i !== idx))}
                                                        className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg text-white opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:text-red-400 hover:bg-red-500/20 hover:border-red-400/50 transition-all"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-xs font-bold text-white/60 font-mono">
                                                        #{idx + 1}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                                <ScreenshotDropzone
                                    currentCount={screenshots.filter(s => s.trim() !== '').length}
                                    onUploadComplete={(urls) => {
                                        onUpdateScreenshots([...screenshots.filter(s => s.trim() !== ''), ...urls]);
                                        onClearField?.('screenshots');
                                    }}
                                    invalid={invalidFields.has('screenshots')}
                                    onClear={() => onClearField?.('screenshots')}
                                />
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
        </div>
    );
}
