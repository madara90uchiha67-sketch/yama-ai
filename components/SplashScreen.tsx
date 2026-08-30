"use client";
import React, { useEffect, useState } from "react";

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [stage, setStage] = useState<"closed" | "opening" | "revealed" | "fadeout">("closed");

  useEffect(() => {
    const t1 = setTimeout(() => setStage("opening"), 500);   // empieza a abrirse
    const t2 = setTimeout(() => setStage("revealed"), 1500); // ya abierto, logo visible
    const t3 = setTimeout(() => setStage("fadeout"), 3600);  // empieza a desvanecer
    const t4 = setTimeout(() => onFinish(), 4200);           // entra la app
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onFinish]);

  const isOpening = stage === "opening" || stage === "revealed" || stage === "fadeout";
  const isRevealed = stage === "revealed" || stage === "fadeout";

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        overflow: "hidden", background: "#0A0A09",
        opacity: stage === "fadeout" ? 0 : 1,
        transition: "opacity 0.6s ease",
      }}
    >
      <style>{`
        @keyframes yama-line-pulse {
          0%, 100% { transform: scaleX(1); opacity: 0.9; }
          50% { transform: scaleX(1.03); opacity: 1; }
        }
        @keyframes yama-logo-in {
          0% { opacity: 0; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes yama-text-in {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Fondo beige que se revela detrás de la apertura */}
      <div style={{ position: "absolute", inset: 0, background: "#F6EEE0" }} />

      {/* Panel superior negro: se retrae hacia arriba */}
      <div
        style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "50%",
          background: "#0A0A09",
          transform: isOpening ? "translateY(-100%)" : "translateY(0)",
          transition: "transform 1.1s cubic-bezier(0.76, 0, 0.24, 1)",
        }}
      />

      {/* Panel inferior negro: se retrae hacia abajo */}
      <div
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "50%",
          background: "#0A0A09",
          transform: isOpening ? "translateY(100%)" : "translateY(0)",
          transition: "transform 1.1s cubic-bezier(0.76, 0, 0.24, 1)",
        }}
      />

      {/* Línea dorada delgada en el centro, antes de abrirse */}
      {stage === "closed" && (
        <div
          style={{
            position: "absolute", top: "50%", left: "50%",
            width: "40%", height: 2,
            background: "linear-gradient(90deg, transparent, #C9AF7E, #FFF6E0, #C9AF7E, transparent)",
            transform: "translate(-50%, -50%)",
            animation: "yama-line-pulse 1.2s ease-in-out infinite",
          }}
        />
      )}

      {/* Logo + texto, aparecen centrados una vez que se abre */}
      <div
        style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          opacity: isRevealed ? 1 : 0,
          animation: isRevealed ? "yama-logo-in 0.6s ease forwards" : "none",
        }}
      >
        <div
          style={{
            width: 84, height: 84, borderRadius: "50%", margin: "0 auto 22px",
            background: "radial-gradient(circle at 32% 28%, #4a4a48 0%, #17171666 38%, #0c0c0b 72%)",
            boxShadow: "0 12px 28px rgba(36,31,24,0.18), inset -6px -8px 16px rgba(255,255,255,0.05), inset 6px 8px 16px rgba(0,0,0,0.5)",
          }}
        />
        <div
          style={{
            fontFamily: "'Iowan Old Style', Georgia, ui-serif, serif",
            fontSize: 26, letterSpacing: "0.3em", color: "#241F18",
            opacity: 0,
            animation: isRevealed ? "yama-text-in 0.6s ease 0.25s forwards" : "none",
          }}
        >
          YAMA
        </div>
        <div
          style={{
            fontFamily: "'Inter', ui-sans-serif, sans-serif",
            fontSize: 10, letterSpacing: "0.22em", color: "#8C7F68", marginTop: 8,
            opacity: 0,
            animation: isRevealed ? "yama-text-in 0.6s ease 0.4s forwards" : "none",
          }}
        >
          AI FOR CREATORS &amp; FOUNDERS
        </div>
      </div>
    </div>
  );
}
