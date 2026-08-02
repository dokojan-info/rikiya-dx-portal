import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { apps } from "../../data/apps";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
    title: "アプリ一覧 | Mahjong RDX",
    description: "麻雀の体験をアップデートするツール群。JANCALC・JANPASS・JANMATCHなど、開発したWebアプリを一覧で紹介します。",
};

export default function AppsPage() {
    return (
        <>
            <Header />
            <main className="min-h-screen bg-slate-50/50 py-20 pt-32">
                <div className="container mx-auto px-4 max-w-5xl">
                    {/* 戻るボタン */}
                    <div className="mb-8">
                        <Link
                            href="/#apps"
                            className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            トップに戻る
                        </Link>
                    </div>

                    {/* ページヘッダー */}
                    <div className="mb-12">
                        <h1 className="text-4xl font-bold text-foreground mb-3">
                            Products &amp; Apps
                        </h1>
                        <p className="text-slate-500 text-lg">
                            麻雀の体験をアップデートするツール群
                        </p>
                    </div>

                    {/* アプリ一覧グリッド */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {apps.map((app) => (
                            <Link
                                key={app.id}
                                href={`/apps/${app.id}`}
                                className="group flex flex-col p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all"
                            >
                                {/* アイコン */}
                                <div className="mb-4">
                                    {app.iconSrc ? (
                                        <Image
                                            src={app.iconSrc}
                                            alt={app.name}
                                            width={56}
                                            height={56}
                                            className="w-14 h-14 object-contain rounded-xl"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 flex items-center justify-center text-4xl bg-slate-100 rounded-xl">
                                            🀄
                                        </div>
                                    )}
                                </div>

                                {/* 名前 */}
                                <h2 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                                    {app.name}
                                </h2>

                                {/* 説明 */}
                                <p className="text-slate-600 leading-relaxed text-sm flex-grow">
                                    {app.description}
                                </p>

                                {/* 詳細へのテキストリンク */}
                                <div className="mt-4 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                    詳細を見る →
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
