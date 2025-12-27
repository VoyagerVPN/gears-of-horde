'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Loader2, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { PutBlobResult } from '@vercel/blob';
import { useToast } from '@/components/ui/Toast';

const MAX_FILE_SIZE = 4.5 * 1024 * 1024; // 4.5MB
const MAX_SCREENSHOTS = 10;

interface ScreenshotDropzoneProps {
    currentCount: number; // Current number of screenshots
    onUploadComplete: (urls: string[]) => void;
    invalid?: boolean;
    onClear?: () => void;
}

// Local compressToWebP removed in favor of shared utility
import { compressImage } from '@/lib/imageCompression';
import { cn } from '@/lib/utils';


export default function ScreenshotDropzone({ currentCount, onUploadComplete, invalid, onClear }: ScreenshotDropzoneProps) {
    const t = useTranslations('Common');
    const { showToast } = useToast();
    const inputRef = useRef<HTMLInputElement>(null);

    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const remainingSlots = MAX_SCREENSHOTS - currentCount;

    const uploadFiles = useCallback(async (files: File[]) => {
        // Check if we have room for more screenshots
        if (remainingSlots <= 0) {
            showToast(t('maxScreenshotsReached'), 'error');
            return;
        }

        // Limit files to remaining slots
        const filesToUpload = files.slice(0, remainingSlots);
        if (filesToUpload.length < files.length) {
            showToast(t('someShotsSkipped', { count: files.length - filesToUpload.length }), 'warning');
        }

        // Validate all files
        const validFiles = filesToUpload.filter(file => {
            if (!file.type.startsWith('image/')) {
                showToast(`${file.name}: ${t('invalidFileType')}`, 'error');
                return false;
            }
            if (file.size > MAX_FILE_SIZE) {
                showToast(`${file.name}: ${t('fileTooLarge')}`, 'error');
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        setIsUploading(true);
        setUploadProgress(0);

        const uploadedUrls: string[] = [];

        try {
            for (let i = 0; i < validFiles.length; i++) {
                const file = validFiles[i];

                // Compress to WebP before uploading
                const compressedBlob = await compressImage(file, { backgroundColor: '#191919' });
                const filename = `screenshot-${Date.now()}-${i}.webp`;

                const response = await fetch(`/api/upload?filename=${filename}&folder=screenshots`, {
                    method: 'POST',
                    body: compressedBlob,
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Upload failed');
                }

                const blob = await response.json() as PutBlobResult;
                uploadedUrls.push(blob.url);

                setUploadProgress(Math.round(((i + 1) / validFiles.length) * 100));
            }

            onUploadComplete(uploadedUrls);
            showToast(t('screenshotsUploaded', { count: uploadedUrls.length }), 'success');
        } catch (error) {
            console.error('Screenshot upload error:', error);
            showToast(t('uploadFailed'), 'error');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    }, [remainingSlots, onUploadComplete, t, showToast]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            uploadFiles(files);
        }
    }, [uploadFiles]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            uploadFiles(files);
        }
        // Reset input
        e.target.value = '';
    }, [uploadFiles]);

    // Don't show dropzone if max reached
    if (remainingSlots <= 0) {
        return null;
    }

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleInputChange}
                className="hidden"
                multiple
            />

            <div
                onClick={() => {
                    if (!isUploading) {
                        inputRef.current?.click();
                        onClear?.();
                    }
                }}
                onDrop={(e) => {
                    handleDrop(e);
                    onClear?.();
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={cn(
                    "flex-shrink-0 w-48 aspect-[16/9] border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer transition-all group",
                    isDragging ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-primary/50 hover:bg-primary/5',
                    invalid ? "!border-red-500/50 shadow-[0_0_10px_-2px_rgba(239,68,68,0.2)]" : ""
                )}
            >
                {isUploading ? (
                    <>
                        <Loader2 size={24} className="text-primary animate-spin pointer-events-none" />
                        <span className="text-xs text-primary font-bold uppercase tracking-wider font-exo2 pointer-events-none">
                            {uploadProgress}%
                        </span>
                    </>
                ) : (
                    <>
                        <div className="relative w-6 h-6 mb-1 pointer-events-none">
                            <Plus
                                size={24}
                                className={cn(
                                    "absolute inset-0 transition-all duration-150 pointer-events-none",
                                    isDragging ? "opacity-0 scale-50 rotate-90" : "text-textMuted opacity-40 group-hover:opacity-100 group-hover:text-primary scale-100 rotate-0"
                                )}
                            />
                            <Upload
                                size={24}
                                className={cn(
                                    "absolute inset-0 transition-all duration-150 pointer-events-none text-primary",
                                    isDragging ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-50 -translate-y-2"
                                )}
                            />
                        </div>
                        <span className="text-xs text-textMuted group-hover:text-white transition-colors uppercase font-bold font-exo2 pointer-events-none">
                            {isDragging ? t('dropHere') : t('add')}
                        </span>
                        <span className="text-[10px] text-white/30 font-mono pointer-events-none">
                            {currentCount}/{MAX_SCREENSHOTS}
                        </span>
                    </>
                )}
            </div>
        </>
    );
}

