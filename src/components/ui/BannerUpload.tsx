'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Loader2, ImageIcon, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import type { Area } from 'react-easy-crop';
import type { PutBlobResult } from '@vercel/blob';
import ImageCropModal from './ImageCropModal';
import { getCroppedImg, fileToDataUrl } from '@/lib/cropImage';
import { useToast } from '@/components/ui/Toast';

// Banner aspect ratio: 1000:219
const BANNER_ASPECT = 1000 / 219;
const MAX_FILE_SIZE = 4.5 * 1024 * 1024; // 4.5MB

interface BannerUploadProps {
    currentBannerUrl?: string;
    onBannerChange: (url: string) => void;
}

export default function BannerUpload({ currentBannerUrl, onBannerChange }: BannerUploadProps) {
    const t = useTranslations('Common');
    const { showToast } = useToast();
    const inputRef = useRef<HTMLInputElement>(null);

    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const handleFileSelect = useCallback(async (file: File) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showToast(t('invalidFileType'), 'error');
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            showToast(t('fileTooLarge'), 'error');
            return;
        }

        // Convert to data URL for cropper
        const dataUrl = await fileToDataUrl(file);
        setSelectedImage(dataUrl);
        setCropModalOpen(true);
    }, [t, showToast]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    }, [handleFileSelect]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
        // Reset input so same file can be selected again
        e.target.value = '';
    }, [handleFileSelect]);

    const handleCropComplete = useCallback(async (croppedAreaPixels: Area) => {
        if (!selectedImage) return;

        setCropModalOpen(false);
        setIsUploading(true);

        try {
            // Crop the image client-side
            const croppedBlob = await getCroppedImg(selectedImage, croppedAreaPixels, 1000, 219);

            // Upload to Vercel Blob
            const filename = `banner-${Date.now()}.webp`;
            const response = await fetch(`/api/upload?filename=${filename}&folder=banners`, {
                method: 'POST',
                body: croppedBlob,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Upload failed');
            }

            const blob = await response.json() as PutBlobResult;
            onBannerChange(blob.url);
            showToast(t('bannerUploaded'), 'success');
        } catch (error) {
            console.error('Banner upload error:', error);
            showToast(t('uploadFailed'), 'error');
        } finally {
            setIsUploading(false);
            setSelectedImage(null);
        }
    }, [selectedImage, onBannerChange, t, showToast]);

    const handleRemoveBanner = () => {
        onBannerChange('');
    };

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleInputChange}
                className="hidden"
            />

            {/* Banner Display / Upload Area */}
            <div
                className={`w-full aspect-[1000/219] bg-zinc-900 rounded-xl overflow-hidden relative group cursor-pointer transition-all ${isDragging
                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-zinc-950'
                    : 'border border-white/5 hover:border-primary/30'
                    }`}
                onClick={() => !isUploading && inputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                {/* Current Banner Preview */}
                {currentBannerUrl ? (
                    <Image
                        src={currentBannerUrl}
                        alt="Banner preview"
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1200px"
                        priority
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20">
                        <ImageIcon size={48} className="mb-2" />
                        <span className="text-sm font-bold tracking-[0.3em] uppercase font-exo2">
                            {t('modBannerImage')}
                        </span>
                    </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Upload Overlay */}
                {!isUploading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload size={32} className="text-white mb-2" />
                        <span className="text-sm font-bold text-white uppercase tracking-wider font-exo2">
                            {t('uploadBanner')}
                        </span>
                        <span className="text-xs text-white/50 mt-1">
                            {t('dropOrClick')}
                        </span>
                        <span className="text-xs text-white/30 mt-2 font-mono">
                            1000 × 219 px
                        </span>
                    </div>
                )}

                {/* Loading Overlay */}
                {isUploading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
                        <Loader2 size={32} className="text-primary animate-spin mb-2" />
                        <span className="text-sm font-bold text-white uppercase tracking-wider font-exo2">
                            {t('uploading')}
                        </span>
                    </div>
                )}

                {/* Remove Button */}
                {currentBannerUrl && !isUploading && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveBanner();
                        }}
                        className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg text-white/60 hover:text-red-400 hover:bg-red-500/20 hover:border-red-400/50 opacity-0 group-hover:opacity-100 transition-all"
                        title={t('remove')}
                    >
                        <Trash2 size={18} />
                    </button>
                )}
            </div>

            {/* Crop Modal */}
            <ImageCropModal
                isOpen={cropModalOpen}
                onClose={() => {
                    setCropModalOpen(false);
                    setSelectedImage(null);
                }}
                imageSrc={selectedImage || ''}
                aspect={BANNER_ASPECT}
                aspectLabel="1000 × 219"
                onCropComplete={handleCropComplete}
            />
        </>
    );
}
