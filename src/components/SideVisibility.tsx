"use client";

import { useSide } from "@/context/SideContext";
import { ReactNode } from "react";

export function RikiyaOnly({ children }: { children: ReactNode }) {
    const { side } = useSide();
    if (side !== "rikiya") return null;
    return <>{children}</>;
}
