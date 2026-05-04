"use client";

import { CalendarDays, MonitorPlay, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useSide } from "@/context/SideContext";

export default function Activity() {
    const { side } = useSide();

    return (
        <section id="activity" className="py-20 bg-card/30 transition-colors duration-500">
            <div className="container mx-auto px-4 max-w-6xl">
                <h2 className="text-3xl font-bold mb-12 text-center text-foreground">
                    {side === "rikiya" ? "Other Activities" : "広報活動・応援リーグ"}
                </h2>

                {side === "rikiya" ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* 西日本TEAMリーグ カード（リンク化） */}
                        <Link href="/activities/west-team-league" className={`group bg-card p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col hover:border-primary/50 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}>
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                                <CalendarDays className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors">西日本TEAMリーグ 広島エリア運営</h3>
                            <p className="text-slate-600 leading-relaxed flex-grow mb-4">
                                西日本最大規模のプロ・アマチュア問わず参加できる競技麻雀のリーグ戦を運営。地域に根ざした麻雀文化の普及と発展に貢献しています。
                            </p>
                            <div className="flex items-center text-sm font-bold text-primary mt-auto">
                                詳細を見る <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>

                        {/* 日本プロ麻雀協会 広島支部 カード（リンク化） */}
                        <Link href="/activities/japan-pro-mahjong" className="group bg-card p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col hover:border-green-200 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-600 group-hover:text-white transition-colors">
                                <CalendarDays className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-foreground group-hover:text-green-600 transition-colors">日本プロ麻雀協会 広島支部</h3>
                            <p className="text-slate-600 leading-relaxed flex-grow mb-4">
                                プロ活動の一環として、広島プロアマプロデュースカップをはじめとするプロアマシリーズの運営・普及活動を行っています。
                            </p>
                            <div className="flex items-center text-sm font-bold text-green-600 mt-auto">
                                詳細を見る <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>

                        {/* 2D VTuber カード */}
                        <div className="bg-card p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-6">
                                <MonitorPlay className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-foreground">2D VTuber ＆ テック系活動</h3>
                            <p className="text-slate-600 leading-relaxed flex-grow">
                                アバターを用いたライブ配信や、新しいテクノロジーの探求など、次世代のクリエイティブ活動に挑戦中。麻雀以外のジャンルでも発信・研究を行っています。
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* 広島麻雀界隈 */}
                        <a href="https://hiroshima-mahjong.com" target="_blank" rel="noopener noreferrer" className="group bg-card p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col hover:border-primary/50 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                                <Sparkles className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors">広島麻雀界隈</h3>
                            <p className="text-slate-600 leading-relaxed flex-grow mb-4">
                                広島の雀荘、イベント情報、プロの活躍などをひとまとめにしたポータルサイトじゃけぇ！うちも応援しとるけん、ぜひ見てみてや！
                            </p>
                            <div className="flex items-center text-sm font-bold text-primary mt-auto">
                                サイトを見る <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </a>
                    </div>
                )}
            </div>
        </section>
    );
}
