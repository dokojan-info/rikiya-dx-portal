
export default function Hero() {
    return (
        <section className="relative pt-24 pb-32 overflow-hidden">
            <div className="container mx-auto px-4 relative z-10 text-center">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6">
                    プロの思考を、<br className="md:hidden" />あなたの麻雀に。
                </h1>
                <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                    <span className="inline-block">現役プロ雀士エンジニアが開発する、</span>
                    <span className="inline-block">麻雀をスマートにするデジタルツール群</span>
                </p>
            </div>

            {/* Background decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-10" />
        </section>
    );
}
