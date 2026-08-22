import path from "node:path";
import { listPhotoGroupFolders, listPhotosInFolder } from "@/lib/photoFolder";
import type { PhotoGroup } from "@/types/photoGallery";

const PHOTOS_DIR = path.join(process.cwd(), "public", "images", "japan-pro-mahjong");

/**
 * public/images/japan-pro-mahjong/<開催回>/ 配下のフォルダとファイルを自動で読み込みます
 * （フォルダ名は「第1回」「第2回」のように開催回で分けてください）。
 * 写真を追加・削除する場合は、このファイルではなくフォルダの中身を編集してください。
 * （ビルド時に実行されるので、フォルダ変更後は再ビルドが必要です）
 */
export function getJapanProMahjongPhotoGroups(): PhotoGroup[] {
    return listPhotoGroupFolders(PHOTOS_DIR).map((eventName) => ({
        label: eventName,
        photos: listPhotosInFolder(
            path.join(PHOTOS_DIR, eventName),
            `/images/japan-pro-mahjong/${eventName}`,
            `日本プロ麻雀協会 広島支部 ${eventName}の様子`
        ),
    }));
}
