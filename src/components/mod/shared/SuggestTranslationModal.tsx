"use client";

import { useState } from "react";
import { Globe, Link as LinkIcon, User, Send } from "lucide-react";
import { submitTranslationSuggestion } from "@/app/actions/translation-actions";
import { useTranslations } from 'next-intl';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
    DialogBody,
    DialogFooter,
    DialogButton,
    DialogField,
    dialogInputClass,
} from "@/shared/ui";
import { useToast } from "@/shared/ui";

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
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!author || !link || !languageCode || !languageName) return;

        setIsSubmitting(true);

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
            showToast(t('successMessage'), 'success');
        }, 800);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="text-[10px] text-textMuted/40 hover:text-textMuted transition-colors underline decoration-dashed underline-offset-4 decoration-white/10 hover:decoration-white/30">
                    {t('trigger')}
                </button>
            </DialogTrigger>

            <DialogContent size="md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Globe size={18} className="text-primary" />
                        {t('title')}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <DialogBody className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Language Code */}
                            <DialogField label={t('languageCode')} smallLabel required>
                                <div className="relative">
                                    <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
                                    <input
                                        id="language-code"
                                        name="languageCode"
                                        type="text"
                                        value={languageCode}
                                        onChange={(e) => setLanguageCode(e.target.value)}
                                        className={`${dialogInputClass} pl-9 font-mono uppercase`}
                                        placeholder="EN"
                                        maxLength={3}
                                        required
                                    />
                                </div>
                            </DialogField>

                            {/* Language Name */}
                            <DialogField label={t('languageName')} smallLabel required>
                                <input
                                    id="language-name"
                                    name="languageName"
                                    type="text"
                                    value={languageName}
                                    onChange={(e) => setLanguageName(e.target.value)}
                                    className={dialogInputClass}
                                    placeholder="English"
                                    required
                                />
                            </DialogField>
                        </div>

                        {/* Author */}
                        <DialogField label={t('authorName')} smallLabel required>
                            <div className="relative">
                                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
                                <input
                                    id="author-name"
                                    name="author"
                                    type="text"
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                    className={`${dialogInputClass} pl-9`}
                                    placeholder={t('authorPlaceholder')}
                                    required
                                />
                            </div>
                        </DialogField>

                        {/* Link */}
                        <DialogField label={t('downloadLink')} smallLabel required>
                            <div className="relative">
                                <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
                                <input
                                    id="download-link"
                                    name="link"
                                    type="url"
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    className={`${dialogInputClass} pl-9`}
                                    placeholder={t('linkPlaceholder')}
                                    required
                                />
                            </div>
                        </DialogField>
                    </DialogBody>

                    <DialogFooter>
                        <DialogClose asChild>
                            <DialogButton type="button" variant="secondary">
                                {t('cancel')}
                            </DialogButton>
                        </DialogClose>
                        <DialogButton type="submit" variant="primary" loading={isSubmitting}>
                            {isSubmitting ? t('sending') : (
                                <>
                                    <Send size={14} />
                                    {t('submit')}
                                </>
                            )}
                        </DialogButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
