"use client";

import Image from "next/image";
import Link from "next/link";
import { apps } from "../data/apps";
import { useSide } from "@/context/SideContext";

export default function Apps() {
    const { side } = useSide();

    return (
        <section id="apps" className="py-20 bg-background transition-colors duration-500">
            <div className="container mx-auto px-4 max-w-5xl">
                <h2 className="text-3xl font-bold mb-2 text-center text-foreground">
                    {side === "rikiya" ? "Products & Apps" : "リチコのおすすめアプリ"}
                </h2>
                <p className="text-slate-500 mb-12 text-center">
                    {side === "rikiya" 
                        ? "麻雀の体験をアップデートするツール群" 
                        : "麻雀がもっと楽しくなる、ぶち便利なツールがいっぱいなんよ！"
                    }
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {apps.map((app) => (
                        <div
                            key={app.id}
                            className="group flex flex-col p-6 bg-card rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-1">
                                    {app.iconSrc ? (
                                        <Image
                                            src={app.iconSrc}
                                            alt={app.name}
                                            width={48}
                                            height={48}
                                            className="w-12 h-12 object-contain"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 flex items-center justify-center text-4xl font-mahjong-color">
                                            🀄
                                        </div>
                                    )}
                                </div>
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-foreground">{app.name}</h3>
                            <p className="text-slate-600 leading-relaxed text-sm flex-grow mb-6">
                                {app.description}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                                <Link
                                    href={`/apps/${app.id}`}
                                    className="flex-1 inline-flex items-center justify-center gap-2 bg-primary hover:opacity-90 text-white font-medium px-4 py-2.5 rounded-xl transition-colors text-sm"
                                >
                                    詳細を見る
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}