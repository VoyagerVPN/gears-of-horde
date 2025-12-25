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
}

// Local compressToWebP removed in favor of shared utility
import { compressImage } from '@/lib/imageCompression';

export default function ScreenshotDropzone({ currentCount, onUploadComplete }: ScreenshotDropzoneProps) {
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
                onClick={() => !isUploading && inputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`flex-shrink-0 w-48 aspect-[16/9] border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer transition-all group ${isDragging
                    ? 'border-primary bg-primary/10'
                    : 'border-white/10 hover:border-primary/50 hover:bg-primary/5'
                    }`}
            >
                {isUploading ? (
                    <>
                        <Loader2 size={24} className="text-primary animate-spin" />
                        <span className="text-xs text-primary font-bold uppercase tracking-wider font-exo2">
                            {uploadProgress}%
                        </span>
                    </>
                ) : (
                    <>
                        {isDragging ? (
                            <Upload size={24} className="text-primary transition-colors" />
                        ) : (
                            <Plus size={24} className="text-white/20 group-hover:text-primary transition-colors" />
                        )}
                        <span className="text-xs text-textMuted group-hover:text-white transition-colors uppercase font-bold font-exo2">
                            {isDragging ? t('dropHere') : t('add')}
                        </span>
                        <span className="text-[10px] text-white/30 font-mono">
                            {remainingSlots}/{MAX_SCREENSHOTS}
                        </span>
                    </>
                )}
            </div>
        </>
    );
}

