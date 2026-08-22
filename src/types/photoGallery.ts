import type { SlidePhoto } from "@/components/PhotoSlideshow";

// タブで切り替える1グループ分の写真（シーズン、開催回など単位は問わない）
export type PhotoGroup = {
    label: string;
    photos: SlidePhoto[];
};
