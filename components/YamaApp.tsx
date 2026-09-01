"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Brain, Film, TrendingUp, PenSquare, Send, Mic, MicOff, Home, MessageCircle,
  Compass, LayoutGrid, Sparkles, Target, Lightbulb, Rocket, Volume2, VolumeX,
  Loader2, Settings, X, LogOut, Crown, Flame, MessageCircle as FeedbackIcon,
} from "lucide-react";

// Paleta única, unificada: beige / negro / blanco con acento metálico.
const COLORS = {
  bg: "transparent", // las pantallas dejan ver las olas de fondo detrás
  surface: "#FFFBF3",
  line: "#E4D8C3",
  ink: "#241F18",
  muted: "#8C7F68",
  metallic: "linear-gradient(135deg, #E8D9B5, #FFF6E0, #C9AF7E)",
};
const sansFont = "'Inter', ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const serifFont = "'Iowan Old Style', Georgia, ui-serif, serif";

function stripForSpeech(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1").replace(/_(.*?)_/g, "$1")
    .replace(/`{1,3}(.*?)`{1,3}/g, "$1").replace(/^#{1,6}\s+/gm, "").replace(/^[-•]\s+/gm, "")
    .replace(/[*_#`~]/g, "").trim();
}

/* Fondo de olas: 3 capas fijas, superpuestas, presencia media, sin movimiento */
function WaveBackground() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", background: "#FFFFFF" }} aria-hidden="true">
      <svg
        viewBox="0 0 400 900"
        preserveAspectRatio="none"
        style={{ width: "100%", height: "100%" }}
      >
        {/* Ola 1: beige, la más grande, base */}
        <path
          d="M0,120 C90,180 130,60 220,110 C300,155 340,90 400,130 L400,900 L0,900 Z"
          fill="#F6EEE0"
          opacity="1"
        />
        {/* Ola 2: negro muy tenue, capa media */}
        <path
          d="M0,260 C100,320 160,220 240,270 C310,310 350,250 400,290 L400,900 L0,900 Z"
          fill="#0A0A09"
          opacity="0.05"
        />
        {/* Ola 3: blanco, capa superior, da profundidad */}
        <path
          d="M0,400 C110,470 170,370 250,420 C320,460 360,400 400,440 L400,900 L0,900 Z"
          fill="#FFFFFF"
          opacity="0.6"
        />
      </svg>
    </div>
  );
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
        <div style={{ fontSize: 21, fontWeight: 500, fontFamily: serifFont, color: COLORS.ink }}>{title}</div>
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
      style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", justifyContent: "flex-end", background: "rgba(36,31,24,0.35)", animation: "yama-modal-backdrop-in 0.25s ease" }}
      onClick={onClose}
    >
      <style>{`
        @keyframes yama-modal-backdrop-in { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes yama-panel-in-right { 0% { transform: translateX(100%); } 100% { transform: translateX(0); } }
      `}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#FFFBF3",
          width: "min(420px, 92vw)",
          height: "100%",
          overflowY: "auto",
          animation: "yama-panel-in-right 0.3s cubic-bezier(0.16,1,0.3,1)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-8px 0 30px rgba(36,31,24,0.15)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "14px 14px 0" }}>
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
        style={{ background: "#F6EEE0", width: "100%", maxHeight: "80vh", borderRadius: "24px 24px 0 0", overflowY: "auto", animation: "yama-modal-sheet-in 0.3s cubic-bezier(0.16,1,0.3,1)", display: "flex", flexDirection: "column" }}
      >
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 0" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: COLORS.line }} />
        </div>
        <TopBar title="Historial" subtitle="Tus conversaciones anteriores" right={
          <button onClick={onClose} aria-label="Cerrar" style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: COLORS.surface, color: COLORS.ink, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
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
            <div style={{ textAlign: "center", color: COLORS.muted, fontFamily: sansFont, fontSize: 13, padding: "30px 0" }}>
              Todavía no tienes conversaciones guardadas.
            </div>
          )}
          {conversations && conversations.length > 0 && (
            <div style={{ background: COLORS.surface, borderRadius: 18, border: `1px solid ${COLORS.line}`, overflow: "hidden" }}>
              {conversations.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => onSelectConversation(c.id)}
                  className="yama-home-row"
                  style={{ width: "100%", display: "flex", flexDirection: "column", gap: 4, padding: "14px 16px", background: "transparent", border: "none", borderBottom: i < conversations.length - 1 ? `1px solid ${COLORS.line}` : "none", cursor: "pointer", textAlign: "left", fontFamily: sansFont }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontSize: 11, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{MODE_LABEL[c.mode] || "Chat"}</span>
                    <span style={{ fontSize: 11, color: COLORS.muted, flexShrink: 0 }}>{formatDate(c.updatedAt)}</span>
                  </div>
                  <div style={{ fontSize: 13.5, color: COLORS.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.preview}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- HOME ---------------- */
function HomeView({ setView, setChatMode, memory, plan, onUpgrade, onOpenSettings }: any) {
  const options = [
    { id: "content", icon: PenSquare, title: "Crear contenido", desc: "Guiones, ideas, edición y estrategia.", go: () => { setChatMode("content"); setView("chat"); } },
    { id: "strategy", icon: TrendingUp, title: "Estrategia", desc: "Marketing, crecimiento y negocios.", go: () => setView("strategist") },
    { id: "idea", icon: Lightbulb, title: "Ideas", desc: "Generación de oportunidades y conceptos.", go: () => { setChatMode("idea"); setView("chat"); } },
    { id: "challenge", icon: Flame, title: "Reto diario", desc: "20 sugerencias para mejorar hoy.", go: () => setView("challenges") },
  ];
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: COLORS.bg, animation: "yama-home-in 0.5s ease", position: "relative" }}>
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
          border: `1px solid ${COLORS.line}`, background: COLORS.surface,
          color: COLORS.ink, display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <Settings size={17} />
      </button>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 24px 30px", textAlign: "center" }}>
        <div style={{ fontFamily: sansFont, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: COLORS.muted, marginBottom: 22 }}>{memory?.brand || "YAMA AI"}</div>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", inset: -30, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,175,126,0.25) 0%, rgba(201,175,126,0) 70%)" }} />
          <CoreOrb size={120} />
        </div>
        <div style={{ fontSize: 24, marginTop: 24, fontWeight: 500, fontFamily: serifFont, color: COLORS.ink }}>¿Qué vamos a crear hoy?</div>
        <div style={{ width: 36, height: 2, borderRadius: 2, background: COLORS.metallic, marginTop: 12 }} />
        {plan === "FREE" && (
          <button onClick={onUpgrade} style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 6, border: `1px solid ${COLORS.line}`, background: COLORS.surface, borderRadius: 20, padding: "8px 16px", fontFamily: sansFont, fontSize: 12.5, cursor: "pointer", color: COLORS.ink }}>
            <Crown size={13} /> Mejorar a Pro
          </button>
        )}
      </div>
      <div style={{ flex: 1, padding: "0 18px 24px" }}>
        <div style={{ background: COLORS.surface, borderRadius: 18, border: `1px solid ${COLORS.line}`, overflow: "hidden", boxShadow: "0 4px 18px rgba(140,127,104,0.10)" }}>
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
                  borderBottom: i < options.length - 1 ? `1px solid ${COLORS.line}` : "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: sansFont,
                  animation: `yama-row-in 0.4s ease ${i * 0.07}s both`,
                }}
              >
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: COLORS.metallic, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={16} strokeWidth={1.8} color={COLORS.ink} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, fontFamily: serifFont, color: COLORS.ink }}>{o.title}</div>
                  <div style={{ fontSize: 11.5, color: COLORS.muted, marginTop: 2 }}>{o.desc}</div>
                </div>
                <span style={{ color: COLORS.muted, fontSize: 18, flexShrink: 0 }}>→</span>
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
    <div style={{ flex: 1, overflowY: "auto", background: COLORS.bg }}>
      <TopBar title="Reto diario" subtitle="20 sugerencias para mejorar hoy" />
      <div style={{ padding: "0 18px 24px" }}>
        {error && <div style={{ color: "#B4433A", fontSize: 12.5, marginBottom: 10, fontFamily: sansFont }}>{error}</div>}
        {!challenges && !error && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0", color: COLORS.muted, fontFamily: sansFont, fontSize: 13 }}>
            <CoreOrb size={56} active />
            <div style={{ marginTop: 14 }}>Armando tu reto de hoy…</div>
          </div>
        )}
        {challenges && (
          <div style={{ background: COLORS.surface, borderRadius: 18, border: `1px solid ${COLORS.line}`, overflow: "hidden", boxShadow: "0 4px 18px rgba(140,127,104,0.10)" }}>
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
                  borderBottom: i < challenges.length - 1 ? `1px solid ${COLORS.line}` : "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: sansFont,
                }}
              >
                <span style={{ fontSize: 12, color: COLORS.muted, flexShrink: 0, width: 20 }}>{i + 1}.</span>
                <span style={{ flex: 1, fontSize: 13.5, color: COLORS.ink }}>{c}</span>
                <span style={{ color: COLORS.muted, fontSize: 16, flexShrink: 0 }}>→</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- CHAT ---------------- */
