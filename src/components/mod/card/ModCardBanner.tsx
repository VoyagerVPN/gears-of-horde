"use client";

import Image from "next/image";

interface ModCardBannerProps {
    bannerUrl?: string;
    title: string;
}

export default function ModCardBanner({ bannerUrl, title }: ModCardBannerProps) {
    return (
        <div
            className="bg-zinc-900 relative overflow-hidden shrink-0"
            style={{ aspectRatio: '1000 / 219' }}
        >
            {bannerUrl ? (
                <Image
                    src={bannerUrl}
                    alt={title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 384px"
                />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
            )}
        </div>
    );
}
