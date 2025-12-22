"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { RefreshCw, Tags, Check, AlertCircle } from 'lucide-react';
import { syncAllTags } from '@/app/actions/sync-tags';

export default function AdminSettingsPage() {
    const t = useTranslations('Admin');
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState<{
        success: boolean;
        message: string;
        details?: any;
    } | null>(null);

    const handleSync = async () => {
        setIsSyncing(true);
        setSyncResult(null);

        try {
            const result = await syncAllTags();
            setSyncResult({
                success: true,
                message: 'Tag sync completed successfully!',
                details: result
            });
        } catch (error) {
            setSyncResult({
                success: false,
                message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 pb-20">
            <div className="max-w-[1600px] w-full mx-auto px-6 py-8 space-y-8">
                <h1 className="text-3xl font-bold text-white font-exo2">{t('settings')}</h1>

                {/* Tag Sync Section */}
                <div className="bg-surface border border-white/5 rounded-xl p-6 space-y-6">
                    <div className="flex items-center gap-3">
                        <Tags className="text-primary" size={24} />
                        <div>
                            <h2 className="text-xl font-bold text-white font-exo2">Tag Synchronization</h2>
                            <p className="text-sm text-textMuted">Sync game versions and author tags to database with proper colors</p>
                        </div>
                    </div>

                    <div className="bg-black/20 rounded-lg p-4 space-y-2 text-sm">
                        <p className="text-textMuted">This action will:</p>
                        <ul className="list-disc list-inside text-textMuted space-y-1 ml-2">
                            <li>Create <span className="text-white font-mono">gamever</span> tags for all unique game versions</li>
                            <li>Link <span className="text-white font-mono">gamever</span> tags to mods based on their gameVersion field</li>
                            <li>Set <span className="text-cyan-400">cyan color (#22d3ee)</span> for all <span className="text-white font-mono">author</span> tags</li>
                            <li>Recalculate <span className="text-white font-mono">gamever</span> colors using <span className="text-red-400">red</span> → <span className="text-green-400">green</span> gradient</li>
                        </ul>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold uppercase tracking-wider transition-all ${isSyncing
                                ? 'bg-white/10 text-textMuted cursor-not-allowed'
                                : 'bg-primary hover:bg-red-600 text-white shadow-lg shadow-red-900/20'
                                }`}
                        >
                            <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
                            {isSyncing ? 'Syncing...' : 'Sync Tags'}
                        </button>

                        {syncResult && (
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${syncResult.success
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}>
                                {syncResult.success ? <Check size={16} /> : <AlertCircle size={16} />}
                                <span className="text-sm font-medium">{syncResult.message}</span>
                            </div>
                        )}
                    </div>

                    {syncResult?.details && (
                        <div className="bg-black/30 rounded-lg p-4 font-mono text-xs text-textMuted">
                            <pre>{JSON.stringify(syncResult.details, null, 2)}</pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

