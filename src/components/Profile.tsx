"use client";

import Image from "next/image";
import { Coffee, Code, Trophy, MapPin, Heart, Sparkles, MessageCircle, Utensils } from "lucide-react";
import { useSide } from "@/context/SideContext";
import { richikoProfile } from "@/data/richiko";

export default function Profile() {
    const { side } = useSide();

    return (
        <section id="profile" className="py-20 bg-background transition-colors duration-500">
            <div className="container mx-auto px-4 max-w-4xl">
                <h2 className="text-3xl font-bold mb-12 text-center text-foreground">
                    {side === "rikiya" ? "Profile" : "リチコについて"}
                </h2>

                <div className="bg-card rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100 flex flex-col md:flex-row gap-10">
                    <div className="md:w-1/3 flex flex-col items-center text-center">
                        <div className="relative w-40 h-40 bg-slate-100 rounded-full mb-6 border-4 border-white shadow-lg overflow-hidden">
                            <Image
                                src={side === "rikiya" ? "/images/profile.png" : richikoProfile.image}
                                alt={side === "rikiya" ? "松島 リキヤ" : "平和 リチコ"}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground">
                            {side === "rikiya" ? "松島 リキヤ" : richikoProfile.name}
                        </h3>
                        <p className="text-slate-500 mb-4">
                            {side === "rikiya" ? "Rikiya Matsushima" : "Narwa Richiko"}
                        </p>
                        <div className="flex items-center gap-2 text-primary font-medium bg-primary/10 px-4 py-2 rounded-full text-sm">
                            {side === "rikiya" ? (
                                <><Code className="w-4 h-4" /> プロ雀士 × エンジニア</>
                            ) : (
                                <><Sparkles className="w-4 h-4" /> 広島麻雀界応援団</>
                            )}
                        </div>
                    </div>

                    <div className="md:w-2/3 flex flex-col justify-center">
                        <ul className="space-y-4 mb-8">
                            {side === "rikiya" ? (
                                <>
                                    <li className="flex items-center gap-3 text-slate-600">
                                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                                            <MapPin className="w-5 h-5 text-primary" />
                                        </div>
                                        <span>日本プロ麻雀協会所属</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-slate-600">
                                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                                            <Trophy className="w-5 h-5 text-yellow-500" />
                                        </div>
                                        <span>第31期 發王戦 準優勝</span>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li className="flex items-center gap-3 text-slate-600">
                                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                                            <Utensils className="w-5 h-5 text-primary" />
                                        </div>
                                        <span>{richikoProfile.traits[1].value}</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-slate-600">
                                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                                            <MessageCircle className="w-5 h-5 text-primary" />
                                        </div>
                                        <span>{richikoProfile.traits[2].value}</span>
                                    </li>
                                </>
                            )}
                        </ul>

                        <p className="text-foreground leading-relaxed mb-6 text-lg italic">
                            {side === "richiko" && richikoProfile.dialects[0]}
                        </p>
                        <p className="text-slate-600 leading-relaxed mb-10 text-lg">
                            {side === "rikiya" 
                                ? "プレイヤーとしての知見と、エンジニアとしての技術を掛け合わせ、麻雀界の課題を解決するツールを開発しています。"
                                : richikoProfile.description
                            }
                        </p>

                        {/* Creator Support */}
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mt-auto">
                            <div className="flex items-start gap-4 mb-4">
                                <Coffee className="w-6 h-6 text-pink-500 shrink-0 mt-1" />
                                {side === "rikiya" ? (
                                    <div>
                                        <h4 className="font-bold text-slate-800 mb-1">クリエイター支援 (OFUSE)</h4>
                                        <p className="text-sm text-slate-600 leading-relaxed">
                                            今後のアプリ開発やプロ雀士としての活動を応援していただける方は、
                                            ぜひOFUSEからのご支援をお願いいたします。いただいた支援は直接活動費として充てさせていただきます。
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <h4 className="font-bold text-slate-800 mb-1">リチコの活動を応援するんよ！</h4>
                                        <p className="text-sm text-slate-600 leading-relaxed">
                                            うちの活動を応援してくれたらぶち嬉しいけぇ！
                                            いただいた支援はお好み焼き代...じゃなくて、広島の麻雀を盛り上げるために大切に使うけんね！
                                        </p>
                                    </div>
                                )}
                            </div>
                            <a
                                href="https://ofuse.me/ac4d4cf3"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-medium px-6 py-3 rounded-xl transition-colors"
                            >
                                <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
                                {side === "rikiya" ? "OFUSEで応援する" : "リチコを応援するんよ！"}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
