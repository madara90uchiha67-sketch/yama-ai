"use client";
import React, { useEffect, useState } from "react";

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  angle: (360 / 12) * i,
  delay: (i % 4) * 80,
}));

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [stage, setStage] = useState<"gather" | "reveal" | "hold" | "fadeout">("gather");

  useEffect(() => {
    const t1 = setTimeout(() => setStage("reveal"), 1200);
    const t2 = setTimeout(() => setStage("hold"), 1900);
    const t3 = setTimeout(() => setStage("fadeout"), 3600);
    const t4 = setTimeout(() => onFinish(), 4200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onFinish]);

  const revealed = stage === "reveal" || stage === "hold" || stage === "fadeout";

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "#000000",
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden",
        opacity: stage === "fadeout" ? 0 : 1,
        transition: "opacity 0.6s ease",
      }}
    >
      <style>{`
        @keyframes yama-core-pulse {
          0% { opacity: 0.15; transform: scale(0.8); }
          50% { opacity: 0.55; transform: scale(1.15); }
          100% { opacity: 0.35; transform: scale(1); }
        }
        @keyframes yama-particle-in {
          0% { transform: translateX(70px); opacity: 0; }
          60% { opacity: 1; }
          100% { transform: translateX(0px); opacity: 0; }
        }
        @keyframes yama-logo-reveal {
          0% { opacity: 0; transform: scale(0.7); filter: blur(8px); }
          70% { opacity: 1; transform: scale(1.06); filter: blur(0px); }
          100% { opacity: 1; transform: scale(1); filter: blur(0px); }
        }
        @keyframes yama-glow-breathe {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.55; transform: scale(1.08); }
        }
        @keyframes yama-text-in {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Resplandor central azul, siempre presente, pulsando */}
      <div
        style={{
          position: "absolute", width: 340, height: 340, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(60,140,255,0.45) 0%, rgba(40,100,220,0.15) 45%, rgba(0,0,0,0) 75%)",
          filter: "blur(6px)",
          animation: "yama-core-pulse 2.4s ease-in-out infinite",
        }}
      />

      {/* Partículas de luz convergiendo hacia el centro, una por ángulo */}
      {!revealed && PARTICLES.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 0, height: 0,
            transform: `rotate(${p.angle}deg)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 5, height: 5, borderRadius: "50%",
              background: "#7FC4FF",
              boxShadow: "0 0 8px 2px rgba(127,196,255,0.9)",
              animation: `yama-particle-in 1.1s ease-in ${p.delay}ms forwards`,
            }}
          />
        </div>
      ))}

      {/* Logo real, revelado con halo azul */}
      <div
        style={{
          position: "relative", zIndex: 2, textAlign: "center",
          opacity: revealed ? 1 : 0,
          animation: revealed ? "yama-logo-reveal 0.7s cubic-bezier(0.16,1,0.3,1) forwards" : "none",
        }}
      >
        <div style={{ position: "relative", width: 100, height: 100, margin: "0 auto 22px" }}>
          <div
            style={{
              position: "absolute", inset: -26, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(90,160,255,0.5) 0%, rgba(90,160,255,0) 70%)",
              animation: "yama-glow-breathe 2.6s ease-in-out infinite",
            }}
          />
          <img src="/icon-512.png" alt="YAMA" style={{ width: "100%", height: "100%", position: "relative", zIndex: 1 }} />
        </div>
        <div
          style={{
            fontFamily: "'Iowan Old Style', Georgia, ui-serif, serif",
            fontSize: 24, letterSpacing: "0.3em", color: "#EAF3FF",
            opacity: 0,
            animation: revealed ? "yama-text-in 0.6s ease 0.3s forwards" : "none",
          }}
        >
          YAMA
        </div>
        <div
          style={{
            fontFamily: "'Inter', ui-sans-serif, sans-serif",
            fontSize: 10, letterSpacing: "0.22em", color: "rgba(180,210,255,0.6)", marginTop: 8,
            opacity: 0,
            animation: revealed ? "yama-text-in 0.6s ease 0.45s forwards" : "none",
          }}
        >
          AI FOR CREATORS &amp; FOUNDERS
        </div>
      </div>
    </div>
  );
}
