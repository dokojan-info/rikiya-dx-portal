import React from "react";
import { Users } from "lucide-react";

// Google Sheetsの公開HTMLのURL
const SPREADSHEET_PUBHTML_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRcNrCHCSsYTL-PGSPeRD3skl9zSe44KnmIU2mIJ65ocDlNE0xpshbllTnIBZdSu2LEt7J8IVVcoEuT/pubhtml";

type SheetData = {
    name: string;
    gid: string;
};

type EntryData = {
    date: string;
    entries: string[];
};

// CSVの1行をカンマで分割する簡易関数（クオート内のカンマには対応していませんが、名前の場合は通常問題ありません）
function parseCsvLine(line: string): string[] {
    return line.split(",");
}

async function fetchEntries(): Promise<EntryData[]> {
    try {
        // 1. pubhtmlからシート情報を取得
        const res = await fetch(SPREADSHEET_PUBHTML_URL, { next: { revalidate: 60 } }); // 1分キャッシュ
        if (!res.ok) throw new Error("Failed to fetch pubhtml");
        const html = await res.text();

        // 正規表現で items.push({name: "...", gid: "..."}) を抽出
        const matches = html.match(/items\.push\(\{[^\}]+\}\)/g);
        if (!matches) return [];

        const sheets: SheetData[] = [];
        matches.forEach(match => {
            const nameMatch = match.match(/name:\s*"([^"]+)"/);
            const gidMatch = match.match(/gid:\s*"([^"]+)"/);
            if (nameMatch && gidMatch) {
                const name = nameMatch[1];
                const gid = gidMatch[1];
                // 「フォームの回答 1」シートは除外
                if (name !== "フォームの回答 1") {
                    sheets.push({ name, gid });
                }
            }
        });

        // 2. 各シートのCSVを取得
        const entryDataPromises = sheets.map(async (sheet) => {
            const csvUrl = `https://docs.google.com/spreadsheets/d/e/2PACX-1vRcNrCHCSsYTL-PGSPeRD3skl9zSe44KnmIU2mIJ65ocDlNE0xpshbllTnIBZdSu2LEt7J8IVVcoEuT/pub?gid=${sheet.gid}&single=true&output=csv`;
            const csvRes = await fetch(csvUrl, { next: { revalidate: 60 } });
            if (!csvRes.ok) return { date: sheet.name, entries: [] };
            const csvText = await csvRes.text();

            const lines = csvText.split(/\r?\n/);
            // 1行目はヘッダーなのでスキップし、D列（インデックス3）を取得
            const entries = lines.slice(1)
                .map(line => {
                    const columns = parseCsvLine(line);
                    return columns[3]?.trim();
                })
                .filter(name => name && name !== ""); // 空文字を除外

            return {
                date: sheet.name,
                entries
            };
        });

        const allEntryData = await Promise.all(entryDataPromises);
        return allEntryData;
    } catch (error) {
        console.error("Error fetching entries:", error);
        return [];
    }
}

export default async function EntryList() {
    const entryData = await fetchEntries();

    if (entryData.length === 0) {
        return (
            <div className="text-center py-8 text-slate-500">
                エントリー情報は現在準備中です。
            </div>
        );
    }

    return (
        <div className="mt-16">
            <div className="flex items-center gap-2 mb-8 border-b border-slate-200 pb-4">
                <Users className="w-6 h-6 text-orange-500" />
                <h2 className="text-2xl font-bold text-slate-800">エントリー状況</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {entryData.map((data, index) => (
                    <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                            <h3 className="font-bold text-slate-800 flex items-center justify-between">
                                {data.date}
                                <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-medium">
                                    {data.entries.length}名
                                </span>
                            </h3>
                        </div>
                        <div className="p-6">
                            {data.entries.length > 0 ? (
                                <ul className="space-y-2">
                                    {data.entries.map((name, i) => (
                                        <li key={i} className="text-slate-600 flex items-center gap-2 text-sm">
                                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0"></span>
                                            {name}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-slate-400 text-sm italic text-center py-4">まだエントリーはありません</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
