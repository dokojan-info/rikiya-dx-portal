import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mahjong RDX | プロ雀士エンジニア 松島リキヤ ポータルサイト",
  description: "プロ雀士エンジニア「松島リキヤ」の個人ポータルサイト。麻雀をスマートにするデジタルツール群を開発しています。",
  icons: {
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9503703142277125"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col selection:bg-primary/20`}>
        {children}
      </body>
    </html>
  );
}
