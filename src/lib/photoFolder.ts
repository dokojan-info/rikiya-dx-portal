import fs from "node:fs";
import path from "node:path";
import type { SlidePhoto } from "@/components/PhotoSlideshow";

const IMAGE_EXTENSIONS = new Set([".webp", ".jpg", ".jpeg", ".png", ".avif"]);

/**
 * 指定フォルダ直下のサブフォルダ名（グループ名）を一覧します。
 * `preferredOrder` に含まれる名前はその順番を優先し、含まれないフォルダは
 * 数値を考慮した降順（新しい・大きい番号が先）で末尾に並べます。
 */
export function listPhotoGroupFolders(baseDir: string, preferredOrder: string[] = []): string[] {
    if (!fs.existsSync(baseDir)) return [];

    const found = fs
        .readdirSync(baseDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name);

    const known = preferredOrder.filter((name) => found.includes(name));
    const unknown = found
        .filter((name) => !preferredOrder.includes(name))
        .sort((a, b) => b.localeCompare(a, "ja", { numeric: true }));

    return [...known, ...unknown];
}

/**
 * 指定フォルダ内の画像ファイルを読み込み、SlidePhoto[]に変換します（ファイル名の昇順ソート）。
 * ファイル名が意味を持たない場合（空、またはタイムスタンプ等の数字のみ）は
 * 連番つきの汎用altにフォールバックします。
 *
 * @param absoluteDir 画像を探すフォルダの絶対パス
 * @param srcPrefix   ブラウザからアクセスするURLのプレフィックス（例: "/images/foo"）
 * @param altPrefix   altテキストの先頭に付ける文言（例: "日本プロ麻雀協会 プロ活動"）
 */
export function listPhotosInFolder(
    absoluteDir: string,
    srcPrefix: string,
    altPrefix: string
): SlidePhoto[] {
    if (!fs.existsSync(absoluteDir)) return [];

    const files = fs
        .readdirSync(absoluteDir)
        .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
        .sort((a, b) => a.localeCompare(b, "ja", { numeric: true }));

    return files.map((file, i) => {
        const rawLabel = path.basename(file, path.extname(file)).replace(/[-_]/g, " ").trim();
        const isMeaningfulLabel = rawLabel !== "" && !/^\d+$/.test(rawLabel);

        return {
            src: `${srcPrefix}/${file}`,
            alt: isMeaningfulLabel ? `${altPrefix} ${rawLabel}` : `${altPrefix} (${i + 1}枚目)`,
        };
    });
}
