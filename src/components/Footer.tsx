import { Youtube, Twitter, Mail } from "lucide-react";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-white border-t border-slate-100 py-12">
            <div className="container mx-auto px-4 text-center">
                <div className="flex justify-center gap-6 mb-8">
                    <a href="https://x.com/kota_corps" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors">
                        <Twitter className="w-5 h-5" />
                    </a>
                    <a href="https://www.youtube.com/@secretmachine60" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <Youtube className="w-5 h-5" />
                    </a>
                    <a href="mailto:dokojan.info@gmail.com" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors">
                        <Mail className="w-5 h-5" />
                    </a>
                </div>
                <div className="mb-6">
                    <Link href="/privacy" className="text-sm text-slate-500 hover:text-slate-800 transition-colors hover:underline underline-offset-4">
                        プライバシーポリシー・免責事項
                    </Link>
                </div>
                <p className="text-sm text-slate-500 font-medium">
                    &copy; {new Date().getFullYear()} Rikiya Matsushima (Mahjong RDX). All rights reserved.
                </p>
            </div>
        </footer>
    );
}
