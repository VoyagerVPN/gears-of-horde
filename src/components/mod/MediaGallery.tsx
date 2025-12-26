"use client";

import { useState } from "react";
import { Film, Image as ImageIcon, Youtube } from "lucide-react";
import Image from "next/image";
import ImageViewer from "@/components/ImageViewer";
import { useTranslations } from 'next-intl';

interface MediaGalleryProps {
  screenshots: string[];
  videos?: {
    trailer?: string;
    review?: string;
  };
}

// Helper function to convert YouTube URL to embed URL
function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;

  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }

  return null;
}

export default function MediaGallery({ screenshots, videos }: MediaGalleryProps) {
  const t = useTranslations('Common');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const trailerEmbedUrl = getYouTubeEmbedUrl(videos?.trailer || '');
  const reviewEmbedUrl = getYouTubeEmbedUrl(videos?.review || '');

  return (
    <section>
      {/* Videos Section */}
      <h2 className="text-lg font-bold text-white mb-4 border-b border-white/5 pb-2 font-exo2 uppercase tracking-wide flex items-center gap-2">
        <Film size={20} className="text-primary" /> {t('media')}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Trailer */}
        {trailerEmbedUrl ? (
          <div className="aspect-video rounded-xl overflow-hidden border border-white/5">
            <iframe
              src={trailerEmbedUrl}
              title="Mod Trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        ) : (
          <div className="aspect-video bg-black/40 rounded-xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
            <Youtube size={48} className="text-white opacity-10 mb-2" />
            <span className="text-white/30 text-sm font-medium">{t('noTrailerAvailable')}</span>
          </div>
        )}

        {/* Review */}
        {reviewEmbedUrl ? (
          <div className="aspect-video rounded-xl overflow-hidden border border-white/5">
            <iframe
              src={reviewEmbedUrl}
              title="Mod Review"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        ) : (
          <div className="aspect-video bg-black/40 rounded-xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
            <Film size={48} className="text-white opacity-10 mb-2" />
            <span className="text-white/30 text-sm font-medium">{t('noReviewAvailable')}</span>
          </div>
        )}
      </div>

      {/* Screenshots Section */}
      <h3 className="text-sm font-bold text-textMuted uppercase tracking-wider mb-3 font-exo2 flex items-center gap-2">
        <ImageIcon size={16} className="text-primary" /> {t('screenshots')}
      </h3>
      <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
        {screenshots.filter(url => url.trim() !== '').map((url, idx) => (
          <div
            key={idx}
            onClick={() => openLightbox(idx)}
            className="flex-shrink-0 aspect-[16/9] w-64 bg-zinc-900 rounded-lg border border-white/5 relative overflow-hidden group cursor-zoom-in hover:border-primary/50 transition-all"
          >
            <Image
              src={url}
              alt={`Screenshot ${idx + 1}`}
              fill
              className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              sizes="256px"
            />
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <ImageViewer
          images={screenshots}
          initialIndex={currentImageIndex}
          onClose={closeLightbox}
        />
      )}
    </section>
  );
}
