"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Brain, Film, TrendingUp, PenSquare, Send, Mic, MicOff, Home, MessageCircle,
  Compass, LayoutGrid, Sparkles, Target, Lightbulb, Rocket, Volume2, VolumeX,
  Loader2, Settings, X, LogOut, Crown,
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
    { id: "strategist", label: "Estratega", icon: Compass },
    { id: "panel", label: "Panel", icon: LayoutGrid },
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

/* ---------------- HOME ---------------- */
function HomeView({ setView, setChatMode, memory, plan, onUpgrade }: any) {
  const options = [
    { id: "idea", icon: Brain, title: "Pensar una idea", desc: "Analiza oportunidades detrás de una idea.", go: () => { setChatMode("idea"); setView("chat"); } },
    { id: "story", icon: Film, title: "Crear una historia", desc: "Convierte una idea en un guion.", go: () => { setChatMode("story"); setView("chat"); } },
    { id: "strategy", icon: TrendingUp, title: "Crear estrategia", desc: "Diseña un plan paso a paso.", go: () => setView("strategist") },
    { id: "content", icon: PenSquare, title: "Crear contenido", desc: "Genera publicaciones y videos.", go: () => { setChatMode("content"); setView("chat"); } },
  ];
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px 24px", textAlign: "center" }}>
        <div style={{ fontFamily: sansFont, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: COLORS.muted, marginBottom: 22 }}>{memory?.brand || "YAMA AI"}</div>
        <CoreOrb size={140} />
        <div style={{ fontSize: 26, marginTop: 26, fontWeight: 500, fontFamily: serifFont }}>¿Qué vamos a construir hoy?</div>
        {plan === "FREE" && (
          <button onClick={onUpgrade} style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 6, border: `1px solid ${COLORS.line}`, background: COLORS.surface, borderRadius: 20, padding: "8px 16px", fontFamily: sansFont, fontSize: 12.5, cursor: "pointer" }}>
            <Crown size={13} /> Mejorar a Pro
          </button>
        )}
      </div>
      <div style={{ padding: "0 16px 18px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {options.map((o) => {
          const Icon = o.icon;
          return (
            <button key={o.id} onClick={o.go} style={{ textAlign: "left", background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 16, padding: "16px 14px", cursor: "pointer", display: "flex", flexDirection: "column", gap: 10, fontFamily: sansFont }}>
              <Icon size={19} strokeWidth={1.6} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3, fontFamily: serifFont }}>{o.title}</div>
                <div style={{ fontSize: 11.5, color: COLORS.muted, lineHeight: 1.4 }}>{o.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- CHAT ---------------- */
const MODE_LABEL: Record<string, string> = { idea: "Pensar una idea", story: "Crear una historia", content: "Crear contenido", free: "Chat con YAMA" };

function ChatView({ chatMode, plan }: any) {
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

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;
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
  };

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
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <TopBar title={MODE_LABEL[chatMode] || "Chat con YAMA"} subtitle={plan === "FREE" ? "Plan gratuito" : "Plan Pro"} right={
        <IconButton onClick={() => setSpeakOn((v) => !v)} label="Leer en voz alta" active={speakOn}>{speakOn ? <Volume2 size={16} /> : <VolumeX size={16} />}</IconButton>
      } />
      {(micError || error) && (
        <div style={{ margin: "0 18px 8px", padding: "9px 12px", borderRadius: 10, background: "#FBEFEC", color: "#8A3B2E", fontFamily: sansFont, fontSize: 12.5 }}>{micError || error}</div>
      )}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "6px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.length === 0 && (
          <div style={{ margin: "24px auto", textAlign: "center", color: COLORS.muted, fontFamily: sansFont, fontSize: 13, maxWidth: 260 }}>
            <CoreOrb size={64} />
            <div style={{ marginTop: 14 }}>Escribe o habla — YAMA piensa contigo.</div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "84%", background: m.role === "user" ? COLORS.ink : COLORS.surface, color: m.role === "user" ? "#fff" : COLORS.ink, border: m.role === "user" ? "none" : `1px solid ${COLORS.line}`, borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", padding: "11px 14px", fontFamily: sansFont, fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{m.content}</div>
        ))}
        {loading && <div style={{ alignSelf: "flex-start", color: COLORS.muted, display: "flex", alignItems: "center", gap: 6, fontFamily: sansFont, fontSize: 12.5 }}><Loader2 size={14} style={{ animation: "yama-rotate 1s linear infinite" }} />YAMA está pensando…</div>}
      </div>
      <div style={{ display: "flex", gap: 8, padding: "10px 14px calc(env(safe-area-inset-bottom, 0px) + 10px)", borderTop: `1px solid ${COLORS.line}`, background: COLORS.surface }}>
        <button onClick={toggleListen} style={{ width: 42, height: 42, borderRadius: "50%", border: `1px solid ${COLORS.line}`, background: listening ? COLORS.ink : COLORS.bg, color: listening ? "#fff" : COLORS.ink, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }} aria-label="Hablar">
          {listening ? <MicOff size={17} /> : <Mic size={17} />}
        </button>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send(input)} placeholder="Escribe tu idea…"
          style={{ flex: 1, border: `1px solid ${COLORS.line}`, borderRadius: 21, padding: "0 16px", fontFamily: sansFont, fontSize: 14, background: COLORS.bg }} />
        <button onClick={() => send(input)} disabled={loading || !input.trim()} style={{ width: 42, height: 42, borderRadius: "50%", border: "none", background: COLORS.ink, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: loading || !input.trim() ? 0.4 : 1, flexShrink: 0 }} aria-label="Enviar">
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
    <div style={{ flex: 1, overflowY: "auto" }}>
      <TopBar title="Modo estratega" subtitle="Ideas, campañas, productos, videos o marcas — analizados." />
      <div style={{ padding: "0 18px 8px" }}>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ej. Quiero lanzar una línea de sudaderas de edición limitada…" rows={3}
          style={{ width: "100%", border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: "12px 14px", fontFamily: sansFont, fontSize: 14, resize: "none", boxSizing: "border-box", background: COLORS.surface }} />
        <button onClick={analyze} disabled={loading || !input.trim()} style={{ marginTop: 10, width: "100%", padding: 13, borderRadius: 14, border: "none", background: COLORS.ink, color: "#fff", fontFamily: sansFont, fontSize: 14, fontWeight: 600, cursor: "pointer", opacity: loading || !input.trim() ? 0.5 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {loading ? <><Loader2 size={15} style={{ animation: "yama-rotate 1s linear infinite" }} />Analizando…</> : <><Compass size={15} /> Analizar</>}
        </button>
        {error && <div style={{ color: "#B4433A", fontSize: 12.5, marginTop: 8, fontFamily: sansFont }}>{error}</div>}
      </div>
      {result && (
        <div style={{ padding: "10px 18px 24px", fontFamily: sansFont }}>
          {[["Problema", result.problema, Target], ["Oportunidad", result.oportunidad, Lightbulb], ["Estrategia", result.estrategia, Compass]].map(([label, text, Icon]: any) => (
            <div key={label} style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: "14px 16px", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}><Icon size={15} /><span style={{ fontSize: 12, textTransform: "uppercase", color: COLORS.muted }}>{label}</span></div>
              <div style={{ fontSize: 14, lineHeight: 1.55 }}>{text}</div>
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

/* ---------------- PANEL / MEMORIA / CONFIG ---------------- */
function PanelView({ memory, refreshMemory, plan, onUpgrade }: any) {
  const [brand, setBrand] = useState(memory?.brand || "");
  const [audience, setAudience] = useState(memory?.audience || "");
  const [style, setStyleV] = useState(memory?.style || "");
  const [noteDraft, setNoteDraft] = useState("");
  const [profanity, setProfanity] = useState(!!memory?.allowProfanity);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setBrand(memory?.brand || ""); setAudience(memory?.audience || ""); setStyleV(memory?.style || ""); setProfanity(!!memory?.allowProfanity);
  }, [memory]);

  const patch = async (body: any) => {
    const res = await fetch("/api/memory", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) { setNotice(data.error); return; }
    setNotice("");
    refreshMemory();
  };

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <TopBar title="Panel del creador" subtitle={memory?.brand || "Tu memoria y configuración"} />
      <div style={{ padding: "0 18px 28px", fontFamily: sansFont }}>
        {plan === "FREE" && (
          <button onClick={onUpgrade} style={{ width: "100%", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, border: "none", background: COLORS.ink, color: "#fff", borderRadius: 12, padding: "12px 16px", fontSize: 13.5, cursor: "pointer" }}>
            <Crown size={14} /> Mejorar a Pro — más mensajes y memoria
          </button>
        )}
        {notice && <div style={{ color: "#B4433A", fontSize: 12.5, marginBottom: 10 }}>{notice}</div>}

        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 16, padding: 16, marginBottom: 12 }}>
          <div style={{ fontFamily: serifFont, fontSize: 15, marginBottom: 10 }}>Memoria de YAMA</div>
          {[["Marca / proyecto", brand, setBrand, "brand"], ["Público objetivo", audience, setAudience, "audience"], ["Estilo / identidad", style, setStyleV, "style"]].map(([label, val, setter, key]: any) => (
            <div key={key} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 5 }}>{label}</div>
              <input value={val} onChange={(e) => setter(e.target.value)} onBlur={() => patch({ [key]: val })}
                style={{ width: "100%", border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: "10px 12px", fontFamily: sansFont, fontSize: 13.5, boxSizing: "border-box" }} />
            </div>
          ))}
          {(memory?.notes || []).map((n: any) => (
            <div key={n.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", background: COLORS.bg, borderRadius: 9, marginBottom: 6, fontSize: 13 }}>
              <span>{n.content}</span>
              <button onClick={() => patch({ removeNoteId: n.id })} style={{ border: "none", background: "none", color: COLORS.muted, cursor: "pointer" }}><X size={13} /></button>
            </div>
          ))}
          <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
            <input value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} placeholder="Ej. Mi marca vende ropa urbana premium"
              style={{ flex: 1, border: `1px solid ${COLORS.line}`, borderRadius: 9, padding: "8px 10px", fontFamily: sansFont, fontSize: 12.5, boxSizing: "border-box" }} />
            <button onClick={() => { if (noteDraft.trim()) { patch({ addNote: noteDraft.trim() }); setNoteDraft(""); } }} style={{ width: 34, borderRadius: 9, border: "none", background: COLORS.ink, color: "#fff", cursor: "pointer" }}>+</button>
          </div>
        </div>

        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 16, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ paddingRight: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>Tono crudo (con groserías)</div>
            <div style={{ fontSize: 12, color: COLORS.muted }}>Actívalo si quieres que YAMA use groserías coloquiales en ganchos y contenido.</div>
          </div>
          <button onClick={() => { const next = !profanity; setProfanity(next); patch({ allowProfanity: next }); }} style={{ flexShrink: 0, width: 46, height: 27, borderRadius: 14, border: "none", cursor: "pointer", background: profanity ? COLORS.ink : COLORS.line, position: "relative" }}>
            <span style={{ position: "absolute", top: 3, left: profanity ? 22 : 3, width: 21, height: 21, borderRadius: "50%", background: "#fff" }} />
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

  if (status === "loading" || !memory) {
    return (
  <div
    style={{
      minHeight: "100vh",
      background: "#000",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      position: "relative",
    }}
  >
    <div
      style={{
        position: "absolute",
        right: "-200px",
        width: "500px",
        height: "500px",
        background: "radial-gradient(circle, white, transparent 70%)",
        animation: "lightMove 2s ease forwards",
      }}
    />

    <CoreOrb size={130} active />
  </div>
);

  return (
    <div style={{ fontFamily: serifFont, background: COLORS.bg, color: COLORS.ink, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        {view === "home" && <HomeView setView={setView} setChatMode={setChatMode} memory={memory} plan={memory.plan} onUpgrade={upgrade} />}
        {view === "chat" && <ChatView chatMode={chatMode} plan={memory.plan} />}
        {view === "strategist" && <StrategistView />}
        {view === "panel" && <PanelView memory={memory} refreshMemory={refreshMemory} plan={memory.plan} onUpgrade={upgrade} />}
      </div>
      <div style={{ display: "flex", justifyContent: "center", padding: "4px 0" }}>
        <button onClick={() => signOut({ callbackUrl: "/login" })} style={{ border: "none", background: "none", color: COLORS.muted, fontFamily: sansFont, fontSize: 11, display: "flex", alignItems: "center", gap: 4, cursor: "pointer", padding: 4 }}>
          <LogOut size={11} /> Cerrar sesión
        </button>
      </div>
      <BottomNav view={view} setView={setView} />
    </div>
  );
}
