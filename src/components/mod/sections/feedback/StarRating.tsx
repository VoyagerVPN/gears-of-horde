"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
    value: number;
    onChange: (value: number) => void;
    maxStars?: number;
}

export default function StarRating({ value, onChange, maxStars = 5 }: StarRatingProps) {
    const [hoverValue, setHoverValue] = useState(0);
    const displayValue = hoverValue || value;

    return (
        <div className="flex gap-1" onMouseLeave={() => setHoverValue(0)}>
            {Array.from({ length: maxStars }).map((_, i) => {
                const starIndex = i + 1;
                const isFull = displayValue >= starIndex;
                const isHalf = displayValue === starIndex - 0.5;

                return (
                    <div key={starIndex} className="relative transition-transform hover:scale-110 w-6 h-6">
                        <Star size={24} className="text-white opacity-20 absolute top-0 left-0" />
                        <div
                            className="absolute top-0 left-0 overflow-hidden transition-all"
                            style={{ width: isFull ? '100%' : isHalf ? '50%' : '0%' }}
                        >
                            <Star size={24} fill="currentColor" className="text-yellow-500" />
                        </div>
                        <div
                            className="absolute top-0 left-0 w-1/2 h-full cursor-pointer z-20"
                            onMouseEnter={() => setHoverValue(starIndex - 0.5)}
                            onClick={() => onChange(starIndex - 0.5 === value ? 0 : starIndex - 0.5)}
                        />
                        <div
                            className="absolute top-0 right-0 w-1/2 h-full cursor-pointer z-20"
                            onMouseEnter={() => setHoverValue(starIndex)}
                            onClick={() => onChange(starIndex === value ? 0 : starIndex)}
                        />
                    </div>
                );
            })}
        </div>
    );
}
