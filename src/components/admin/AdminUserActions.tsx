"use client";

import { useState } from "react";
import { Edit3 } from "lucide-react";
import { changeUserTier, toggleUserStatus } from "@/actions/admin";
import { useRouter } from "next/navigation";

export default function AdminUserActions({ userId, initialTier, initialActive }: { userId: number, initialTier: string, initialActive: boolean }) {
    const [tier, setTier] = useState(initialTier);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    const handleSave = async () => {
        setSaving(true);
        await changeUserTier(userId, tier);
        setSaving(false);
        alert("User tier updated successfully!");
    };

    const handleToggleStatus = async () => {
        const confirmMsg = initialActive ? "Suspend user?" : "Unsuspend user?";
        if (confirm(confirmMsg)) {
            setSaving(true);
            await toggleUserStatus(userId, initialActive);
            setSaving(false);
        }
    };

    return (
        <div className="glass-card" style={{ padding: "24px" }}>
            <h3 style={{ fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit3 size={16} /> Admin Actions
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", minWidth: "80px" }}>Tier:</label>
                    <select value={tier} onChange={(e) => setTier(e.target.value)} style={{
                        flex: 1, padding: "8px 12px", background: "var(--bg-surface)", border: "1px solid var(--border-color)",
                        borderRadius: "var(--radius)", color: "var(--text-primary)", fontSize: "0.85rem",
                    }}>
                        <option value="free">Free</option>
                        <option value="starter">Starter</option>
                        <option value="pro">Pro</option>
                        <option value="enterprise">Enterprise</option>
                    </select>
                </div>
                <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ padding: "10px 20px", fontSize: "0.85rem" }}>
                    {saving ? "Saving..." : "Save Changes"}
                </button>
                <button onClick={handleToggleStatus} disabled={saving} className="btn-secondary" style={{ padding: "10px 20px", fontSize: "0.85rem", color: initialActive ? "var(--warning)" : "var(--success)" }}>
                    {initialActive ? "Suspend User" : "Activate User"}
                </button>
                <button className="btn-secondary" style={{ padding: "10px 20px", fontSize: "0.85rem", color: "var(--danger)" }}>Delete User (Disabled)</button>
            </div>
        </div>
    );
}
