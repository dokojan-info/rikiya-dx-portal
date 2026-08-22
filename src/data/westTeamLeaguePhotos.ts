import fs from "node:fs";
import path from "node:path";
import type { SlidePhoto } from "@/components/PhotoSlideshow";
import type { SeasonPhotos } from "@/types/westTeamLeaguePhotos";

const PHOTOS_DIR = path.join(process.cwd(), "public", "images", "west-team-league");
const IMAGE_EXTENSIONS = new Set([".webp", ".jpg", ".jpeg", ".png", ".avif"]);

// タブに表示する優先順（新しいシーズンから）。
// ここに無いフォルダが見つかった場合は、新しい順と推測して末尾に追加されます。
const SEASON_ORDER = ["2025-2026", "2024-2025", "2023-2024", "2022-2023", "2021-2022"];

function listSeasonFolders(): string[] {
    if (!fs.existsSync(PHOTOS_DIR)) return [];

    const found = fs
        .readdirSync(PHOTOS_DIR, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name);

    const known = SEASON_ORDER.filter((season) => found.includes(season));
    const unknown = found
        .filter((season) => !SEASON_ORDER.includes(season))
        .sort((a, b) => b.localeCompare(a, "ja", { numeric: true }));

    return [...known, ...unknown];
}

function listPhotosInSeason(season: string): SlidePhoto[] {
    const dir = path.join(PHOTOS_DIR, season);
    if (!fs.existsSync(dir)) return [];

    const files = fs
        .readdirSync(dir)
        .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
        .sort((a, b) => a.localeCompare(b, "ja", { numeric: true }));

    return files.map((file, i) => {
        const rawLabel = path.basename(file, path.extname(file)).replace(/[-_]/g, " ").trim();
        // タイムスタンプ等の意味を持たないファイル名（数字のみ）は汎用altにフォールバック
        const isMeaningfulLabel = rawLabel !== "" && !/^\d+$/.test(rawLabel);

        return {
            src: `/images/west-team-league/${season}/${file}`,
            alt: isMeaningfulLabel
                ? `西日本TEAMリーグ 広島エリア ${season} ${rawLabel}`
                : `西日本TEAMリーグ 広島エリア ${season}の様子 (${i + 1}枚目)`,
        };
    });
}

/**
 * public/images/west-team-league/<シーズン名>/ 配下のフォルダとファイルを自動で読み込みます。
 * 写真を追加・削除する場合は、このファイルではなくフォルダの中身を編集してください。
 * （ビルド時に実行されるので、フォルダ変更後は再ビルドが必要です）
 */
export function getWestTeamLeaguePhotosBySeason(): SeasonPhotos[] {
    return listSeasonFolders().map((season) => ({
        season,
        photos: listPhotosInSeason(season),
    }));
}
