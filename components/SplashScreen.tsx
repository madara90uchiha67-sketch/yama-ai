"use client";
import React, { useEffect, useState } from "react";

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [stage, setStage] = useState<"light" | "reveal" | "fadeout">("light");

  useEffect(() => {
    const t1 = setTimeout(() => setStage("reveal"), 900);   // la luz llega al centro
    const t2 = setTimeout(() => setStage("fadeout"), 3400);  // empieza a desvanecer
    const t3 = setTimeout(() => onFinish(), 4000);           // entra la app
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinish]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "#000",
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden", zIndex: 9999,
        opacity: stage === "fadeout" ? 0 : 1,
        transition: "opacity 0.6s ease",
      }}
    >
      <style>{`
        @keyframes yama-light-travel {
          0% { transform: translateX(60vw) scale(0.3); opacity: 0; }
          60% { opacity: 1; }
          100% { transform: translateX(0) scale(1); opacity: 1; }
        }
        @keyframes yama-orb-in {
          0% { opacity: 0; transform: scale(0.7); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes yama-text-in {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Luz que viaja desde la derecha */}
      <div
        style={{
          position: "absolute",
          width: 340, height: 340, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.25) 45%, rgba(255,255,255,0) 72%)",
          animation: "yama-light-travel 0.9s cubic-bezier(0.16,1,0.3,1) forwards",
          filter: "blur(2px)",
        }}
      />

      {/* Logo: esfera negra + aura */}
      <div
        style={{
          position: "relative", display: "flex", flexDirection: "column",
          alignItems: "center", gap: 22,
          opacity: stage === "light" ? 0 : 1,
          animation: stage !== "light" ? "yama-orb-in 0.6s ease forwards" : "none",
        }}
      >
        <div style={{ position: "relative", width: 120, height: 120 }}>
          <div style={{
            position: "absolute", inset: -30, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 70%)",
          }} />
          <div style={{
            width: "100%", height: "100%", borderRadius: "50%",
            background: "radial-gradient(circle at 32% 28%, #3a3a38 0%, #111 45%, #000 75%)",
            boxShadow: "0 0 40px rgba(255,255,255,0.25), inset -8px -10px 20px rgba(255,255,255,0.05), inset 6px 8px 18px rgba(0,0,0,0.7)",
          }} />
        </div>

        <div style={{
          textAlign: "center",
          opacity: 0,
          animation: stage !== "light" ? "yama-text-in 0.7s ease 0.3s forwards" : "none",
        }}>
          <div style={{ color: "#fff", fontSize: 22, letterSpacing: "0.25em", fontFamily: "Georgia, serif" }}>YAMA</div>
          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 10, letterSpacing: "0.22em", marginTop: 8, fontFamily: "'Inter', sans-serif" }}>
            AI FOR CREATORS &amp; FOUNDERS
          </div>
        </div>
      </div>
    </div>
  );
}
