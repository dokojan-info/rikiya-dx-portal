import { Edit3, ExternalLink } from "lucide-react";
import Parser from "rss-parser";

const NOTE_ACCOUNT_URL = "https://note.com/rikiya_ai";
const RSS_URL = `${NOTE_ACCOUNT_URL}/rss`;
const MAX_ARTICLES = 6;

type Article = {
    id: string;
    title: string;
    date: string;
    url: string;
};

// 除外キーワード（タイトルにこれらを含む記事は表示しない）
const EXCLUDE_KEYWORDS = [
    "競馬", "馬券", "予想", "回顧", "レース",
    "AJCC", "日経新春杯", "有馬記念", "エリザベス女王杯",
    "ダービー", "天皇賞", "菊花賞", "皐月賞", "オークス",
    "宝塚記念", "ジャパンカップ", "マイルCS", "スプリンターズ",
    "着！", "人気）", "馬場", "枠",
];

async function fetchNoteArticles(): Promise<Article[]> {
    try {
        const parser = new Parser();
        const feed = await parser.parseURL(RSS_URL);

        return (feed.items ?? [])
            .filter((item) => {
                const title = item.title ?? "";
                return !EXCLUDE_KEYWORDS.some((kw) => title.includes(kw));
            })
            .slice(0, MAX_ARTICLES)
            .map((item, index) => ({
                id: String(index),
                title: item.title ?? "無題",
                date: item.pubDate
                    ? new Date(item.pubDate).toLocaleDateString("ja-JP", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                    })
                    : "",
                url: item.link ?? NOTE_ACCOUNT_URL,
            }));
    } catch (error) {
        console.error("note RSS の取得に失敗しました:", error);
        return [];
    }
}

export default async function Notes() {
    const articles = await fetchNoteArticles();

    if (articles.length === 0) {
        return null; // 記事がなければセクション自体を非表示
    }

    return (
        <section id="notes" className="py-20 bg-white">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-3xl font-bold mb-2 text-slate-800">Notes &amp; Blog</h2>
                        <p className="text-slate-500">開発日記や活動報告、日々の雑記</p>
                    </div>
                    <a
                        href={NOTE_ACCOUNT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden md:flex items-center gap-2 text-primary font-medium hover:text-blue-700 transition-colors"
                    >
                        note一覧を見る <ExternalLink className="w-4 h-4" />
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {articles.map((article) => (
                        <a
                            key={article.id}
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary/20 hover:shadow-md transition-all"
                        >
                            <div className="flex items-center justify-end mb-4">
                                <span className="text-sm text-slate-400 font-medium">{article.date}</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 group-hover:text-primary transition-colors line-clamp-3 mb-4">
                                {article.title}
                            </h3>
                            <div className="flex items-center text-sm font-medium text-slate-500 group-hover:text-primary transition-colors mt-auto">
                                記事を読む <ExternalLink className="w-4 h-4 ml-1" />
                            </div>
                        </a>
                    ))}
                </div>

                <div className="mt-8 text-center md:hidden">
                    <a
                        href={NOTE_ACCOUNT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary font-bold bg-primary/10 px-6 py-3 rounded-xl hover:bg-primary/20 transition-colors"
                    >
                        <Edit3 className="w-5 h-5" /> note一覧を見る
                    </a>
                </div>
            </div>
        </section>
    );
}
