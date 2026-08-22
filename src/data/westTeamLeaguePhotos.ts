import path from "node:path";
import { listPhotoGroupFolders, listPhotosInFolder } from "@/lib/photoFolder";
import type { PhotoGroup } from "@/types/photoGallery";

const PHOTOS_DIR = path.join(process.cwd(), "public", "images", "west-team-league");

// タブに表示する優先順（新しいシーズンから）。
// ここに無いフォルダが見つかった場合は、新しい順と推測して末尾に追加されます。
const SEASON_ORDER = ["2025-2026", "2024-2025", "2023-2024", "2022-2023", "2021-2022"];

/**
 * public/images/west-team-league/<シーズン名>/ 配下のフォルダとファイルを自動で読み込みます。
 * 写真を追加・削除する場合は、このファイルではなくフォルダの中身を編集してください。
 * （ビルド時に実行されるので、フォルダ変更後は再ビルドが必要です）
 */
export function getWestTeamLeaguePhotosBySeason(): PhotoGroup[] {
    return listPhotoGroupFolders(PHOTOS_DIR, SEASON_ORDER).map((season) => ({
        label: season,
        photos: listPhotosInFolder(
            path.join(PHOTOS_DIR, season),
            `/images/west-team-league/${season}`,
            `西日本TEAMリーグ 広島エリア ${season}の様子`
        ),
    }));
}
