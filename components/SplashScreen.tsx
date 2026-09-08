"use client";
import React, { useEffect, useState } from "react";

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [stage, setStage] = useState<"slide" | "settled" | "fadeout">("slide");

  useEffect(() => {
    const t1 = setTimeout(() => setStage("settled"), 1000);
    const t2 = setTimeout(() => setStage("fadeout"), 3200);
    const t3 = setTimeout(() => onFinish(), 3800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinish]);

  const settled = stage === "settled" || stage === "fadeout";

  const Logo = ({ opacity = 1 }: { opacity?: number }) => (
    <div style={{ position: "relative", width: 100, height: 100, opacity }}>
      <div
        style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.5) 55%, rgba(255,255,255,0) 78%)",
        }}
      />
      <div
        style={{
          position: "absolute", inset: 22, borderRadius: "50%",
          background: "radial-gradient(circle at 32% 28%, #4a4a48 0%, #17171666 38%, #0c0c0b 72%)",
          boxShadow: "inset -6px -8px 16px rgba(255,255,255,0.06), inset 5px 7px 14px rgba(0,0,0,0.6)",
        }}
      />
    </div>
  );

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "#000000",
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden",
        opacity: stage === "fadeout" ? 0 : 1,
        transition: "opacity 0.5s ease",
      }}
    >
      <style>{`
        @keyframes yama-slide-in {
          0% { transform: translateX(-160%); }
          65% { transform: translateX(6%); }
          100% { transform: translateX(0%); }
        }
        @keyframes yama-echo-fade {
          0% { opacity: 0.35; }
          100% { opacity: 0; }
        }
        @keyframes yama-text-in {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Copias "eco" del logo, desfasadas en tiempo, que se desvanecen rápido detrás del logo principal */}
      {!settled && [0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            animation: `yama-slide-in 0.85s cubic-bezier(0.22,0.9,0.32,1) ${i * 60}ms both, yama-echo-fade 0.5s ease ${i * 60 + 300}ms forwards`,
          }}
        >
          <Logo opacity={0.3 - i * 0.08} />
        </div>
      ))}

      {/* Logo principal */}
      <div
        style={{
          position: "absolute",
          animation: "yama-slide-in 0.85s cubic-bezier(0.22,0.9,0.32,1) forwards",
        }}
      >
        <Logo />
      </div>

      {/* Texto, aparece una vez que el logo ya se asentó */}
      <div
        style={{
          position: "absolute", top: "62%", left: "50%",
          transform: "translate(-50%, 0)",
          textAlign: "center",
          opacity: 0,
          animation: settled ? "yama-text-in 0.5s ease 0.1s forwards" : "none",
        }}
      >
        <div style={{ fontFamily: "'Iowan Old Style', Georgia, ui-serif, serif", fontSize: 22, letterSpacing: "0.3em", color: "#fff" }}>
          YAMA
        </div>
        <div style={{ fontFamily: "'Inter', ui-sans-serif, sans-serif", fontSize: 9.5, letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)", marginTop: 6 }}>
          AI FOR CREATORS &amp; FOUNDERS
        </div>
      </div>
    </div>
  );
}
