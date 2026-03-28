import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, Trophy, Users, FileText } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "日本プロ麻雀協会 プロ活動 | Rikiya Matsushima",
    description: "日本プロ麻雀協会 広島支部としてのプロ活動やプロアマシリーズの運営実績について",
};

export default function JapanProMahjongPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* ヘッダーはメインサイトと共通のものを使用 */}
            <Header />

            <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 mt-16">
                <div className="max-w-4xl mx-auto">
                    {/* 戻るボタン */}
                    <Link
                        href="/#activity"
                        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        トップページへ戻る
                    </Link>

                    {/* タイトルセクション */}
                    <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-100 mb-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 z-0 pointer-events-none"></div>
                        <div className="relative z-10">
                            <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-bold tracking-wider mb-4">
                                ACTIVITY
                            </span>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-6 leading-tight">
                                日本プロ麻雀協会<br className="sm:hidden" /> 広島支部 プロ活動
                            </h1>
                            <p className="text-lg text-slate-600 leading-relaxed mb-6">
                                日本プロ麻雀協会 広島支部所属のプロとして、競技麻雀の普及・発展を目指した活動を行っています。<br />
                                広島プロアマプロデュースカップをはじめとする「プロアマシリーズ」の運営を通じて、プロとアマチュアが真剣勝負できる場を提供しています。
                            </p>
                            <a
                                href="https://forms.gle/tfUh56Vy7F5VGkPu5"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors shadow-sm"
                            >
                                <FileText className="w-4 h-4" />
                                プロアマ募集・エントリー
                            </a>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        {/* 活動概要 */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                    <Users className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800">プロアマシリーズ運営</h2>
                            </div>
                            <div className="prose prose-slate max-w-none">
                                <p className="mb-4">
                                    広島エリアにおける麻雀の競技水準向上と交流を目的として、<strong>広島プロアマプロデュースカップ</strong>を中心としたプロアマシリーズを運営しています。
                                </p>
                                <p>
                                    プロ雀士に挑戦したい方、競技麻雀のルールやマナーを学びながら真剣に対局を楽しみたいアマチュアの方の参戦を広く募集しています。大会の進行やルール解説なども含め、誰もが安心して参加できる大会づくりに努めています。
                                </p>
                            </div>
                        </div>

                        {/* 実績・ハイライト */}
                        <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-8 shadow-md text-white">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-300" />
                                運営実績
                            </h3>
                            <p className="text-green-100 text-sm leading-relaxed mb-6">
                                定期的な大会開催を通じて、地域の競技麻雀コミュニティの活性化に貢献しています。
                            </p>
                            <div className="space-y-4">
                                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                                    <h4 className="font-bold text-white mb-1">広島プロアマプロデュースカップ</h4>
                                    <p className="text-xs text-green-100">継続的な企画・運営</p>
                                </div>
                                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                                    <h4 className="font-bold text-white mb-1">各種プロアマ交流戦</h4>
                                    <p className="text-xs text-green-100">地域に密着したイベントの開催</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
