import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, Trophy, Users, History, FileText } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "西日本TEAMリーグ 広島エリア | Rikiya Matsushima",
    description: "西日本TEAMリーグ 広島エリアの運営と広島代表チームの成績について",
};

export default function WestTeamLeaguePage() {
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
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 z-0 pointer-events-none"></div>
                        <div className="relative z-10">
                            <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-bold tracking-wider mb-4">
                                ACTIVITY
                            </span>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-6 leading-tight">
                                西日本TEAMリーグ<br className="sm:hidden" /> 広島エリア運営
                            </h1>
                            <p className="text-lg text-slate-600 leading-relaxed mb-6">
                                Mリーグ発足による麻雀人口の増加や環境の変化に呼応し、地方における麻雀人口とファンの拡大、優れたプレイヤーの発掘を目指し創設された競技麻雀のリーグ戦です。
                            </p>
                            <a
                                href="https://docs.google.com/forms/d/e/1FAIpQLSdDYHfvhRbf8GwRTVrux2zLjTlEqXbWPihrFam4D2OQP5rmfQ/viewform?usp=dialog"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-medium px-5 py-2.5 rounded-xl transition-colors shadow-sm"
                            >
                                <FileText className="w-4 h-4" />
                                大会エントリー / 詳細を見る
                            </a>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        {/* 開催目的・背景 */}
                        <div className="md:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <Users className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800">開催目的と背景</h2>
                            </div>
                            <div className="prose prose-slate max-w-none">
                                <p className="mb-4">
                                    近年、Mリーグの影響により麻雀人口は「観る雀（麻雀を打たないファン）」も含め劇的なV字回復を見せています。また、国際オリンピック委員会への競技申請の動きや議員連盟の設立など、麻雀を取り巻く環境は大きく変化しています。
                                </p>
                                <p className="mb-4">
                                    そういった動きにいち早く対応するため、<strong>地方における麻雀人口・ファンの増加</strong>と、<strong>優れたプレイヤーの発掘・研鑽</strong>を目的として本リーグは創設されました。
                                </p>
                                <p>
                                    初年度の活動が高く評価され、現在では関西・中国・九州地方などの各エリアに拡大し、麻雀チーム戦の普及とマナー・技術の向上を目指して活動を続けています。なお、広島エリアは「西日本TEAMリーグ 2021-2022」から新設・拡大されました。
                                </p>
                            </div>
                        </div>

                        {/* ハイライト */}
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 shadow-md text-white">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-300" />
                                広島エリアの躍進
                            </h3>
                            <p className="text-blue-100 text-sm leading-relaxed mb-6">
                                2021年のエリア新設以来、広島からも強力なチームが多数参戦し、西日本全体で優秀な成績を収めています。
                            </p>
                            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                                <div className="text-3xl font-black text-yellow-300 mb-1">
                                    優勝 1回
                                </div>
                                <div className="text-sm text-blue-100">
                                    2023-2024シーズン (コータ軍団)
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 年度別成績 */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                                <History className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800">広島エリア 主な成績</h2>
                        </div>

                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                            {[
                                {
                                    year: "2025-2026",
                                    results: [
                                        { team: "チームひらりん", result: "ファイナルステージ進出", type: "advance" },
                                        { team: "コータ軍団", result: "ファイナルステージ進出", type: "advance" },
                                        { team: "たのま～", result: "ファイナルステージ進出", type: "advance" }
                                    ]
                                },
                                {
                                    year: "2024-2025",
                                    results: [
                                        { team: "広島RMキングス", result: "3位", type: "podium" },
                                        { team: "Teamしーぴー", result: "セミファイナル敗退", type: "semifinal" },
                                        { team: "サクラ女子部", result: "セミファイナル敗退", type: "semifinal" }
                                    ]
                                },
                                {
                                    year: "2023-2024",
                                    results: [
                                        { team: "コータ軍団", result: "🏆 優勝", type: "champion" }
                                    ]
                                },
                                {
                                    year: "2022-2023",
                                    results: [
                                        { team: "七対子青年団", result: "3位入賞", type: "podium" },
                                        { team: "コータ軍団（赤）", result: "セミファイナル敗退", type: "semifinal" }
                                    ]
                                },
                                {
                                    year: "2021-2022",
                                    note: "広島エリア新設",
                                    results: [
                                        { team: "界隈さいつよ", result: "セミファイナル敗退", type: "semifinal" }
                                    ]
                                }
                            ].map((season, idx) => (
                                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-white text-slate-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                                    </div>
                                    
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-4 rounded-2xl border border-slate-100 bg-slate-50 shadow-sm transition-all hover:shadow-md hover:bg-white">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                                            <h3 className="font-bold text-slate-800 text-lg">{season.year} シーズン</h3>
                                            {season.note && (
                                                <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-lg w-fit">
                                                    {season.note}
                                                </span>
                                            )}
                                        </div>
                                        <ul className="space-y-2">
                                            {season.results.map((r, i) => (
                                                <li key={i} className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg bg-white border border-slate-100 shadow-sm">
                                                    <span className="font-medium text-slate-700">{r.team}</span>
                                                    <span className={`text-sm font-bold px-2 py-1 rounded
                                                        ${r.type === 'champion' ? 'bg-yellow-100 text-yellow-800' : 
                                                          r.type === 'podium' ? 'bg-orange-100 text-orange-800' :
                                                          r.type === 'advance' ? 'bg-blue-100 text-blue-800' :
                                                          'bg-slate-100 text-slate-600'}`
                                                    }>
                                                        {r.result}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}
