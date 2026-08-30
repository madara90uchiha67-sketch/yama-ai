"use client";
import React, { useEffect, useState } from "react";

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [stage, setStage] = useState<"in" | "hold" | "fadeout">("in");

  useEffect(() => {
    const t1 = setTimeout(() => setStage("hold"), 700);
    const t2 = setTimeout(() => setStage("fadeout"), 2600);
    const t3 = setTimeout(() => onFinish(), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinish]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "#0A0A09",
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: stage === "fadeout" ? 0 : 1,
        transition: "opacity 0.5s ease",
      }}
    >
      <style>{`
        @keyframes yama-spring-in {
          0% { opacity: 0; transform: scale(0.92); filter: blur(10px); }
          60% { opacity: 1; transform: scale(1.05); filter: blur(0px); }
          100% { opacity: 1; transform: scale(1); filter: blur(0px); }
        }
      `}</style>

      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 88, height: 88, borderRadius: "50%", margin: "0 auto 24px",
            background: "radial-gradient(circle at 32% 28%, #4a4a48 0%, #17171666 38%, #0c0c0b 72%)",
            boxShadow: "0 0 36px rgba(255,255,255,0.12), inset -6px -8px 16px rgba(255,255,255,0.06), inset 6px 8px 16px rgba(0,0,0,0.55)",
            opacity: 0,
            animation: "yama-spring-in 550ms cubic-bezier(0.34, 1.56, 0.64, 1) 0ms forwards",
          }}
        />
        <div
          style={{
            fontFamily: "'Iowan Old Style', Georgia, ui-serif, serif",
            fontSize: 26, letterSpacing: "0.3em", color: "#FFF8EA",
            opacity: 0,
            animation: "yama-spring-in 500ms cubic-bezier(0.34, 1.56, 0.64, 1) 150ms forwards",
          }}
        >
          YAMA
        </div>
        <div
          style={{
            fontFamily: "'Inter', ui-sans-serif, sans-serif",
            fontSize: 10, letterSpacing: "0.22em", color: "rgba(255,248,234,0.55)", marginTop: 8,
            opacity: 0,
            animation: "yama-spring-in 500ms cubic-bezier(0.34, 1.56, 0.64, 1) 280ms forwards",
          }}
        >
          AI FOR CREATORS &amp; FOUNDERS
        </div>
      </div>
    </div>
  );
}
