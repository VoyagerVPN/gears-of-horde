"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";

import { ModChangelog } from "@/types/mod";
import { useToast } from "@/shared/ui";
import ChangelogHeader from "../changelog/ChangelogHeader";
import ChangelogEntry from "../changelog/ChangelogEntry";
import HistoryToggle from "../changelog/HistoryToggle";
import { useTranslations } from 'next-intl';

interface EditableChangelogProps {
    logs: ModChangelog[];
    onChange: (newLogs: ModChangelog[]) => void;
}

export default function EditableChangelog({ logs, onChange }: EditableChangelogProps) {
    const t = useTranslations('Common');
    const locale = useLocale() as 'en' | 'ru';
    const { showToast } = useToast();
    const [showAllHistory, setShowAllHistory] = useState(true);

    // Ensure at least one entry exists
    useEffect(() => {
        if (logs.length === 0) {
            onChange([{
                version: "1.0.0.0",
                date: "",
                changes: [""]
            }]);
        }
    }, [logs, onChange]);

    const addVersion = () => {
        if (logs.length > 0 && !logs[0].date) {
            showToast(t('mustPickDateBeforeNewVersion'), 'warning');
            return;
        }

        onChange([{
            version: "1.0.0.0",
            date: "",
            changes: [""]
        }, ...logs]);
    };

    const removeVersion = (index: number) => {
        if (logs.length <= 1) return;
        onChange(logs.filter((_, i) => i !== index));
    };

    const sortLogsByDate = (logsToSort: ModChangelog[]): ModChangelog[] => {
        return [...logsToSort].sort((a, b) => {
            if (!a.date && !b.date) return 0;
            if (!a.date) return -1;
            if (!b.date) return 1;
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
    };

    const updateVersion = (index: number, value: string) => {
        const newLogs = [...logs];
        newLogs[index] = { ...newLogs[index], version: value };
        onChange(newLogs);
    };

    const updateDate = (index: number, value: string) => {
        const newLogs = [...logs];
        newLogs[index] = { ...newLogs[index], date: value };
        onChange(sortLogsByDate(newLogs));
    };

    const updateChanges = (index: number, newChanges: string[]) => {
        const newLogs = [...logs];
        newLogs[index].changes = newChanges;
        onChange(newLogs);
    };

    const visibleCount = showAllHistory ? logs.length : 1;

    return (
        <div className="bg-surface border border-white/5 rounded-xl overflow-hidden">
            <ChangelogHeader onAddVersion={addVersion} />

            <div className="p-6">
                <div className="space-y-8 relative">
                    {logs.map((log, index) => {
                        if (index >= visibleCount) return null;

                        return (
                            <ChangelogEntry
                                key={index}
                                entry={log}
                                index={index}
                                isLast={index === logs.length - 1}
                                showDelete={logs.length > 1}
                                locale={locale}
                                onVersionChange={updateVersion}
                                onDateChange={updateDate}
                                onChangesChange={updateChanges}
                                onDelete={removeVersion}
                            />
                        );
                    })}

                    <HistoryToggle
                        showAll={showAllHistory}
                        hiddenCount={logs.length - 1}
                        onToggle={() => setShowAllHistory(!showAllHistory)}
                    />
                </div>
            </div>
        </div>
    );
}
