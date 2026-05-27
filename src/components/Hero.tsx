"use client";

import { useSide } from "@/context/SideContext";


export default function Hero() {
    const { side } = useSide();

    return (
        <section className={`relative pt-24 pb-32 overflow-hidden transition-colors duration-500`}>
            <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-center gap-12 text-center md:text-left">
                <div className="flex-1 max-w-2xl">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6">
                        {side === "rikiya" ? (
                            <>麻雀の世界を<br className="md:hidden" />デジタルの力でもっと便利に！</>
                        ) : (
                            <>広島と麻雀の魅力を<br className="md:hidden" />世界中に届けるんよ！</>
                        )}
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed">
                        {side === "rikiya" ? (
                            <>
                                <span className="inline-block">現役プロ雀士エンジニアが開発する、</span>
                                <span className="inline-block">麻雀をスマートにするデジタルツール群</span>
                            </>
                        ) : (
                            <>
                                <span className="inline-block">広島の麻雀界を応援するAI VTuber！</span>
                                <span className="inline-block">うちと一緒に麻雀とお好み焼きを楽しもうや！</span>
                            </>
                        )}
                    </p>
                </div>
            </div>

            {/* Background decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-10 transition-colors duration-500" />

            <style jsx>{`
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 4s ease-in-out infinite;
                }
            `}</style>
        </section>
    );
}
