"use client";

import { useMemo, useState } from "react";
import PhotoSlideshow from "@/components/PhotoSlideshow";
import type { PhotoGroup } from "@/types/photoGallery";

type GroupedPhotoGalleryProps = {
    groups: PhotoGroup[];
};

export default function GroupedPhotoGallery({ groups }: GroupedPhotoGalleryProps) {
    // 写真が1枚もないグループはタブに出さない
    const availableGroups = useMemo(() => groups.filter((g) => g.photos.length > 0), [groups]);

    const [activeLabel, setActiveLabel] = useState(availableGroups[0]?.label);

    if (availableGroups.length === 0) {
        return null;
    }

    const current = availableGroups.find((g) => g.label === activeLabel) ?? availableGroups[0];

    return (
        <div>
            {/* グループ切り替えタブ */}
            <div className="flex flex-wrap gap-2 mb-6">
                {availableGroups.map((g) => (
                    <button
                        key={g.label}
                        type="button"
                        onClick={() => setActiveLabel(g.label)}
                        aria-pressed={g.label === current.label}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-colors border ${
                            g.label === current.label
                                ? "bg-primary text-white border-primary shadow-sm"
                                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                    >
                        {g.label}
                    </button>
                ))}
            </div>

            {/* 選択中グループのスライドショー */}
            <PhotoSlideshow key={current.label} photos={current.photos} />
        </div>
    );
}
