import Image from "next/image";
import { ExternalLink } from "lucide-react";

const apps = [
    {
        id: "jancalc",
        name: "JANCALC",
        description: "いつでもブラウザから一瞬で条件計算ができるWebアプリ",
        // 【修正1】 JSXではなく、画像のパス（文字列）だけを持たせる
        iconSrc: "/images/jancalc_icon.webp",
        url: "https://jancalc.rdx-mahjong.com/",
        noteUrl: "https://note.com/rikiya_ai/n/nee89b380ff7a",
    },
    {
        id: "janpass",
        name: "JANPASS",
        description: "デジタル点棒アプリ",
        iconSrc: "/images/janpass_icon.webp",
        url: "https://janpass.rdx-mahjong.com/",
        noteUrl: "https://note.com/rikiya_ai/n/n04b9cd417cdb",
    },
    {
        id: "janmatch",
        name: "JANMATCH",
        description: "大会・リーグ戦の進行をスムーズにする組み合わせ管理アプリ",
        iconSrc: "/images/janmatch_icon.webp",
        url: "https://janmatch.rdx-mahjong.com/",
        noteUrl: "https://note.com/rikiya_ai/n/n90877c0cefb3",
    },
    {
        id: "jansco",
        name: "JANSCO",
        description: "スマートなスコア計算アプリ",
        iconSrc: "/images/jansco.webp",
        url: "https://jansco.rdx-mahjong.com/",
        noteUrl: "#",
    },

];

export default function Apps() {
    return (
        <section id="apps" className="py-20 bg-slate-50/50">
            <div className="container mx-auto px-4 max-w-5xl">
                <h2 className="text-3xl font-bold mb-2 text-center">Products & Apps</h2>
                <p className="text-slate-500 mb-12 text-center">麻雀の体験をアップデートするツール群</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {apps.map((app) => (
                        <div
                            key={app.id}
                            className="group flex flex-col p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-1">
                                    {/* 【修正2】 ここで初めて Image コンポーネントを呼び出す */}
                                    <Image
                                        src={app.iconSrc}
                                        alt={app.name}
                                        width={48}
                                        height={48}
                                        className="w-12 h-12 object-contain" // object-containを足すと綺麗に収まります
                                    />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-slate-800">{app.name}</h3>
                            <p className="text-slate-600 leading-relaxed text-sm flex-grow mb-6">
                                {app.description}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                                <a
                                    href={app.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 inline-flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-medium px-4 py-2.5 rounded-xl transition-colors text-sm"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    アプリを開く
                                </a>
                                {app.noteUrl && app.noteUrl !== "#" && ( // "#"の時はボタンを非表示にする小技を足しました
                                    <a
                                        href={app.noteUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2.5 rounded-xl transition-colors text-sm"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        使い方を読む
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}