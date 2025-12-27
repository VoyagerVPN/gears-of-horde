"use client";

import { useState } from "react";
import { History, RotateCcw, Trash2, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { DraftData } from "@/hooks/useAutosave";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogBody,
    DialogFooter,
    DialogButton,
} from "@/components/ui/Dialog";

interface DraftHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    draftHistory: DraftData[];
    onRestore: (draftId: string) => void;
    onDelete: (draftId: string) => void;
    onClearAll: () => void;
}

function formatRelativeTime(isoDate: string): string {
    const now = new Date();
    const date = new Date(isoDate);
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString();
}

function formatFullDate(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleString();
}

export default function DraftHistoryModal({
    isOpen,
    onClose,
    draftHistory,
    onRestore,
    onDelete,
    onClearAll,
}: DraftHistoryModalProps) {
    const t = useTranslations("Admin");
    const [confirmClearAll, setConfirmClearAll] = useState(false);



    const handleRestore = (draftId: string) => {
        onRestore(draftId);
        onClose();
    };

    const handleClearAll = () => {
        if (confirmClearAll) {
            onClearAll();
            onClose();
        } else {
            setConfirmClearAll(true);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                setConfirmClearAll(false);
                onClose();
            }
        }}>
            <DialogContent size="lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <History size={20} className="text-primary" />
                        {t("draftHistory")}
                    </DialogTitle>
                </DialogHeader>

                <DialogBody>
                    {draftHistory.length === 0 ? (
                        <div className="text-center py-10">
                            <History size={40} className="text-textMuted opacity-30 mx-auto mb-3" />
                            <p className="text-textMuted text-sm">{t("noDraftsFound")}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {draftHistory.map((draft, index) => (
                                <div
                                    key={draft.id}
                                    className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-xl"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-white truncate">
                                                {draft.data.title || "Untitled"}
                                            </span>
                                            {index === 0 && (
                                                <span className="px-2 py-0.5 text-[10px] font-bold bg-primary/20 text-primary rounded-full uppercase">
                                                    Latest
                                                </span>
                                            )}
                                        </div>
                                        <p
                                            className="text-xs text-textMuted mt-1"
                                            title={formatFullDate(draft.savedAt)}
                                        >
                                            {formatRelativeTime(draft.savedAt)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleRestore(draft.id)}
                                            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                                            title={t("restoreVersion")}
                                        >
                                            <RotateCcw size={14} className="text-green-400" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(draft.id)}
                                            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                                            title={t("deleteVersion")}
                                        >
                                            <Trash2 size={14} className="text-red-400" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </DialogBody>

                {draftHistory.length > 0 && (
                    <DialogFooter className="justify-between">
                        <span className="text-xs text-textMuted">
                            {draftHistory.length} version{draftHistory.length !== 1 ? "s" : ""} saved
                        </span>
                        <DialogButton
                            variant={confirmClearAll ? "danger" : "ghost"}
                            size="sm"
                            onClick={handleClearAll}
                            className={!confirmClearAll ? "text-red-400 border border-red-400/30" : ""}
                        >
                            {confirmClearAll ? (
                                <>
                                    <AlertTriangle size={14} />
                                    {t("clearAllDrafts")}?
                                </>
                            ) : (
                                <>
                                    <Trash2 size={14} />
                                    {t("clearAllDrafts")}
                                </>
                            )}
                        </DialogButton>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
