"use client";

import { useState } from "react";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { TagData } from "@/app/actions/tag-actions";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogBody,
    DialogFooter,
    DialogButton,
    DialogAlert,
    dialogSelectClass,
} from "@/components/ui/Dialog";

interface MergeTagModalProps {
    isOpen: boolean;
    onClose: () => void;
    sourceTag: TagData | null;
    allTags: TagData[];
    onMerge: (targetId: string) => Promise<void>;
}

export default function MergeTagModal({ isOpen, onClose, sourceTag, allTags, onMerge }: MergeTagModalProps) {
    const [targetId, setTargetId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!sourceTag) return null;

    const availableTargets = allTags.filter(t => t.id !== sourceTag.id && t.category === sourceTag.category);

    const handleSubmit = async () => {
        if (!targetId) return;
        if (!confirm(`Are you sure you want to merge "${sourceTag.displayName}" into the selected tag? This cannot be undone.`)) return;

        setIsSubmitting(true);
        try {
            await onMerge(targetId);
            onClose();
        } catch (error) {
            console.error("Failed to merge tags:", error);
            alert("Failed to merge tags");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="md">
                <DialogHeader className="bg-white/5 border-b border-white/10">
                    <DialogTitle>Merge Tags</DialogTitle>
                </DialogHeader>

                <DialogBody className="space-y-6">
                    {/* Warning */}
                    <DialogAlert variant="warning" icon={<AlertTriangle size={20} />}>
                        <p className="font-bold text-yellow-400 mb-1">Warning</p>
                        <p>
                            Merging will reassign all mods and news from <strong>{sourceTag.displayName}</strong> to the target tag, and then <strong>permanently delete</strong> the source tag.
                        </p>
                    </DialogAlert>

                    {/* Source -> Target */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 p-3 bg-black/20 border border-white/10 rounded-lg text-center">
                            <div className="text-[10px] text-textMuted uppercase font-bold mb-1">Source</div>
                            <div className="font-bold text-white">{sourceTag.displayName}</div>
                        </div>
                        <ArrowRight className="text-textMuted" />
                        <div className="flex-1">
                            <div className="text-[10px] text-textMuted uppercase font-bold mb-1 text-center">Target</div>
                            <select
                                value={targetId}
                                onChange={(e) => setTargetId(e.target.value)}
                                className={dialogSelectClass}
                            >
                                <option value="">Select Target...</option>
                                {availableTargets.map(tag => (
                                    <option key={tag.id} value={tag.id}>{tag.displayName}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </DialogBody>

                <DialogFooter>
                    <DialogButton type="button" variant="ghost" onClick={onClose}>
                        Cancel
                    </DialogButton>
                    <DialogButton
                        type="button"
                        variant="primary"
                        disabled={!targetId}
                        loading={isSubmitting}
                        onClick={handleSubmit}
                    >
                        {isSubmitting ? "Merging..." : "Merge Tags"}
                    </DialogButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
