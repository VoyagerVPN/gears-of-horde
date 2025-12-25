"use client";

import { useEffect, useCallback, useState, MouseEvent } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface ImageViewerProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

export default function ImageViewer({ images, initialIndex, onClose }: ImageViewerProps) {
  // Внутреннее состояние для текущего индекса
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Навигация
  const handleNext = useCallback((e?: MouseEvent) => {
    e?.stopPropagation(); // Предотвращаем закрытие при клике на стрелку
    setCurrentIndex((prev) => (prev + 1) % images.length); // Зацикливание вперед
  }, [images.length]);

  const handlePrev = useCallback((e?: MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length); // Зацикливание назад
  }, [images.length]);

  // Клавиатура
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowRight") handleNext();
    if (e.key === "ArrowLeft") handlePrev();
  }, [onClose, handleNext, handlePrev]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [handleKeyDown]);

  // Закрытие по клику на фон (backdrop)
  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const currentImageId = images[currentIndex];

  // Общий стиль для кнопок навигации (Bento-style)
  const navButtonStyle = "p-3 bg-surface border border-white/10 rounded-xl text-white/70 hover:text-white hover:border-primary/50 hover:bg-white/5 transition-all active:scale-95";

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200 cursor-zoom-out"
    >

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 p-2 bg-surface border border-white/10 rounded-lg text-white/70 hover:text-white hover:border-red-500/50 hover:bg-red-500/10 transition-all"
      >
        <X size={24} />
      </button>

      {/* Main Content Area */}
      <div className="relative w-full h-full max-w-7xl max-h-[90vh] mx-4 flex items-center justify-between pointer-events-none">

        {/* Prev Arrow */}
        {images.length > 1 && (
          <div className="pointer-events-auto px-4">
            <button onClick={handlePrev} className={navButtonStyle}>
              <ChevronLeft size={32} />
            </button>
          </div>
        )}

        {/* Image Container */}
        <div
          onClick={(e) => e.stopPropagation()} // Предотвращаем закрытие при клике на само изображение
          className="flex-1 h-full flex items-center justify-center p-4 pointer-events-auto cursor-default"
        >
          <div className="relative max-w-full max-h-full aspect-video bg-zinc-900 rounded-lg overflow-hidden border border-white/10 shadow-2xl">
            <Image
              src={currentImageId}
              alt={`Screenshot ${currentIndex + 1}`}
              fill
              className="object-contain"
              unoptimized
            />
            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 backdrop-blur rounded-full text-white text-sm font-exo2 border border-white/10">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </div>

        {/* Next Arrow */}
        {images.length > 1 && (
          <div className="pointer-events-auto px-4">
            <button onClick={handleNext} className={navButtonStyle}>
              <ChevronRight size={32} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}