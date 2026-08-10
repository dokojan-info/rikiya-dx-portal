"use client";

import Image from "next/image";
import Link from "next/link";
import { apps } from "../data/apps";
import { useSide } from "@/context/SideContext";
import { ArrowRight } from "lucide-react";

// トップページに表示する最大件数
const MAX_DISPLAY = 3;

export default function Apps() {
    const { side } = useSide();
    const displayApps = apps.slice(0, MAX_DISPLAY);

    return (
        <section id="apps" className="py-20 bg-background transition-colors duration-500">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-3xl font-bold mb-2 text-foreground">
                            {side === "rikiya" ? "Products & Apps" : "リチコのおすすめアプリ"}
                        </h2>
                        <p className="text-slate-500">
                            {side === "rikiya"
                                ? "麻雀の体験をアップデートするツール群"
                                : "麻雀がもっと楽しくなる、ぶち便利なツールがいっぱいなんよ！"}
                        </p>
                    </div>
                    <Link
                        href="/apps"
                        className="group hidden md:inline-flex items-center gap-2 text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 px-5 py-2.5 rounded-full transition-all hover:shadow-sm"
                    >
                        アプリ一覧を見る
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {displayApps.map((app) => (
                        <Link
                            key={app.id}
                            href={`/apps/${app.id}`}
                            className="group flex flex-col p-6 bg-card rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all"
                        >
                            <div className="mb-4">
                                {app.iconSrc ? (
                                    <Image
                                        src={app.iconSrc}
                                        alt={app.name}
                                        width={48}
                                        height={48}
                                        className="w-12 h-12 object-contain"
                                    />
                                ) : (
                                    <div className="w-12 h-12 flex items-center justify-center text-4xl">
                                        🀄
                                    </div>
                                )}
                            </div>
                            <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                                {app.name}
                            </h3>
                            <p className="text-slate-600 leading-relaxed text-sm flex-grow">
                                {app.description}
                            </p>
                        </Link>
                    ))}
                </div>

                {/* モバイル用：一覧ボタン */}
                <div className="mt-8 text-center md:hidden">
                    <Link
                        href="/apps"
                        className="group inline-flex items-center gap-2 text-primary font-bold bg-primary/10 hover:bg-primary/20 border border-primary/20 px-6 py-3 rounded-full transition-all hover:shadow-sm"
                    >
                        アプリ一覧を見る
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
