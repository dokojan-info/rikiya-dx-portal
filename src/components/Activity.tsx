import { CalendarDays, MonitorPlay } from "lucide-react";

export default function Activity() {
    return (
        <section id="activity" className="py-20 bg-slate-50">
            <div className="container mx-auto px-4 max-w-5xl">
                <h2 className="text-3xl font-bold mb-12 text-center text-slate-800">Other Activities</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                            <CalendarDays className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-4 text-slate-800">西日本TEAMリーグ 広島エリア運営</h3>
                        <p className="text-slate-600 leading-relaxed flex-grow">
                            西日本最大規模のプロ・アマチュア問わず参加できる競技麻雀のリーグ戦を運営。
                            地域に根ざした麻雀文化の普及と発展に貢献しています。
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-6">
                            <MonitorPlay className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-4 text-slate-800">2D VTuber ＆ テック系活動</h3>
                        <p className="text-slate-600 leading-relaxed flex-grow">
                            アバターを用いたライブ配信や、新しいテクノロジーの探求など、
                            次世代のクリエイティブ活動に挑戦中。麻雀以外のジャンルでも発信を行っています。
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
