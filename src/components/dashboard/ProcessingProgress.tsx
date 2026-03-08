"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Circle } from "lucide-react";

interface Step {
  label: string;
  status: "done" | "running" | "pending";
  duration?: string;
}

export function ProcessingProgress({ steps, percentage }: { steps: Step[]; percentage: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(248, 250, 252, 0.95)",
        backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        style={{
          background: "var(--bg-card)", borderRadius: "20px", padding: "40px 48px",
          boxShadow: "var(--shadow-lg)", border: "1px solid var(--border-color)",
          width: "440px", maxWidth: "90vw",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "14px",
            background: "var(--primary-surface)", margin: "0 auto 16px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Loader2 size={24} style={{ color: "var(--primary)", animation: "spin 1s linear infinite" }} />
          </div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
            Memproses data bisnis kamu...
          </h2>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Ini hanya terjadi sekali per upload</p>
        </div>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {step.status === "done" && <CheckCircle2 size={18} style={{ color: "var(--success)", flexShrink: 0 }} />}
              {step.status === "running" && <Loader2 size={18} style={{ color: "var(--primary)", flexShrink: 0, animation: "spin 1s linear infinite" }} />}
              {step.status === "pending" && <Circle size={18} style={{ color: "var(--text-muted)", flexShrink: 0 }} />}
              <span style={{
                fontSize: "0.85rem", fontWeight: step.status === "running" ? 600 : 400,
                color: step.status === "pending" ? "var(--text-muted)" : "var(--text-primary)",
              }}>
                {step.label}
              </span>
              {step.duration && (
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginLeft: "auto" }}>{step.duration}</span>
              )}
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div style={{ height: "6px", borderRadius: "100px", background: "var(--bg-surface)", overflow: "hidden" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ height: "100%", borderRadius: "100px", background: "var(--gradient-primary)" }}
          />
        </div>
        <p style={{ textAlign: "center", fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "8px" }}>{percentage}%</p>
      </motion.div>
    </motion.div>
  );
}
