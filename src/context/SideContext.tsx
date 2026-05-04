"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { flushSync } from "react-dom";

type Side = "rikiya" | "richiko";

interface SideContextType {
  side: Side;
  isTransitioning: boolean;
  toggleSide: (clickX?: number, clickY?: number) => void;
  transitionPoint: { x: number; y: number };
}

const SideContext = createContext<SideContextType | undefined>(undefined);

export function SideProvider({ children }: { children: ReactNode }) {
  const [side, setSide] = useState<Side>("rikiya");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionPoint, setTransitionPoint] = useState({ x: 0, y: 0 });

  const toggleSide = useCallback((clickX?: number, clickY?: number) => {
    if (isTransitioning) return;

    const x = clickX ?? window.innerWidth / 2;
    const y = clickY ?? window.innerHeight / 2;
    
    setTransitionPoint({ x, y });

    const switchTheme = () => setSide((prev) => (prev === "rikiya" ? "richiko" : "rikiya"));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(document as any).startViewTransition) {
      switchTheme();
      return;
    }

    setIsTransitioning(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transition = (document as any).startViewTransition(() => {
      flushSync(() => {
        switchTheme();
      });
    });

    transition.ready.then(() => {
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 600,
          easing: "cubic-bezier(0.65, 0, 0.35, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });

    transition.finished.finally(() => {
      setIsTransitioning(false);
    });
  }, [isTransitioning]);

  return (
    <SideContext.Provider value={{ side, isTransitioning, toggleSide, transitionPoint }}>
      <div data-side={side} className="min-h-screen">
        {children}
      </div>
    </SideContext.Provider>
  );
}

export function useSide() {
  const context = useContext(SideContext);
  if (context === undefined) {
    throw new Error("useSide must be used within a SideProvider");
  }
  return context;
}
