import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, Sparkles, FileText } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

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
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-bold tracking-wider mb-4">
                                <Sparkles className="w-4 h-4" />
                                SPECIAL EVENT
                            </span>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-6 leading-tight">
                                西日本TEAMリーグ<br />スピンオフ企画（オフシーズン特別開催）
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

                            <a
                                href="https://forms.gle/qhJRFRXTr3fF2pPBA"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                                <FileText className="w-5 h-5" />
                                スピンオフ企画にエントリーする
                            </a>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
