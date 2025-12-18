"use client";

import { useState } from "react";
import { Film, Image as ImageIcon, Youtube } from "lucide-react";
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
          <div className="aspect-video bg-black/40 rounded-xl border border-white/5 flex flex-col items-center justify-center group cursor-pointer hover:border-primary/50 transition-colors relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Youtube size={48} className="text-white/20 group-hover:text-primary transition-colors mb-2" />
            <span className="text-white/30 font-bold uppercase tracking-widest group-hover:text-white transition-colors font-exo2">{t('watchTrailer')}</span>
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
          <div className="aspect-video bg-black/40 rounded-xl border border-white/5 flex flex-col items-center justify-center group cursor-pointer hover:border-primary/50 transition-colors relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="text-4xl font-black text-white/10 group-hover:text-white/20 transition-colors uppercase font-exo2">{t('review')}</div>
          </div>
        )}
      </div>

      {/* Screenshots Section */}
      <h3 className="text-sm font-bold text-textMuted uppercase tracking-wider mb-3 font-exo2 flex items-center gap-2">
        <ImageIcon size={16} className="text-primary" /> {t('screenshots')}
      </h3>
      <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-primary/50">
        {screenshots.map((url, idx) => (
          <div
            key={idx}
            onClick={() => openLightbox(idx)}
            className="flex-shrink-0 aspect-[16/9] w-64 bg-zinc-900 rounded-lg border border-white/5 relative overflow-hidden group cursor-zoom-in hover:border-primary/50 transition-all"
          >
            {url ? (
              <img src={url} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/10 text-xs font-bold uppercase group-hover:text-white/30 transition-colors">
                {t('clickToExpandScreen')} {idx + 1}
              </div>
            )}
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
