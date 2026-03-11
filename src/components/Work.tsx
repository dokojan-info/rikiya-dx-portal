import { MessageSquare, Users, Code, Mail, ArrowRight } from "lucide-react";

export default function Work() {
    return (
        <section id="work" className="py-20 bg-white">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800">Work / Contact</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        麻雀のゲスト出演、大会・イベントの運営支援から、モダンなホームページ・Webアプリケーションの制作まで、幅広くご依頼を受け付けております。
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="p-8 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                            <Users className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-slate-800">Mahjong Guest</h3>
                        <p className="text-sm text-slate-600 leading-relaxed mb-4">
                            プロ雀士としてのゲスト参戦、実況、解説などのご依頼を承っております。
                        </p>
                    </div>

                    <div className="p-8 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                            <MessageSquare className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-slate-800">Management</h3>
                        <p className="text-sm text-slate-600 leading-relaxed mb-4">
                            大会やイベントの企画・運営、システム構築のサポートをいたします。
                        </p>
                    </div>

                    <div className="p-8 rounded-2xl bg-sky-50 border border-sky-100 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mb-6">
                            <Code className="w-8 h-8 text-sky-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-slate-800">Web Development</h3>
                        <p className="text-sm text-slate-600 leading-relaxed mb-4">
                            Next.js + Tailwind CSS を用いた高速でモダンなサイト制作・開発を承ります。
                        </p>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden shadow-2xl">
                    <div className="relative z-10">
                        <h3 className="text-2xl md:text-3xl font-bold mb-6">お仕事のご依頼・ご相談はこちら</h3>
                        <p className="text-slate-400 mb-10 max-w-xl mx-auto">
                            各活動へのご依頼は、X（旧Twitter）のDMまたはメールにてお気軽にお問い合わせください。
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <a
                                href="https://x.com/kota_corps"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold px-8 py-4 rounded-xl transition-all"
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
                    </div>
                    {/* Background pattern */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
                </div>
            </div>
        </section>
    );
}
