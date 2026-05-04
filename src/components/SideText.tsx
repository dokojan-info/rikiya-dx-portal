"use client";

import { useSide } from "@/context/SideContext";

interface SideTextProps {
  rikiya: React.ReactNode;
  richiko: React.ReactNode;
}

export default function SideText({ rikiya, richiko }: SideTextProps) {
  const { side } = useSide();
  return <>{side === "rikiya" ? rikiya : richiko}</>;
}
