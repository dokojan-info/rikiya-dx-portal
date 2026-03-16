import Link from "next/link";
import { User, Activity, Box, HeartHandshake, Coffee, Edit3 } from "lucide-react";

import Image from "next/image";

export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center">
                    <Image
                        src="/images/logo.webp"
                        alt="Mahjong RDX"
                        width={120}
                        height={32}
                        className="h-8 w-auto object-contain"
                        priority
                    />
                </Link>
                <nav className="hidden md:flex items-center gap-6">
                    <Link href="#apps" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors flex items-center gap-2">
                        <Box className="w-4 h-4" /> Apps
                    </Link>
                    <Link href="#notes" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors flex items-center gap-2">
                        <Edit3 className="w-4 h-4" /> Notes
                    </Link>
                    <Link href="#profile" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors flex items-center gap-2">
                        <User className="w-4 h-4" /> Profile
                    </Link>
                    <Link href="#activity" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Activity
                    </Link>
                    <Link href="#work" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors flex items-center gap-2">
                        <HeartHandshake className="w-4 h-4" /> Work
                    </Link>
                    <Link href="#support" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors flex items-center gap-2">
                        <Coffee className="w-4 h-4" /> Support
                    </Link>
                </nav>
            </div>
        </header>
    );
}
