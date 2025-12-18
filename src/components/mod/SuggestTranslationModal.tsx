"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Globe, Link as LinkIcon, User, Send, Plus } from "lucide-react";
import { submitTranslationSuggestion } from "@/app/actions/translation-actions";
import { useTranslations } from 'next-intl';

interface SuggestTranslationModalProps {
    modSlug: string;
    modName: string;
}

export default function SuggestTranslationModal({ modSlug, modName }: SuggestTranslationModalProps) {
    const t = useTranslations('SuggestTranslation');
    const [open, setOpen] = useState(false);
    const [author, setAuthor] = useState("");
    const [link, setLink] = useState("");
    const [languageCode, setLanguageCode] = useState("");
    const [languageName, setLanguageName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!author || !link || !languageCode || !languageName) return;

        setIsSubmitting(true);

        // Simulate network delay
        setTimeout(async () => {
            await submitTranslationSuggestion({
                modSlug,
                modName,
                author,
                link,
                languageCode: languageCode.toUpperCase(),
                languageName
            });

            setIsSubmitting(false);
            setOpen(false);
            setAuthor("");
            setLink("");
            setLanguageCode("");
            setLanguageName("");
            alert(t('successMessage'));
        }, 800);
    };

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                <button className="text-[10px] text-textMuted/40 hover:text-textMuted transition-colors underline decoration-dashed underline-offset-4 decoration-white/10 hover:decoration-white/30">
                    {t('trigger')}
                </button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
                <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-[448px] bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl p-6 z-50 animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-6">
                        <Dialog.Title className="text-lg font-bold text-white font-exo2 uppercase tracking-wide flex items-center gap-2">
                            <Globe size={18} className="text-primary" />
                            {t('title')}
                        </Dialog.Title>
                        <Dialog.Close className="text-textMuted hover:text-white transition-colors">
                            <X size={20} />
                        </Dialog.Close>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Language Code */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-textMuted tracking-wider">{t('languageCode')}</label>
                                <div className="relative">
                                    <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
                                    <input
                                        type="text"
                                        value={languageCode}
                                        onChange={(e) => setLanguageCode(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-textMuted/30 focus:border-primary outline-none transition-colors font-mono uppercase"
                                        placeholder="EN"
                                        maxLength={3}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Language Name */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-textMuted tracking-wider">{t('languageName')}</label>
                                <input
                                    type="text"
                                    value={languageName}
                                    onChange={(e) => setLanguageName(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white placeholder:text-textMuted/30 focus:border-primary outline-none transition-colors"
                                    placeholder="English"
                                    required
                                />
                            </div>
                        </div>

                        {/* Author */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-textMuted tracking-wider">{t('authorName')}</label>
                            <div className="relative">
                                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
                                <input
                                    type="text"
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-textMuted/30 focus:border-primary outline-none transition-colors"
                                    placeholder={t('authorPlaceholder')}
                                    required
                                />
                            </div>
                        </div>

                        {/* Link */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-textMuted tracking-wider">{t('downloadLink')}</label>
                            <div className="relative">
                                <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
                                <input
                                    type="url"
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-textMuted/30 focus:border-primary outline-none transition-colors"
                                    placeholder={t('linkPlaceholder')}
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <Dialog.Close asChild>
                                <button type="button" className="px-4 py-2 text-xs font-bold text-textMuted hover:text-white border border-white/10 rounded-lg transition-colors hover:bg-white/5 uppercase tracking-wider">
                                    {t('cancel')}
                                </button>
                            </Dialog.Close>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-2 text-xs font-bold text-white bg-primary hover:bg-red-600 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-red-900/20 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    t('sending')
                                ) : (
                                    <>
                                        <Send size={14} /> {t('submit')}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
