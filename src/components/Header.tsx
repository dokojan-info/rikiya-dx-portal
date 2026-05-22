"use client";

import Link from "next/link";
import { User, Activity, Box, Edit3, Repeat } from "lucide-react";
import { useSide } from "@/context/SideContext";
import Image from "next/image";

export default function Header() {
    const { toggleSide, side } = useSide();

    const handleToggle = (e: React.MouseEvent) => {
        toggleSide(e.clientX, e.clientY);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md print:hidden">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/images/logo.webp"
                        alt="Mahjong RDX"
                        width={120}
                        height={32}
                        className="h-8 w-auto object-contain"
                        priority
                    />
                    {side === "richiko" && (
                        <span className="text-primary font-bold text-sm bg-primary/10 px-2 py-0.5 rounded-full">
                            Richiko Side
                        </span>
                    )}
                </Link>
                <div className="flex items-center gap-4">
                    <nav className="hidden md:flex items-center gap-6 mr-4">
                        <Link href="/#apps" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors flex items-center gap-2">
                            <Box className="w-4 h-4" /> Apps
                        </Link>
                        <Link href="/#notes" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors flex items-center gap-2">
                            <Edit3 className="w-4 h-4" /> Notes
                        </Link>
                        <Link href="/#profile" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors flex items-center gap-2">
                            <User className="w-4 h-4" /> Profile
                        </Link>
                        <Link href="/#activity" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors flex items-center gap-2">
                            <Activity className="w-4 h-4" /> Activity
                        </Link>
                    </nav>

                    <button
                        onClick={handleToggle}
                        className={`
                            px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all active:scale-95
                            ${side === "rikiya" 
                                ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200" 
                                : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"}
                        `}
                    >
                        <Repeat className="w-4 h-4" />
                        {side === "rikiya" ? "Richiko Side" : "Rikiya Side"}
                    </button>
                </div>
            </div>
        </header>
    );
}
