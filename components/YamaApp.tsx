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

/* Barra de abajo: solo Inicio y Chat */
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

/* Pantalla flotante de Configuración: envuelve PanelView con animación */
function SettingsModal({ open, onClose, children }: any) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        display: "flex", alignItems: "flex-end",
        background: "rgba(36,31,24,0.35)",
        animation: "yama-modal-backdrop-in 0.25s ease",
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes yama-modal-backdrop-in { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes yama-modal-sheet-in { 0% { transform: translateY(100%); } 100% { transform: translateY(0); } }
      `}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: COLORS.bg,
          width: "100%",
          maxHeight: "88vh",
          borderRadius: "24px 24px 0 0",
          overflowY: "auto",
          animation: "yama-modal-sheet-in 0.3s cubic-bezier(0.16,1,0.3,1)",
          display: "flex",
          flexDirection: "column",
        }}
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

/* ---------------- HOME ---------------- */
const HOME_COLORS = {
  bg: "#F6EEE0",
  surface: "#FFFBF3",
  line: "#E4D8C3",
  ink: "#241F18",
  muted: "#8C7F68",
  metallic: "linear-gradient(135deg, #E8D9B5, #FFF6E0, #C9AF7E)",
};

function HomeView({ setView, setChatMode, memory, plan, onUpgrade, onOpenSettings }: any) {
  const options = [
    { id: "content", icon: PenSquare, title: "Crear contenido", desc: "Guiones, ideas, edición y estrategia.", go: () => { setChatMode("content"); setView("chat"); } },
    { id: "strategy", icon: TrendingUp, title: "Estrategia", desc: "Marketing, crecimiento y negocios.", go: () => setView("strategist") },
    { id: "idea", icon: Lightbulb, title: "Ideas", desc: "Generación de oportunidades y conceptos.", go: () => { setChatMode("idea"); setView("chat"); } },
    { id: "challenge", icon: Flame, title: "Reto diario", desc: "20 sugerencias para mejorar hoy.", go: () => setView("challenges") },
  ];
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: HOME_COLORS.bg, animation: "yama-home-in 0.5s ease", position: "relative" }}>
      <style>{`
        @keyframes yama-home-in {
          0% { opacity: 0; transform: translateY(14px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes yama-row-in {
          0% { opacity: 0; transform: translateX(-8px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        .yama-home-row {
          transition: background 0.15s ease;
        }
        .yama-home-row:active {
          background: rgba(140,127,104,0.08);
        }
      `}</style>
      <button
        onClick={onOpenSettings}
        aria-label="Configuración"
        style={{
          position: "absolute", top: 18, right: 16, zIndex: 5,
          width: 38, height: 38, borderRadius: "50%",
          border: `1px solid ${HOME_COLORS.line}`, background: HOME_COLORS.surface,
          color: HOME_COLORS.ink, display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <Settings size={17} />
      </button>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 24px 30px", textAlign: "center" }}>
        <div style={{ fontFamily: sansFont, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: HOME_COLORS.muted, marginBottom: 22 }}>{memory?.brand || "YAMA AI"}</div>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", inset: -30, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,175,126,0.25) 0%, rgba(201,175,126,0) 70%)" }} />
          <CoreOrb size={120} />
        </div>
        <div style={{ fontSize: 24, marginTop: 24, fontWeight: 500, fontFamily: serifFont, color: HOME_COLORS.ink }}>¿Qué vamos a crear hoy?</div>
        <div style={{ width: 36, height: 2, borderRadius: 2, background: HOME_COLORS.metallic, marginTop: 12 }} />
        {plan === "FREE" && (
          <button onClick={onUpgrade} style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 6, border: `1px solid ${HOME_COLORS.line}`, background: HOME_COLORS.surface, borderRadius: 20, padding: "8px 16px", fontFamily: sansFont, fontSize: 12.5, cursor: "pointer", color: HOME_COLORS.ink }}>
            <Crown size={13} /> Mejorar a Pro
          </button>
        )}
      </div>
      <div style={{ flex: 1, padding: "0 18px 24px" }}>
        <div style={{ background: HOME_COLORS.surface, borderRadius: 18, border: `1px solid ${HOME_COLORS.line}`, overflow: "hidden", boxShadow: "0 4px 18px rgba(140,127,104,0.10)" }}>
          {options.map((o, i) => {
            const Icon = o.icon;
            return (
              <button
                key={o.id}
                onClick={o.go}
                className="yama-home-row"
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "16px 16px",
                  background: "transparent",
                  border: "none",
                  borderBottom: i < options.length - 1 ? `1px solid ${HOME_COLORS.line}` : "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: sansFont,
                  animation: `yama-row-in 0.4s ease ${i * 0.07}s both`,
                }}
              >
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: HOME_COLORS.metallic, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={16} strokeWidth={1.8} color={HOME_COLORS.ink} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, fontFamily: serifFont, color: HOME_COLORS.ink }}>{o.title}</div>
                  <div style={{ fontSize: 11.5, color: HOME_COLORS.muted, marginTop: 2 }}>{o.desc}</div>
                </div>
                <span style={{ color: HOME_COLORS.muted, fontSize: 18, flexShrink: 0 }}>→</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------- RETO DIARIO ---------------- */
function DailyChallengesView({ onSelect }: any) {
  const [challenges, setChallenges] = useState<string[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/challenges");
        const data = await res.json();
        if (!res.ok) { setError(data.error || "No se pudo cargar tu reto diario."); return; }
        setChallenges(data.challenges);
      } catch {
        setError("No se pudo conectar. Revisa tu conexión.");
      }
    })();
  }, []);

  return (
    <div style={{ flex: 1, overflowY: "auto", background: HOME_COLORS.bg }}>
      <TopBar title="Reto diario" subtitle="20 sugerencias para mejorar hoy" />
      <div style={{ padding: "0 18px 24px" }}>
        {error && <div style={{ color: "#B4433A", fontSize: 12.5, marginBottom: 10, fontFamily: sansFont }}>{error}</div>}
        {!challenges && !error && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0", color: HOME_COLORS.muted, fontFamily: sansFont, fontSize: 13 }}>
            <CoreOrb size={56} active />
            <div style={{ marginTop: 14 }}>Armando tu reto de hoy…</div>
          </div>
        )}
        {challenges && (
          <div style={{ background: HOME_COLORS.surface, borderRadius: 18, border: `1px solid ${HOME_COLORS.line}`, overflow: "hidden", boxShadow: "0 4px 18px rgba(140,127,104,0.10)" }}>
            {challenges.map((c, i) => (
              <button
                key={i}
                onClick={() => onSelect(c)}
                className="yama-home-row"
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 16px",
                  background: "transparent",
                  border: "none",
                  borderBottom: i < challenges.length - 1 ? `1px solid ${HOME_COLORS.line}` : "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: sansFont,
                }}
              >
                <span style={{ fontSize: 12, color: HOME_COLORS.muted, flexShrink: 0, width: 20 }}>{i + 1}.</span>
                <span style={{ flex: 1, fontSize: 13.5, color: HOME_COLORS.ink }}>{c}</span>
                <span style={{ color: HOME_COLORS.muted, fontSize: 16, flexShrink: 0 }}>→</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- CHAT ---------------- */
const MODE_LABEL: Record<string, string> = { idea: "Pensar una idea", story: "Crear una historia", content: "Crear contenido", free: "Chat con YAMA" };

function ChatView({ chatMode, plan, initialMessage, onInitialMessageSent }: any) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [listening, setListening] = useState(false);
  const [micError, setMicError] = useState("");
  const [speakOn, setSpeakOn] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, loading]);

  const speak = useCallback((text: string) => {
    if (!speakOn || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(stripForSpeech(text));
    u.lang = "es-ES";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }, [speakOn]);

  const send = useCallback(async (text: string) => {
    const content = text.trim();
    if (!content) return;
    setMessages((m) => [...m, { role: "user", content }]);
    setInput(""); setLoading(true); setError("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, mode: chatMode, content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError((data.error || "Ocurrió un error.") + (data.debug ? " — " + data.debug : ""));
        setMessages((m) => m.slice(0, -1));
        return;
      }
      setConversationId(data.conversationId);
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
      speak(data.reply);
    } catch {
      setError("No pude conectarme. Revisa tu conexión.");
      setMessages((m) => m.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }, [conversationId, chatMode, speak]);

  // Si venimos del Reto diario (u otra pantalla) con un mensaje ya listo,
  // lo mandamos automáticamente una sola vez al entrar al chat.
  useEffect(() => {
    if (initialMessage) {
      send(initialMessage);
      onInitialMessageSent?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessage]);

  const toggleListen = async () => {
    setMicError("");
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setMicError("Este navegador no soporta dictado por voz."); return; }
    if (listening) { try { recognitionRef.current?.stop(); } catch {} setListening(false); return; }
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
      }
    } catch { setMicError("Activa el permiso de micrófono en tu navegador."); return; }
    try {
      const rec = new SR();
      rec.lang = "es-ES"; rec.interimResults = false;
      rec.onresult = (ev: any) => setInput((p) => (p ? p + " " + ev.results[0][0].transcript : ev.results[0][0].transcript));
      rec.onend = () => setListening(false);
      rec.onerror = (ev: any) => { setListening(false); setMicError(ev.error === "not-allowed" ? "Activa el permiso de micrófono." : "No se pudo usar el micrófono."); };
      recognitionRef.current = rec; rec.start(); setListening(true);
    } catch { setListening(false); setMicError("No se pudo iniciar el micrófono."); }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: HOME_COLORS.bg }}>
      <style>{`
        @keyframes yama-chat-empty-in { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes yama-bubble-in { 0% { opacity: 0; transform: translateY(6px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes yama-think-dot { 0%,80%,100% { opacity: 0.25; transform: scale(0.85); } 40% { opacity: 1; transform: scale(1); } }
      `}</style>

      <div style={{ padding: "22px 20px 14px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", borderBottom: `1px solid ${HOME_COLORS.line}` }}>
        <div>
          <div style={{ fontFamily: sansFont, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: HOME_COLORS.muted, marginBottom: 4 }}>YAMA AI</div>
          <div style={{ fontSize: 21, fontWeight: 500, fontFamily: serifFont, color: HOME_COLORS.ink }}>{MODE_LABEL[chatMode] || "Chat con YAMA"}</div>
          <div style={{ fontFamily: sansFont, fontSize: 13, color: HOME_COLORS.muted, marginTop: 2 }}>{plan === "FREE" ? "Plan gratuito" : "Plan Pro"}</div>
        </div>
        <button onClick={() => setSpeakOn((v) => !v)} aria-label="Leer en voz alta" style={{ width: 38, height: 38, borderRadius: "50%", border: `1px solid ${HOME_COLORS.line}`, background: speakOn ? HOME_COLORS.ink : HOME_COLORS.surface, color: speakOn ? "#fff" : HOME_COLORS.ink, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
          {speakOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>

      {(micError || error) && (
        <div style={{ margin: "10px 18px 0", padding: "9px 12px", borderRadius: 10, background: "#F6E4DC", color: "#8A3B2E", fontFamily: sansFont, fontSize: 12.5 }}>{micError || error}</div>
      )}

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
  }
        
