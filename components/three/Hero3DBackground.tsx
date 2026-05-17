
"use client";
import SolarSystem from "./SolarSystem";
import { useRef, useEffect } from "react";

interface Hero3DBackgroundProps {
  setActive?: (name: string | null) => void;
  onHover?: (name: string | null) => void;
  onFocus?: (name: string) => void;
  onBack?: () => void;
  focusedPlanet?: string | null;
  isTourActive?: boolean;
  onTourStateChange?: (active: boolean) => void;
}

export default function Hero3DBackground({
  setActive,
  onHover,
  onFocus,
  onBack,
  focusedPlanet,
  isTourActive,
  onTourStateChange,
}: Hero3DBackgroundProps) {
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      mouse.current.x = e.clientX / window.innerWidth - 0.5;
      mouse.current.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    // NO pointer-events:none — SolarSystem needs all mouse and wheel events
    <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
      <SolarSystem
        setActive={setActive}
        onHover={onHover}
        onFocus={onFocus}
        onBack={onBack}
        focusedPlanet={focusedPlanet}
        isTourActive={isTourActive}
        onTourStateChange={onTourStateChange}
        mouse={mouse}
      />
    </div>
  );
}