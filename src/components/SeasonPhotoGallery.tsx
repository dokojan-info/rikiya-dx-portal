"use client";

import { useMemo, useState } from "react";
import PhotoSlideshow from "@/components/PhotoSlideshow";
import type { SeasonPhotos } from "@/types/westTeamLeaguePhotos";

type SeasonPhotoGalleryProps = {
    seasons: SeasonPhotos[];
};

export default function SeasonPhotoGallery({ seasons }: SeasonPhotoGalleryProps) {
    // 写真が1枚もないシーズンはタブに出さない
    const availableSeasons = useMemo(
        () => seasons.filter((s) => s.photos.length > 0),
        [seasons]
    );

    const [activeSeason, setActiveSeason] = useState(availableSeasons[0]?.season);

    if (availableSeasons.length === 0) {
        return null;
    }

    const current =
        availableSeasons.find((s) => s.season === activeSeason) ?? availableSeasons[0];

    return (
        <div>
            {/* シーズン切り替えタブ */}
            <div className="flex flex-wrap gap-2 mb-6">
                {availableSeasons.map((s) => (
                    <button
                        key={s.season}
                        type="button"
                        onClick={() => setActiveSeason(s.season)}
                        aria-pressed={s.season === current.season}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-colors border ${
                            s.season === current.season
                                ? "bg-primary text-white border-primary shadow-sm"
                                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                    >
                        {s.season}
                    </button>
                ))}
            </div>

            {/* 選択中シーズンのスライドショー */}
            <PhotoSlideshow key={current.season} photos={current.photos} />
        </div>
    );
}
