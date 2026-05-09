import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, Sparkles, Trophy, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import Image from "next/image";
import EntryList from "./EntryList";

// Cloudflare PagesではEdge Runtimeが必須、かつISRが使えないため動的レンダリングを強制する
export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "西日本TEAMリーグ スピンオフ企画 | Rikiya Matsushima",
    description: "西日本TEAMリーグ オフシーズン特別企画のエントリーと詳細について",
};

export default function WestTeamLeagueSpinoffPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Header />

            <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 mt-16">
                <div className="max-w-4xl mx-auto">
                    {/* 戻るボタン */}
                    <Link
                        href="/activities/west-team-league"
                        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        西日本TEAMリーグ ページへ戻る
                    </Link>

                    {/* メインカード */}
                    <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 z-0 pointer-events-none"></div>
                        <div className="relative z-10">
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-bold tracking-wider mb-6">
                                <Sparkles className="w-4 h-4" />
                                SPECIAL EVENT
                            </span>
                            
                            <div className="mb-8">
                                <Image 
                                    src="/images/matsu_title.png" 
                                    alt="Matsuリーグ 〜西日本TEAMリーグ スピンオフ〜" 
                                    width={1200} 
                                    height={600} 
                                    className="w-full h-auto object-contain rounded-xl"
                                    priority
                                />
                            </div>

                            <h1 className="sr-only">
                                西日本TEAMリーグ スピンオフ企画（オフシーズン特別開催）
                            </h1>
                            <div className="prose prose-slate max-w-none text-lg text-slate-600 leading-relaxed mb-8">
                                <p>
                                    西日本TEAMリーグのオフシーズン期間中に特別開催されるスピンオフ企画のエントリーページです。
                                    レギュラーシーズンとは一味違ったルールや組み合わせで、さらなる熱戦をお届けします。
                                </p>
                                <p>
                                    どなたでもご参加いただけますので、ぜひ以下のフォームよりエントリー内容をご確認のうえお申し込みください！
                                </p>
                            </div>

                            {/* 試合結果リンク */}
                            <div className="mb-10 bg-orange-50 rounded-2xl p-6 border border-orange-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-orange-900 flex items-center gap-2 mb-2">
                                        <Trophy className="w-5 h-5 text-orange-600" />
                                        大会結果
                                    </h2>
                                    <p className="text-orange-800 text-sm">
                                        Matsuリーグ 第1戦の成績表はこちらからご確認いただけます。
                                    </p>
                                </div>
                                <a 
                                    href="https://jansco.rdx-mahjong.com/share/aggregation/WzIzXQ" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="shrink-0 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-sm"
                                >
                                    第1戦の結果を見る
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>

                            {/* Googleフォーム埋め込み */}
                            <div className="w-full bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-200">
                                <h2 className="text-xl font-bold text-slate-800 mb-4 text-center">エントリーフォーム</h2>
                                <div className="relative w-full overflow-hidden rounded-xl" style={{ paddingTop: "150%" }}>
                                    <iframe 
                                        src="https://docs.google.com/forms/d/e/1FAIpQLSewrtI4NKVdzNdJHCB_5eYB7c3cv0I2AaKZPUdsrqnv3yt5Gg/viewform?embedded=true" 
                                        className="absolute top-0 left-0 w-full h-full border-0"
                                        title="西日本TEAMリーグ スピンオフ企画 エントリーフォーム"
                                    >
                                        読み込み中…
                                    </iframe>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* エントリーリスト（サーバーコンポーネント） */}
                    <EntryList />
                </div>
            </main>

            <Footer />
        </div>
    );
}
