import SectionHeader from "@/components/ui/SectionHeader";
import { Film, XIcon as X, Plus } from "lucide-react";

interface ModMediaSectionProps {
    videos: {
        trailer: string;
        review: string;
    };
    screenshots: string[];
    isEditing?: boolean;
    onUpdateVideo?: (type: 'trailer' | 'review', value: string) => void;
    onUpdateScreenshots?: (screenshots: string[]) => void;
}

export default function ModMediaSection({
    videos,
    screenshots,
    isEditing = false,
    onUpdateVideo,
    onUpdateScreenshots
}: ModMediaSectionProps) {
    if (!isEditing) {
        // In view mode, use the existing MediaGallery component
        return null;
    }

    return (
        <section className="bg-surface rounded-xl p-6 border border-white/5">
            <SectionHeader icon={Film}>Media Configuration</SectionHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl border border-white/10 bg-black/20 space-y-2">
                    <span className="text-xs font-bold text-textMuted uppercase">Trailer URL</span>
                    <input
                        type="text"
                        value={videos.trailer}
                        onChange={e => onUpdateVideo?.('trailer', e.target.value)}
                        className="w-full bg-surface border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-primary outline-none"
                        placeholder="https://youtube.com/..."
                    />
                </div>
                <div className="p-4 rounded-xl border border-white/10 bg-black/20 space-y-2">
                    <span className="text-xs font-bold text-textMuted uppercase">Review URL</span>
                    <input
                        type="text"
                        value={videos.review}
                        onChange={e => onUpdateVideo?.('review', e.target.value)}
                        className="w-full bg-surface border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-primary outline-none"
                        placeholder="https://youtube.com/..."
                    />
                </div>
            </div>
            <div className="space-y-3">
                <h3 className="text-xs font-bold text-textMuted uppercase tracking-wider flex items-center justify-between">
                    <span>Screenshots Slots</span>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                const newScreens = [...screenshots];
                                newScreens.pop();
                                onUpdateScreenshots?.(newScreens);
                            }}
                            className="p-1 hover:bg-red-500/20 text-textMuted hover:text-red-400 rounded"
                            title="Remove last slot"
                        >
                            <X size={14} />
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const newScreens = [...screenshots, ""];
                                onUpdateScreenshots?.(newScreens);
                            }}
                            className="p-1 hover:bg-primary/20 text-textMuted hover:text-primary rounded"
                            title="Add slot"
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                </h3>
                <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-zinc-950 rounded-lg p-2 bg-black/20">
                    {screenshots.map((id, idx) => (
                        <div key={idx} className="flex-shrink-0 aspect-[16/9] w-48 bg-zinc-900 rounded-lg border border-white/5 flex flex-col items-center justify-center relative group">
                            <span className="text-xs text-textMuted font-mono mb-2">Slot {idx + 1}</span>
                            <button className="text-[10px] bg-white/10 hover:bg-primary hover:text-white px-2 py-1 rounded border border-white/10 transition-colors">
                                Upload / Link
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
