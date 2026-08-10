export type AppInfo = {
    id: string;
    name: string;
    description: string;
    iconSrc?: string;
    url?: string;
    noteUrl?: string;
    longDescription?: string;
    downloadUrl?: string;
    instructions?: string;
    features?: string[];
};

export const apps: AppInfo[] = [
    {
        id: "jancalc",
        name: "JANCALC",
        description: "いつでもブラウザから一瞬で条件計算ができるWebアプリ",
        iconSrc: "/images/jancalc_icon.webp",
        url: "https://jancalc.rdx-mahjong.com/",
        noteUrl: "https://note.com/rikiya_ai/n/nee89b380ff7a",
        longDescription: "手牌や条件を入力するだけで、瞬時にあがり牌や必要な点差・条件を計算できるWebアプリケーションです。スマホブラウザでの利用に最適化されており、直感的なUIで素早く条件を確認できます。",
        features: [
            "手牌・条件を入力するだけで瞬時に計算",
            "スマホブラウザでの利用に最適化",
            "直感的なUIで素早く条件を確認できる",
        ],
    },
    {
        id: "janpass",
        name: "JANPASS",
        description: "デジタル点棒アプリ",
        iconSrc: "/images/janpass_icon.webp",
        url: "https://janpass.rdx-mahjong.com/",
        noteUrl: "https://note.com/rikiya_ai/n/n04b9cd417cdb",
        longDescription: "物理的な点棒を使わずに、スマートフォン上で点棒の受け渡しができるデジタル点棒アプリです。対局の進行状況や各プレイヤーの点数がリアルタイムで共有され、計算ミスを防ぎます。",
        features: [
            "点棒を使わずスマホ上で点数のやり取りができる",
            "対局の進行状況をリアルタイムで共有",
            "点数計算ミスを防止",
        ],
    },
    {
        id: "janmatch",
        name: "JANMATCH",
        description: "大会・リーグ戦の進行をスムーズにする組み合わせ管理アプリ",
        iconSrc: "/images/janmatch_icon.webp",
        url: "https://janmatch.rdx-mahjong.com/",
        noteUrl: "https://note.com/rikiya_ai/n/n90877c0cefb3",
        longDescription: "麻雀の大人数での大会やリーグ戦において、参加者の管理、ランダムかつ公平な卓組みの自動生成、そして全卓の成績管理・集計をオンラインで一元管理できる柔軟なシステムです。",
        features: [
            "参加者管理をオンラインで一元化",
            "ランダムかつ公平な卓組みを自動生成",
            "全卓の成績管理・集計に対応",
        ],
    },
    {
        id: "jansco",
        name: "JANSCO",
        description: "スマートなスコア計算アプリ",
        iconSrc: "/images/jansco.webp",
        url: "https://jansco.rdx-mahjong.com/",
        noteUrl: "#",
        longDescription: "翻数と符数を選択するだけで瞬時に正式な点数を導き出せるスマートなスコア計算アプリです。複雑な点数ルールを覚えるリソースを減らし、麻雀をより手軽に楽しむためのツールです。",
        features: [
            "翻数・符数を選ぶだけで点数を自動算出",
            "複雑な点数ルールを覚える必要なし",
            "手軽に使えるシンプルなUI",
        ],
    },
    {
        id: "mahjong-dict",
        name: "スマホ用麻雀用語辞書 (Gboard対応)",
        description: "Gboardにインポートするだけで、難しい麻雀用語や選手名がサクサク変換できるようになります。",
        instructions: `■ Gboardへのインポート手順

1. 辞書ファイルのダウンロード
   下記の「辞書をダウンロードする」ボタンから mahjong_dict.txt 形式のファイルをスマートフォンに保存します。

2. Gboardの設定を開く
   スマートフォンの設定アプリやキーボード上の歯車アイコンから、Gboardの「設定」メニューを開きます。

3. 単語リストを開く
   設定の中にある「単語リスト」→「単語リスト（日本語）」を開きます。

4. インポートを実行
   右上のメニュー（︙）から「インポート」を選択し、先ほどダウンロードした mahjong_dict.txt を選択します。

5. 完了
   インポート完了のメッセージが出れば準備OKです！`,
        downloadUrl: "/files/mahjong_dict.txt",
    },
    {
        id: "janlog",
        name: "JANLOG",
        description: "JSONファイルを読み込ませて成績を集計し詳細データを表示するアプリ",
        iconSrc: "/images/janlog_icon.webp",
        url: "https://janlog.rdx-mahjong.com/",
        longDescription: "対局結果のJSONファイルをアップロードするだけで、各種データや成績を自動で集計し、見やすい形で詳細データを可視化します。",
        features: [
            "JSONファイルをアップロードするだけで自動集計",
            "各種成績データを見やすく可視化",
        ],
    },
    {
        id: "mahjong-exam-maker",
        name: "麻雀問題作成ツール",
        description: "麻雀の何待ち問題や点数計算問題を自動生成・作成できるツール",
        url: "/tools/mahjong-exam-maker",
        longDescription: "待ち当て（何待ち）問題や和了点（点数計算）問題をカスタマイズして自動生成したり、手動で問題を入力してオリジナルの麻雀問題用紙を作成・印刷できるツールです。清一色や待ちの数、符・翻数などの細かい条件指定が可能です。",
        features: [
            "何待ち問題・点数計算問題を自動生成",
            "手動入力でオリジナル問題も作成可能",
            "清一色や待ちの数など細かい条件指定に対応",
            "印刷用の問題用紙として出力",
        ],
    },
];

export function getAppById(id: string): AppInfo | undefined {
    return apps.find((app) => app.id === id);
}
