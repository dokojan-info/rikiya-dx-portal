"use client";

import { Youtube, Twitter, Mail } from "lucide-react";
import Link from "next/link";
import { useSide } from "@/context/SideContext";

export default function Footer() {
    const { side } = useSide();

    return (
        <footer className="bg-card border-t border-slate-100 py-12 transition-colors duration-500 print:hidden">
            <div className="container mx-auto px-4 text-center text-foreground">
                <div className="flex justify-center gap-6 mb-8">
                    <a href={side === "rikiya" ? "https://x.com/kota_corps" : "https://x.com/naruwa_richiko"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors border border-slate-100">
                        <Twitter className="w-5 h-5" />
                    </a>
                    <a href="https://www.youtube.com/@secretmachine60" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors border border-slate-100">
                        <Youtube className="w-5 h-5" />
                    </a>
                    <a href="mailto:dokojan.info@gmail.com" className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors border border-slate-100">
                        <Mail className="w-5 h-5" />
                    </a>
                </div>
                <div className="mb-6">
                    <Link href="/privacy" className="text-sm text-slate-500 hover:text-foreground transition-colors hover:underline underline-offset-4">
                        プライバシーポリシー・免責事項
                    </Link>
                </div>
                <p className="text-sm text-slate-500 font-medium">
                    &copy; {new Date().getFullYear()} {side === "rikiya" ? "Rikiya Matsushima (Mahjong RDX)" : "Narwa Richiko (AI VTuber)"}. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
