import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, ArrowLeft, Download } from "lucide-react";
import { getAppById, apps } from "../../../data/apps";

// 静的書き出し(SSG)のための関数
export function generateStaticParams() {
    return apps.map((app) => ({
        id: app.id,
    }));
}

export default function AppDetailPage({ params }: { params: { id: string } }) {
    const app = getAppById(params.id);

    if (!app) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-50/50 py-20 pt-32">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* 戻るボタン（/appsへ） */}
                <div className="mb-8">
                    <Link
                        href="/apps"
                        className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-full transition-all hover:shadow-sm hover:border-slate-300"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        アプリ一覧に戻る
                    </Link>
                </div>

                {/* メインのコンテントエリア */}
                <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-sm">
                    {/* アプリのヘッダー：アイコン＋タイトル */}
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-12">
                        <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 bg-slate-50 rounded-3xl flex items-center justify-center p-4 shadow-sm border border-slate-100/50">
                            {app.iconSrc ? (
                                <Image
                                    src={app.iconSrc}
                                    alt={app.name}
                                    width={120}
                                    height={120}
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div className="text-7xl">🀄</div>
                            )}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl md:text-5xl font-bold text-slate-800 mb-4 tracking-tight">
                                {app.name}
                            </h1>
                            <p className="text-xl text-slate-600 font-medium mb-6">
                                {app.description}
                            </p>

                            {/* アクションボタン */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                {app.url && (
                                    <a
                                        href={app.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-sm hover:shadow-md"
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                        アプリを開く
                                    </a>
                                )}
                                {app.downloadUrl && (
                                    <a
                                        href={app.downloadUrl}
                                        download
                                        className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-sm hover:shadow-md"
                                    >
                                        <Download className="w-5 h-5" />
                                        辞書をダウンロードする
                                    </a>
                                )}
                                {app.noteUrl && app.noteUrl !== "#" && (
                                    <a
                                        href={app.noteUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-8 py-3.5 rounded-xl transition-colors"
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                        noteの記事はこちら
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 詳細説明エリア（内容は別途追加予定） */}
                    <div className="prose prose-slate max-w-none">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                            アプリの概要
                        </h2>
                        <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">
                            {app.longDescription || app.description}
                        </p>

                        {app.instructions && (
                            <div className="mt-12 p-8 bg-slate-50 rounded-2xl border border-slate-100">
                                <h3 className="text-xl font-bold text-slate-800 mb-6">使い方・インストール手順</h3>
                                <div className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                    {app.instructions}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
