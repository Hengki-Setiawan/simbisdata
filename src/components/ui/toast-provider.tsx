"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ addToast: () => { } });

export function useToast() {
    return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = "success") => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const icons = {
        success: <CheckCircle2 size={18} style={{ color: "#10b981", flexShrink: 0 }} />,
        error: <AlertCircle size={18} style={{ color: "#ef4444", flexShrink: 0 }} />,
        info: <Info size={18} style={{ color: "#6366f1", flexShrink: 0 }} />,
    };

    const borderColors = {
        success: "#10b981",
        error: "#ef4444",
        info: "#6366f1",
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div style={{
                position: "fixed",
                bottom: "24px",
                right: "24px",
                zIndex: 9999,
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                maxWidth: "380px",
            }}>
                <AnimatePresence>
                    {toasts.map(toast => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 100, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                background: "var(--bg-card)",
                                border: "1px solid var(--border-color)",
                                borderLeft: `4px solid ${borderColors[toast.type]}`,
                                borderRadius: "8px",
                                padding: "14px 16px",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                                backdropFilter: "blur(12px)",
                            }}
                        >
                            {icons[toast.type]}
                            <span style={{ flex: 1, fontSize: "0.88rem", color: "var(--text-primary)", lineHeight: 1.4 }}>{toast.message}</span>
                            <button onClick={() => removeToast(toast.id)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "2px", flexShrink: 0 }}>
                                <X size={14} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}
