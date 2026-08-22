"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type SlidePhoto = {
    src: string;
    alt: string;
    caption?: string;
};

type PhotoSlideshowProps = {
    photos: SlidePhoto[];
    /** 自動再生の間隔（ミリ秒）。0以下で自動再生オフ */
    intervalMs?: number;
};

export default function PhotoSlideshow({ photos, intervalMs = 4000 }: PhotoSlideshowProps) {
    const [index, setIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const goTo = useCallback(
        (i: number) => {
            if (photos.length === 0) return;
            setIndex(((i % photos.length) + photos.length) % photos.length);
        },
        [photos.length]
    );

    const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);
    const goNext = useCallback(() => goTo(index + 1), [goTo, index]);

    // 自動再生
    useEffect(() => {
        if (intervalMs <= 0 || isPaused || photos.length <= 1) return;
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % photos.length);
        }, intervalMs);
        return () => clearInterval(timer);
    }, [intervalMs, isPaused, photos.length]);

    if (photos.length === 0) {
        return null;
    }

    return (
        <div
            className="relative w-full aspect-[4/3] sm:aspect-[16/9] rounded-3xl overflow-hidden bg-slate-100 shadow-sm border border-slate-100 select-none"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {photos.map((photo, i) => (
                <div
                    key={photo.src}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                        i === index ? "opacity-100 z-10" : "opacity-0 z-0"
                    }`}
                    aria-hidden={i !== index}
                >
                    <Image
                        src={photo.src}
                        alt={photo.alt}
                        fill
                        sizes="(max-width: 768px) 100vw, 768px"
                        className="object-cover"
                        priority={i === 0}
                    />
                    {photo.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent text-white text-sm sm:text-base font-medium px-4 sm:px-6 py-4 sm:py-6">
                            {photo.caption}
                        </div>
                    )}
                </div>
            ))}

            {photos.length > 1 && (
                <>
                    {/* 前へ / 次へ */}
                    <button
                        type="button"
                        onClick={goPrev}
                        aria-label="前の写真"
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-slate-700 rounded-full p-2 shadow-sm transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        type="button"
                        onClick={goNext}
                        aria-label="次の写真"
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-slate-700 rounded-full p-2 shadow-sm transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* ドットインジケーター */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                        {photos.map((photo, i) => (
                            <button
                                key={photo.src}
                                type="button"
                                onClick={() => goTo(i)}
                                aria-label={`${i + 1}枚目の写真を表示`}
                                aria-current={i === index}
                                className={`h-2 rounded-full transition-all ${
                                    i === index ? "w-6 bg-white" : "w-2 bg-white/60 hover:bg-white/80"
                                }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
