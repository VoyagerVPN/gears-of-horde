'use client';

import { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { X, ZoomIn, ZoomOut, Check, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ImageCropModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageSrc: string;
    aspect: number;
    aspectLabel?: string;
    onCropComplete: (croppedAreaPixels: Area) => void;
}

export default function ImageCropModal({
    isOpen,
    onClose,
    imageSrc,
    aspect,
    aspectLabel,
    onCropComplete
}: ImageCropModalProps) {
    const t = useTranslations('Common');
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const handleCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleConfirm = () => {
        if (croppedAreaPixels) {
            onCropComplete(croppedAreaPixels);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-[#1a1a1a] rounded-2xl border border-white/10 shadow-2xl w-full max-w-4xl mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-white font-exo2 uppercase tracking-wide">
                            {t('cropImage')}
                        </h2>
                        {aspectLabel && (
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg border border-white/10">
                                <AlertCircle size={14} className="text-amber-400" />
                                <span className="text-xs text-textMuted font-mono">{aspectLabel}</span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-textMuted hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Cropper Area */}
                <div className="relative h-[400px] bg-black">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        onCropChange={setCrop}
                        onCropComplete={handleCropComplete}
                        onZoomChange={setZoom}
                        showGrid={true}
                        style={{
                            containerStyle: {
                                backgroundColor: '#0a0a0a'
                            },
                            cropAreaStyle: {
                                border: '2px solid rgba(255, 255, 255, 0.6)',
                                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)'
                            }
                        }}
                    />
                </div>

                {/* Controls */}
                <div className="px-6 py-4 border-t border-white/10 bg-black/20">
                    <div className="flex items-center justify-between">
                        {/* Zoom Control */}
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-textMuted uppercase tracking-wider font-exo2">
                                {t('zoom')}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setZoom(Math.max(1, zoom - 0.1))}
                                    className="p-1.5 text-textMuted hover:text-white hover:bg-white/5 rounded transition-colors"
                                    disabled={zoom <= 1}
                                >
                                    <ZoomOut size={18} />
                                </button>
                                <input
                                    type="range"
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    value={zoom}
                                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                                    className="w-32 h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                                />
                                <button
                                    onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                                    className="p-1.5 text-textMuted hover:text-white hover:bg-white/5 rounded transition-colors"
                                    disabled={zoom >= 3}
                                >
                                    <ZoomIn size={18} />
                                </button>
                                <span className="text-xs text-textMuted font-mono w-12 text-center">
                                    {Math.round(zoom * 100)}%
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-xs font-bold text-textMuted hover:text-white border border-white/10 rounded-lg transition-colors hover:bg-white/5 uppercase tracking-wider"
                            >
                                {t('cancel')}
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-red-600 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-red-900/20 uppercase tracking-wider"
                            >
                                <Check size={16} />
                                {t('confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
