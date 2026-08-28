"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Brain, Film, TrendingUp, PenSquare, Send, Mic, MicOff, Home, MessageCircle,
  Compass, LayoutGrid, Sparkles, Target, Lightbulb, Rocket, Volume2, VolumeX,
  Loader2, Settings, X, LogOut, Crown, Flame,
} from "lucide-react";

const COLORS = { bg: "#FAFAF8", surface: "#FFFFFF", line: "#E6E4DF", ink: "#141412", muted: "#8B8880" };
const sansFont = "'Inter', ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const serifFont = "'Iowan Old Style', Georgia, ui-serif, serif";

function stripForSpeech(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1").replace(/_(.*?)_/g, "$1")
    .replace(/`{1,3}(.*?)`{1,3}/g, "$1").replace(/^#{1,6}\s+/gm, "").replace(/^[-•]\s+/gm, "")
    .replace(/[*_#`~]/g, "").trim();
}

function CoreOrb({ size = 132, active = false }) {
  return (
    <div style={{ width: size, height: size, position: "relative" }} aria-hidden="true">
      <style>{`
        @keyframes yama-breathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.035); } }
        @keyframes yama-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes yama-pulse { 0%,100% { opacity: .55; } 50% { opacity: .9; } }
        @media (prefers-reduced-motion: reduce) { .yama-orb-core,.yama-orb-ring,.yama-orb-glow{animation:none!important;} }
      `}</style>
      <div style={{ position: "absolute", inset: -18, borderRadius: "50%", background: "radial-gradient(circle, rgba(17,17,17,0.10) 0%, rgba(17,17,17,0) 70%)", animation: `yama-pulse ${active ? 1.6 : 3.6}s ease-in-out infinite` }} />
      <div style={{ position: "absolute", inset: -8, borderRadius: "50%", border: "1px solid rgba(17,17,17,0.14)", animation: `yama-rotate ${active ? 10 : 22}s linear infinite`, borderTopColor: "rgba(17,17,17,0.35)" }} />
      <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "radial-gradient(circle at 32% 28%, #4a4a48 0%, #17171666 38%, #0c0c0b 72%)", boxShadow: "inset -10px -14px 26px rgba(255,255,255,0.06), inset 8px 10px 22px rgba(0,0,0,0.55), 0 18px 30px rgba(17,17,17,0.18)", animation: `yama-breathe ${active ? 1.4 : 4.2}s ease-in-out infinite` }} />
    </div>
  );
}

function IconButton({ children, onClick, label, active }: any) {
  return (
    <button onClick={onClick} aria-label={label} style={{ width: 38, height: 38, borderRadius: "50%", border: `1px solid ${COLORS.line}`, background: active ? COLORS.ink : COLORS.surface, color: active ? "#fff" : COLORS.ink, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
      {children}
    </button>
  );
}

function TopBar({ title, subtitle, right }: any) {
  return (
    <div style={{ padding: "22px 20px 14px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
      <div>
        <div style={{ fontFamily: sansFont, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: COLORS.muted, marginBottom: 4 }}>YAMA AI</div>
        <div style={{ fontSize: 21, fontWeight: 500, fontFamily: serifFont }}>{title}</div>
        {subtitle && <div style={{ fontFamily: sansFont, fontSize: 13, color: COLORS.muted, marginTop: 2 }}>{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}

function BottomNav({ view, setView }: any) {
  const items = [
    { id: "home", label: "Inicio", icon: Home },
    { id: "chat", label: "Chat", icon: MessageCircle },
  ];
  return (
    <div style={{ display: "flex", borderTop: `1px solid ${COLORS.line}`, background: COLORS.surface, padding: "8px 6px calc(env(safe-area-inset-bottom, 0px) + 8px)", fontFamily: sansFont }}>
      {items.map((it) => {
        const Icon = it.icon;
        const isActive = view === it.id;
        return (
          <button key={it.id} onClick={() => setView(it.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 0 4px", background: "none", border: "none", cursor: "pointer", color: isActive ? COLORS.ink : COLORS.muted }}>
            <Icon size={19} strokeWidth={isActive ? 2.3 : 1.7} />
            <span style={{ fontSize: 10.5 }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function SettingsModal({ open, onClose, children }: any) {
  if (!open) return null;
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "flex-end", background: "rgba(36,31,24,0.35)", animation: "yama-modal-backdrop-in 0.25s ease" }}
      onClick={onClose}
    >
      <style>{`
        @keyframes yama-modal-backdrop-in { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes yama-modal-sheet-in { 0% { transform: translateY(100%); } 100% { transform: translateY(0); } }
      `}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: COLORS.bg, width: "100%", maxHeight: "88vh", borderRadius: "24px 24px 0 0", overflowY: "auto", animation: "yama-modal-sheet-in 0.3s cubic-bezier(0.16,1,0.3,1)", display: "flex", flexDirection: "column" }}
      >
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 0" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: COLORS.line }} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 14px 0" }}>
          <button onClick={onClose} aria-label="Cerrar" style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: COLORS.surface, color: COLORS.ink, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const MODE_LABEL: Record<string, string> = { idea: "Pensar una idea", story: "Crear una historia", content: "Crear contenido", free: "Chat con YAMA" };

/* Pantalla flotante del Historial de chats */
function HistoryModal({ open, onClose, onSelectConversation }: any) {
  const [conversations, setConversations] = useState<any[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setConversations(null);
    setError("");
    (async () => {
      try {
        const res = await fetch("/api/conversations");
        const data = await res.json();
        if (!res.ok) { setError(data.error || "No se pudo cargar el historial."); return; }
        setConversations(data.conversations);
      } catch {
        setError("No se pudo conectar. Revisa tu conexión.");
      }
    })();
  }, [open]);

  if (!open) return null;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es", { day: "numeric", month: "short" });
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "flex-end", background: "rgba(36,31,24,0.35)", animation: "yama-modal-backdrop-in 0.25s ease" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: HOME_COLORS.bg, width: "100%", maxHeight: "80vh", borderRadius: "24px 24px 0 0", overflowY: "auto", animation: "yama-modal-sheet-in 0.3s cubic-bezier(0.16,1,0.3,1)", display: "flex", flexDirection: "column" }}
      >
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 0" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: HOME_COLORS.line }} />
        </div>
        <TopBar title="Historial" subtitle="Tus conversaciones anteriores" right={
          <button onClick={onClose} aria-label="Cerrar" style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: HOME_COLORS.surface, color: HOME_COLORS.ink, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={16} />
          </button>
        } />
        <div style={{ padding: "0 18px 24px" }}>
          {error && <div style={{ color: "#B4433A", fontSize: 12.5, marginBottom: 10, fontFamily: sansFont }}>{error}</div>}
          {!conversations && !error && (
            <div style={{ display: "flex", justifyContent: "center", padding: "30px 0" }}>
              <CoreOrb size={40} active />
            </div>
          )}
          {conversations && conversations.length === 0 && (
            <div style={{ textAlign: "center", color: HOME_COLORS.muted, fontFamily: sansFont, fontSize: 13, padding: "30px 0" }}>
              Todavía no tienes conversaciones guardadas.
            </div>
          )}
          {conversations && conversations.length > 0 && (
            <div style={{ background: HOME_COLORS.surface, borderRadius: 18, border: `1px solid ${HOME_COLORS.line}`, overflow: "hidden" }}>
              {conversations.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => onSelectConversation(c.id)}
                  className="yama-home-row"
                  style={{ width: "100%", display: "flex", flexDirection: "column", gap: 4, padding: "14px 16px", background: "transparent", border: "none", borderBottom: i < conversations.length - 1 ? `1px solid ${HOME_COLORS.line}` : "none", cursor: "pointer", textAlign: "left", fontFamily: sansFont }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontSize: 11, color: HOME_COLORS.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{MODE_LABEL[c.mode] || "Chat"}</span>
                    <span style={{ fontSize: 11, color: HOME_COLORS.muted, flexShrink: 0 }}>{formatDate(c.updatedAt)}</span>
                  </div>
                  <div style={{ fontSize: 13.5, color: HOME_COLORS.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.preview}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
