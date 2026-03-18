import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* ヘッダーを追加 */}
            <Header />

            {/* メインコンテンツ */}
            <main className="container mx-auto px-4 py-12 max-w-3xl flex-1">
                <h1 className="text-3xl font-bold mb-8 text-center">プライバシーポリシー・免責事項</h1>

                <div className="space-y-8 text-slate-700 leading-relaxed">
                    {/* プライバシーポリシー */}
                    <section>
                        <h2 className="text-xl font-semibold mb-4 border-b pb-2">プライバシーポリシー</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-bold">1. 広告の配信について</h3>
                                <p>当サイト「RMDX | 松島リキヤ麻雀DX化計画」は、第三者配信の広告サービスを利用しています（予定を含む）。広告配信事業者は、ユーザーの興味に応じた広告を表示するためにCookie（クッキー）を使用することがあります。Cookieを無効にする設定およびGoogleアドセンスに関する詳細は「<a href="https://policies.google.com/technologies/ads?hl=ja" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Googleポリシーと規約</a>」をご覧ください。</p>
                            </div>
                            <div>
                                <h3 className="font-bold">2. アクセス解析ツールについて</h3>
                                <p>当サイトでは、Googleによるアクセス解析ツール「Googleアナリティクス」を利用しています。このGoogleアナリティクスはトラフィックデータの収集のためにCookieを使用しています。このデータは匿名で収集されており、個人を特定するものではありません。</p>
                            </div>
                        </div>
                    </section>

                    {/* 免責事項 */}
                    <section>
                        <h2 className="text-xl font-semibold mb-4 border-b pb-2">免責事項</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-bold">1. ツールの利用に関する免責</h3>
                                <p>当サイトで提供している各種ツール（点数計算、卓組み作成など）は、正確な結果を提供するよう努めておりますが、その正確性や完全性を保証するものではありません。当サイトのツールの計算結果や出力データを利用したことにより生じた、いかなるトラブル、損失、損害に対しても、運営者は一切の責任を負いかねます。ツールの利用は自己責任で行っていただきますようお願いいたします。</p>
                            </div>
                            <div>
                                <h3 className="font-bold">2. 著作権・肖像権について</h3>
                                <p>当サイトで掲載している文章や画像などにつきましては、無断転載することを禁止します。</p>
                            </div>
                        </div>
                    </section>

                    {/* 運営者情報 */}
                    <section className="bg-slate-50 p-6 rounded-lg mt-8">
                        <h2 className="text-lg font-bold mb-2">運営者情報</h2>
                        <p>サイト名: RMDX | 松島リキヤ麻雀DX化計画</p>
                        <p>運営者: 松島理樹也</p>
                    </section>
                </div>
            </main>

            {/* フッターを追加 */}
            <Footer />
        </div>
    );
}