function ChatView({ chatMode, plan, initialMessage, onInitialMessageSent, loadConversationId, onConversationLoaded, onOpenHistory }: any) {
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

  useEffect(() => {
    if (initialMessage) {
      send(initialMessage);
      onInitialMessageSent?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessage]);

  useEffect(() => {
    if (!loadConversationId) return;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/conversations/${loadConversationId}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "No se pudo abrir esa conversación.");
          return;
        }
        setConversationId(data.id);
        setMessages(data.messages);
      } catch {
        setError("No se pudo conectar. Revisa tu conexión.");
      } finally {
        setLoading(false);
        onConversationLoaded?.();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadConversationId]);

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
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: COLORS.bg }}>
      <style>{`
        @keyframes yama-chat-empty-in { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes yama-bubble-in { 0% { opacity: 0; transform: translateY(6px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes yama-think-dot { 0%,80%,100% { opacity: 0.25; transform: scale(0.85); } 40% { opacity: 1; transform: scale(1); } }
      `}</style>

      <div style={{ padding: "22px 20px 14px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", borderBottom: `1px solid ${COLORS.line}` }}>
        <div>
          <div style={{ fontFamily: sansFont, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: COLORS.muted, marginBottom: 4 }}>YAMA AI</div>
          <div style={{ fontSize: 21, fontWeight: 500, fontFamily: serifFont, color: COLORS.ink }}>{MODE_LABEL[chatMode] || "Chat con YAMA"}</div>
          <div style={{ fontFamily: sansFont, fontSize: 13, color: COLORS.muted, marginTop: 2 }}>{plan === "FREE" ? "Plan gratuito" : "Plan Pro"}</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button onClick={onOpenHistory} aria-label="Historial" style={{ width: 38, height: 38, borderRadius: "50%", border: `1px solid ${COLORS.line}`, background: COLORS.surface, color: COLORS.ink, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <LayoutGrid size={16} />
          </button>
          <button onClick={() => setSpeakOn((v) => !v)} aria-label="Leer en voz alta" style={{ width: 38, height: 38, borderRadius: "50%", border: `1px solid ${COLORS.line}`, background: speakOn ? COLORS.ink : COLORS.surface, color: speakOn ? "#fff" : COLORS.ink, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            {speakOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      {(micError || error) && (
        <div style={{ margin: "10px 18px 0", padding: "9px 12px", borderRadius: 10, background: "#F6E4DC", color: "#8A3B2E", fontFamily: sansFont, fontSize: 12.5 }}>{micError || error}</div>
      )}

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.length === 0 && (
          <div style={{ margin: "24px auto", textAlign: "center", color: COLORS.muted, fontFamily: sansFont, fontSize: 13, maxWidth: 320, animation: "yama-chat-empty-in 0.5s ease" }}>
            <div style={{ position: "relative", display: "inline-block" }}>
              <div style={{ position: "absolute", inset: -20, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,175,126,0.25) 0%, rgba(201,175,126,0) 70%)" }} />
              <CoreOrb size={64} />
            </div>
            <div style={{ marginTop: 14, marginBottom: 18 }}>Escribe o habla — YAMA piensa contigo.</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {["Mejorar guion", "Crear ideas", "Hacerlo más viral", "Crear estrategia", "Crear una historia"].map((label) => (
                <button
                  key={label}
                  onClick={() => send(label)}
                  style={{ border: `1px solid ${COLORS.line}`, background: COLORS.surface, color: COLORS.ink, borderRadius: 20, padding: "8px 14px", fontFamily: sansFont, fontSize: 12.5, cursor: "pointer" }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "84%",
              display: "flex",
              gap: 8,
              alignItems: "flex-end",
              animation: "yama-bubble-in 0.3s ease",
            }}
          >
            {m.role === "assistant" && (
              <div style={{ flexShrink: 0, marginBottom: 2 }}>
                <CoreOrb size={26} />
              </div>
            )}
            <div
              style={{
                background: m.role === "user" ? COLORS.ink : COLORS.surface,
                color: m.role === "user" ? "#FFF8EA" : COLORS.ink,
                border: m.role === "user" ? "none" : `1px solid ${COLORS.line}`,
                borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                padding: "11px 14px",
                fontFamily: sansFont,
                fontSize: 14,
                lineHeight: 1.5,
                whiteSpace: "pre-wrap",
                boxShadow: m.role === "assistant" ? "0 2px 10px rgba(140,127,104,0.08)" : "none",
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: "flex-start", display: "flex", gap: 8, alignItems: "center" }}>
            <CoreOrb size={26} />
            <div style={{ display: "flex", gap: 4, background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: "16px 16px 16px 4px", padding: "12px 16px" }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.muted, animation: `yama-think-dot 1.2s ease-in-out ${i * 0.15}s infinite` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, padding: "10px 14px calc(env(safe-area-inset-bottom, 0px) + 10px)", borderTop: `1px solid ${COLORS.line}`, background: COLORS.surface }}>
        <button onClick={toggleListen} style={{ width: 42, height: 42, borderRadius: "50%", border: `1px solid ${COLORS.line}`, background: listening ? COLORS.ink : COLORS.bg, color: listening ? "#fff" : COLORS.ink, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }} aria-label="Hablar">
          {listening ? <MicOff size={17} /> : <Mic size={17} />}
        </button>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send(input)} placeholder="Escribe tu idea…"
          style={{ flex: 1, border: `1px solid ${COLORS.line}`, borderRadius: 21, padding: "0 16px", fontFamily: sansFont, fontSize: 14, background: COLORS.surface, color: COLORS.ink }} />
        <button onClick={() => send(input)} disabled={loading || !input.trim()} style={{ width: 42, height: 42, borderRadius: "50%", border: "none", background: COLORS.ink, color: "#FFF8EA", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: loading || !input.trim() ? 0.4 : 1, flexShrink: 0 }} aria-label="Enviar">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

/* ---------------- STRATEGIST ---------------- */
function StrategistView() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!input.trim() || loading) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/strategist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ input }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "No se pudo completar el análisis."); return; }
      setResult(data.result);
    } catch { setError("No se pudo completar el análisis."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", background: COLORS.bg }}>
      <TopBar title="Modo estratega" subtitle="Ideas, campañas, productos, videos o marcas — analizados." />
      <div style={{ padding: "0 18px 8px" }}>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ej. Quiero lanzar una línea de sudaderas de edición limitada…" rows={3}
          style={{ width: "100%", border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: "12px 14px", fontFamily: sansFont, fontSize: 14, resize: "none", boxSizing: "border-box", background: COLORS.surface, color: COLORS.ink }} />
        <button onClick={analyze} disabled={loading || !input.trim()} style={{ marginTop: 10, width: "100%", padding: 13, borderRadius: 14, border: "none", background: COLORS.ink, color: "#fff", fontFamily: sansFont, fontSize: 14, fontWeight: 600, cursor: "pointer", opacity: loading || !input.trim() ? 0.5 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {loading ? <><Loader2 size={15} style={{ animation: "yama-rotate 1s linear infinite" }} />Analizando…</> : <><Compass size={15} /> Analizar</>}
        </button>
        {error && <div style={{ color: "#B4433A", fontSize: 12.5, marginTop: 8, fontFamily: sansFont }}>{error}</div>}
      </div>
      {result && (
        <div style={{ padding: "10px 18px 24px", fontFamily: sansFont }}>
          {[["Problema", result.problema, Target], ["Oportunidad", result.oportunidad, Lightbulb], ["Estrategia", result.estrategia, Compass]].map(([label, text, Icon]: any) => (
            <div key={label} style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: "14px 16px", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}><Icon size={15} color={COLORS.ink} /><span style={{ fontSize: 12, textTransform: "uppercase", color: COLORS.muted }}>{label}</span></div>
              <div style={{ fontSize: 14, lineHeight: 1.55, color: COLORS.ink }}>{text}</div>
            </div>
          ))}
          <div style={{ background: COLORS.ink, color: "#fff", borderRadius: 14, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Rocket size={15} /><span style={{ fontSize: 12, textTransform: "uppercase", opacity: 0.7 }}>Próximos pasos</span></div>
            <ol style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.7 }}>{(result.proximos_pasos || []).map((p: string, i: number) => <li key={i}>{p}</li>)}</ol>
          </div>
        </div>
      )}
    </div>
  );
}

  /* ---------------- PANEL / CONFIG ---------------- */
function PanelView({ memory, refreshMemory, plan, onUpgrade, onDeleteAccount, onLogout }: any) {
  const [profanityLevel, setProfanityLevel] = useState(memory?.profanityLevel || "none");
  const [personality, setPersonality] = useState(memory?.personality || "");
  const [speakingStyle, setSpeakingStyle] = useState(memory?.speakingStyle || "");
  const [userProfile, setUserProfile] = useState(memory?.userProfile || "");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setProfanityLevel(memory?.profanityLevel || "none");
    setPersonality(memory?.personality || ""); setSpeakingStyle(memory?.speakingStyle || ""); setUserProfile(memory?.userProfile || "");
  }, [memory]);

  const patchSettings = async (body: any) => {
    const res = await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) { setNotice(data.error); return; }
    setNotice("");
    refreshMemory();
  };

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <TopBar title="Configuración" subtitle={memory?.brand || "Tus preferencias"} />
      <div style={{ padding: "0 18px 28px", fontFamily: sansFont }}>
        {plan === "FREE" && (
          <button onClick={onUpgrade} style={{ width: "100%", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, border: "none", background: COLORS.ink, color: "#fff", borderRadius: 12, padding: "12px 16px", fontSize: 13.5, cursor: "pointer" }}>
            <Crown size={14} /> Mejorar a Pro — más mensajes y memoria
          </button>
        )}
        {notice && <div style={{ color: "#B4433A", fontSize: 12.5, marginBottom: 10 }}>{notice}</div>}

        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 16, padding: 16, marginBottom: 12 }}>
          <div style={{ fontFamily: serifFont, fontSize: 15, marginBottom: 10, color: COLORS.ink }}>Personalidad de YAMA</div>
          <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 6 }}>¿Cómo quieres que te hable?</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {[["profesional", "Profesional"], ["directa", "Directa"], ["creativa", "Creativa"], ["mentor", "Mentor"], ["casual", "Casual"]].map(([val, label]) => (
              <button key={val} onClick={() => { setPersonality(val); patchSettings({ personality: val }); }}
                style={{ border: `1px solid ${personality === val ? COLORS.ink : COLORS.line}`, background: personality === val ? COLORS.ink : COLORS.surface, color: personality === val ? "#fff" : COLORS.ink, borderRadius: 16, padding: "6px 12px", fontSize: 12, cursor: "pointer" }}>
                {label}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 6 }}>Forma de hablar</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {[["formal", "Formal"], ["casual", "Casual"], ["personalizada", "Personalizada"]].map(([val, label]) => (
              <button key={val} onClick={() => { setSpeakingStyle(val); patchSettings({ speakingStyle: val }); }}
                style={{ border: `1px solid ${speakingStyle === val ? COLORS.ink : COLORS.line}`, background: speakingStyle === val ? COLORS.ink : COLORS.surface, color: speakingStyle === val ? "#fff" : COLORS.ink, borderRadius: 16, padding: "6px 12px", fontSize: 12, cursor: "pointer" }}>
                {label}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 6 }}>¿Para qué usas YAMA?</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {[["creador", "Creador de contenido"], ["emprendedor", "Emprendedor"], ["marca", "Dueño de marca"], ["freelancer", "Freelancer"], ["estudiante", "Estudiante"]].map(([val, label]) => (
              <button key={val} onClick={() => { setUserProfile(val); patchSettings({ userProfile: val }); }}
                style={{ border: `1px solid ${userProfile === val ? COLORS.ink : COLORS.line}`, background: userProfile === val ? COLORS.ink : COLORS.surface, color: userProfile === val ? "#fff" : COLORS.ink, borderRadius: 16, padding: "6px 12px", fontSize: 12, cursor: "pointer" }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 16, padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3, color: COLORS.ink }}>Nivel de lenguaje</div>
          <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 10 }}>Qué tan crudo puede hablar YAMA en ganchos y contenido.</div>
          <div style={{ display: "flex", gap: 6 }}>
            {[["none", "Ninguno"], ["soft", "Suave"], ["medium", "Medio"], ["high", "Alto"]].map(([val, label]) => (
              <button key={val} onClick={() => { setProfanityLevel(val); patchSettings({ profanityLevel: val }); }}
                style={{ flex: 1, border: `1px solid ${profanityLevel === val ? COLORS.ink : COLORS.line}`, background: profanityLevel === val ? COLORS.ink : COLORS.surface, color: profanityLevel === val ? "#fff" : COLORS.ink, borderRadius: 10, padding: "8px 6px", fontSize: 12, cursor: "pointer" }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 16, padding: 16 }}>
          <div style={{ fontFamily: serifFont, fontSize: 15, marginBottom: 10, color: COLORS.ink }}>Cuenta</div>
          <div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 12 }}>Plan actual: {plan === "FREE" ? "Gratuito" : "Pro"}</div>
          <a
            href="https://wa.me/573505643381?text=Hola%2C%20quiero%20reportar%20algo%20sobre%20YAMA%20AI%3A%20"
            target="_blank"
            rel="noopener noreferrer"
            style={{ width: "100%", marginBottom: 10, border: `1px solid ${COLORS.line}`, background: COLORS.surface, color: COLORS.ink, borderRadius: 10, padding: "10px 12px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, textDecoration: "none", boxSizing: "border-box" }}
          >
            <FeedbackIcon size={14} /> Enviar feedback
          </a>
          <button onClick={onLogout} style={{ width: "100%", marginBottom: 10, border: `1px solid ${COLORS.line}`, background: COLORS.surface, color: COLORS.ink, borderRadius: 10, padding: "10px 12px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <LogOut size={14} /> Cerrar sesión
          </button>
          <button onClick={onDeleteAccount} style={{ width: "100%", border: `1px solid #E0B4AC`, background: "#FBEFEC", color: "#8A3B2E", borderRadius: 10, padding: "10px 12px", fontSize: 13, cursor: "pointer" }}>
            Eliminar cuenta permanentemente
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- ROOT ---------------- */
export default function YamaApp() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [view, setView] = useState("home");
  const [chatMode, setChatMode] = useState("free");
  const [memory, setMemory] = useState<any>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pendingChatMessage, setPendingChatMessage] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [loadConversationId, setLoadConversationId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const refreshMemory = useCallback(async () => {
    const res = await fetch("/api/memory");
    if (res.ok) setMemory(await res.json());
  }, []);

  useEffect(() => { if (status === "authenticated") refreshMemory(); }, [status, refreshMemory]);

  const upgrade = async () => {
    const res = await fetch("/api/billing/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  const deleteAccount = async () => {
    if (!confirm("¿Seguro que quieres eliminar tu cuenta? Esta acción es permanente y no se puede deshacer.")) return;
    const res = await fetch("/api/account/delete", { method: "DELETE" });
    if (res.ok) {
      await signOut({ callbackUrl: "/login" });
    } else {
      alert("No se pudo eliminar la cuenta. Intenta de nuevo.");
    }
  };

  const goToChatWithMessage = (message: string) => {
    setChatMode("free");
    setPendingChatMessage(message);
    setView("chat");
  };

  if (status === "loading" || !memory) {
    return (
      <div style={{ minHeight: "100vh", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CoreOrb size={48} active />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: serifFont, color: COLORS.ink, minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      <WaveBackground />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        {view === "home" && (
          <HomeView
            setView={setView}
            setChatMode={setChatMode}
            memory={memory}
            plan={memory.plan}
            onUpgrade={upgrade}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        )}
        {view === "chat" && (
          <ChatView
            chatMode={chatMode}
            plan={memory.plan}
            initialMessage={pendingChatMessage}
            onInitialMessageSent={() => setPendingChatMessage(null)}
            loadConversationId={loadConversationId}
            onConversationLoaded={() => setLoadConversationId(null)}
            onOpenHistory={() => setHistoryOpen(true)}
          />
        )}
        {view === "strategist" && <StrategistView />}
        {view === "challenges" && <DailyChallengesView onSelect={goToChatWithMessage} />}
      </div>
      <BottomNav view={view} setView={setView} />

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)}>
        <PanelView
          memory={memory}
          refreshMemory={refreshMemory}
          plan={memory.plan}
          onUpgrade={upgrade}
          onDeleteAccount={deleteAccount}
          onLogout={() => signOut({ callbackUrl: "/login" })}
        />
      </SettingsModal>

      <HistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelectConversation={(id: string) => {
          setLoadConversationId(id);
          setHistoryOpen(false);
          setView("chat");
        }}
      />
    </div>
  );
}
