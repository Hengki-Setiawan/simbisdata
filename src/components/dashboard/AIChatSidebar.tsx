"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, User, Sparkles } from "lucide-react";

interface Message { role: "user" | "assistant"; content: string }

const QUICK_PROMPTS = [
  "Rangkum data penjualan saya",
  "Produk mana yang paling menguntungkan?",
  "Berikan saran untuk minggu ini",
  "Bagaimana tren penjualan bulan ini?",
];

export function AIChatSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Halo! Saya SimbisData AI 🤖\nSiap membantu menganalisis data bisnis kamu. Tanyakan apapun!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.response || data.message || "Maaf, saya tidak bisa menjawab saat ini." }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Terjadi kesalahan koneksi. Coba lagi nanti." }]);
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          style={{
            position: "fixed", top: 0, right: 0, bottom: 0, width: "380px", zIndex: 100,
            background: "var(--bg-card)", borderLeft: "1px solid var(--border-color)",
            display: "flex", flexDirection: "column", boxShadow: "var(--shadow-lg)",
          }}
        >
          {/* Header */}
          <div style={{
            padding: "16px 20px", borderBottom: "1px solid var(--border-color)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "10px",
                background: "var(--primary-surface)", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Bot size={18} style={{ color: "var(--primary)" }} />
              </div>
              <div>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>SimbisData AI</h3>
                <p style={{ fontSize: "0.7rem", color: "var(--success)" }}>● Online</p>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px" }}>
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                  background: msg.role === "user" ? "var(--primary)" : "var(--primary-surface)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {msg.role === "user" ? <User size={14} color="#fff" /> : <Sparkles size={14} style={{ color: "var(--primary)" }} />}
                </div>
                <div style={{
                  maxWidth: "85%", padding: "10px 14px", borderRadius: "14px", fontSize: "0.85rem", lineHeight: 1.5,
                  background: msg.role === "user" ? "var(--primary)" : "var(--bg-surface)",
                  color: msg.role === "user" ? "#fff" : "var(--text-primary)",
                  borderBottomRightRadius: msg.role === "user" ? "4px" : "14px",
                  borderBottomLeftRadius: msg.role === "user" ? "14px" : "4px",
                  whiteSpace: "pre-wrap",
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", gap: "8px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--primary-surface)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Sparkles size={14} style={{ color: "var(--primary)" }} />
                </div>
                <div style={{ padding: "12px 16px", borderRadius: "14px", background: "var(--bg-surface)", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  <span className="typing-dots">Sedang berpikir</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          {messages.length <= 1 && (
            <div style={{ padding: "0 16px 8px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {QUICK_PROMPTS.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)} style={{
                  padding: "6px 12px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 500,
                  background: "var(--bg-surface)", border: "1px solid var(--border-color)",
                  color: "var(--text-secondary)", cursor: "pointer",
                }}>{q}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border-color)" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage(input)}
                placeholder="Tanyakan sesuatu..."
                style={{
                  flex: 1, padding: "10px 14px", borderRadius: "12px",
                  border: "1px solid var(--border-color)", background: "var(--bg-surface)",
                  color: "var(--text-primary)", fontSize: "0.85rem", outline: "none",
                }}
              />
              <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading} style={{
                width: "38px", height: "38px", borderRadius: "10px",
                background: input.trim() ? "var(--primary)" : "var(--bg-surface)",
                border: "none", cursor: input.trim() ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: input.trim() ? "#fff" : "var(--text-muted)",
              }}>
                <Send size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
