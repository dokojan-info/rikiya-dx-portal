import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Download } from "lucide-react";
import { apps } from "../../data/apps";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
    title: "アプリ一覧 | Mahjong RDX",
    description: "麻雀の体験をアップデートするツール群。JANCALC・JANPASS・JANMATCHなど、開発したWebアプリを一覧で紹介します。",
};

export default function AppsPage() {
    return (
        <>
            <Header />
            <main className="min-h-screen bg-slate-50/50 py-20 pt-32">
                <div className="container mx-auto px-4 max-w-4xl">
                    {/* 戻るボタン */}
                    <div className="mb-8">
                        <Link
                            href="/#apps"
                            className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-full transition-all hover:shadow-sm hover:border-slate-300"
                        >
                            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            トップに戻る
                        </Link>
                    </div>

                    {/* ページヘッダー */}
                    <div className="mb-10">
                        <h1 className="text-4xl font-bold text-foreground mb-3">
                            Products &amp; Apps
                        </h1>
                        <p className="text-slate-500 text-lg">
                            麻雀の体験をアップデートするツール群
                        </p>
                    </div>

                    {/* アプリ一覧（カード形式） */}
                    <div className="flex flex-col gap-6">
                        {apps.map((app) => (
                            <div
                                key={app.id}
                                className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm"
                            >
                                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                                    {/* アイコン */}
                                    <div className="w-24 h-24 shrink-0 bg-slate-50 rounded-2xl flex items-center justify-center p-3 shadow-sm border border-slate-100/50">
                                        {app.iconSrc ? (
                                            <Image
                                                src={app.iconSrc}
                                                alt={app.name}
                                                width={80}
                                                height={80}
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <div className="text-5xl">🀄</div>
                                        )}
                                    </div>

                                    {/* 情報 */}
                                    <div className="flex-1 text-center md:text-left">
                                        <h2 className="text-2xl font-bold text-slate-800 mb-2">
                                            {app.name}
                                        </h2>
                                        <p className="text-slate-600 mb-5">
                                            {app.description}
                                        </p>

                                        {/* アクションボタン */}
                                        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                            {app.url && (
                                                <a
                                                    href={app.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center gap-2 bg-primary hover:opacity-90 text-white font-semibold px-6 py-2.5 rounded-xl transition-all shadow-sm text-sm"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    アプリを開く
                                                </a>
                                            )}
                                            {app.downloadUrl && (
                                                <a
                                                    href={app.downloadUrl}
                                                    download
                                                    className="inline-flex items-center justify-center gap-2 bg-primary hover:opacity-90 text-white font-semibold px-6 py-2.5 rounded-xl transition-all shadow-sm text-sm"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    ダウンロード
                                                </a>
                                            )}
                                            <Link
                                                href={`/apps/${app.id}`}
                                                className="inline-flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm border border-slate-200"
                                            >
                                                詳細を見る
                                            </Link>
                                            {app.noteUrl && app.noteUrl !== "#" && (
                                                <a
                                                    href={app.noteUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    noteの記事はこちら
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
