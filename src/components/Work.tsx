"use client";

import { MessageSquare, Users, Code, Mail, ArrowRight, Sparkles, Mic2 } from "lucide-react";
import { useSide } from "@/context/SideContext";

export default function Work() {
    const { side } = useSide();

    return (
        <section id="work" className="py-20 bg-background transition-colors duration-500">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                        {side === "rikiya" ? "Work / Contact" : "お仕事・コラボ依頼"}
                    </h2>
                    {side === "richiko" && (
                        <div className="inline-block bg-primary/10 text-primary font-bold px-6 py-3 rounded-xl mb-6">
                            ※ 現在、新規のお仕事やコラボのご依頼は受け付けておりません。
                        </div>
                    )}
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        {side === "rikiya" 
                            ? "麻雀のゲスト出演、大会・イベントの運営支援から、モダンなホームページ制作まで、お気軽にご相談ください。"
                            : "広島の麻雀界隈を盛り上げる活動は引き続き頑張るけん！また募集を再開した時はよろしくや！"
                        }
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="p-8 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                            <Users className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-foreground">
                            {side === "rikiya" ? "Mahjong Guest" : "イベント出演"}
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed mb-4">
                            {side === "rikiya" 
                                ? "プロ雀士としてのゲスト参戦、実況、解説などのご依頼を承っております。"
                                : "広島エリアの麻雀店さんやイベントでのゲスト出演依頼、お待ちしとるよ！"
                            }
                        </p>
                    </div>

                    <div className="p-8 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                            {side === "rikiya" ? <MessageSquare className="w-8 h-8 text-indigo-600" /> : <Mic2 className="w-8 h-8 text-indigo-600" />}
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-foreground">
                            {side === "rikiya" ? "Management" : "配信・コラボ"}
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed mb-4">
                            {side === "rikiya"
                                ? "大会やイベントの企画・運営、システム構築のサポートをいたします。"
                                : "YouTubeでのコラボ配信や、AI VTuberとしての出演依頼もぶち歓迎じゃけぇ！"
                            }
                        </p>
                    </div>

                    <div className="p-8 rounded-2xl bg-sky-50 border border-sky-100 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mb-6">
                            {side === "rikiya" ? <Code className="w-8 h-8 text-sky-600" /> : <Sparkles className="w-8 h-8 text-sky-600" />}
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-foreground">
                            {side === "rikiya" ? "Web Development" : "広島PR活動"}
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed mb-4">
                            {side === "rikiya"
                                ? "Next.js + Tailwind CSS を用いた高速でモダンなサイト制作・開発を承ります。"
                                : "広島のグルメやスポットの紹介など、地域を盛り上げる活動なら何でもやるけん！"
                            }
                        </p>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden shadow-2xl">
                    <div className="relative z-10">
                        <h3 className="text-2xl md:text-3xl font-bold mb-6">
                            {side === "rikiya" ? "お仕事のご依頼・ご相談はこちら" : "リチコへの依頼・相談はこちらじゃ！"}
                        </h3>
                        <p className="text-slate-400 mb-10 max-w-xl mx-auto">
                            {side === "rikiya"
                                ? "ゲスト出演・イベント運営・Web制作など、まずはお気軽にご連絡ください。"
                                : "※今は新規の募集はお休み中じゃけぇ、お返事できんかもしれんのんよ。ごめんね！"
                            }
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <a
                                href="https://x.com/kota_corps"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-primary hover:opacity-90 text-white font-bold px-8 py-4 rounded-xl transition-all"
                            >
                                X (DM) で問い合わせる
                                <ArrowRight className="w-5 h-5" />
                            </a>
                            <a
                                href="mailto:dokojan.info@gmail.com"
                                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-xl transition-all border border-white/20"
                            >
                                <Mail className="w-5 h-5" />
                                メールで問い合わせる
                            </a>
                        </div>
                        <p className="text-sm text-slate-400 mt-4">
                            ※メーラーが起動しない場合は dokojan.info@gmail.com まで
                        </p>
                    </div>
                    {/* Background pattern */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
                </div>
            </div>
        </section>
    );
}
