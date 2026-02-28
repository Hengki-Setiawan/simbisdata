"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import the Leaflet map component with SSR disabled
const RegionalMapClient = dynamic(
    () => import("./RegionalMapClient"),
    {
        ssr: false,
        loading: () => (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)", gap: "12px", background: "var(--bg-surface)", borderRadius: "8px" }}>
                <Loader2 size={32} className="spin" style={{ color: "var(--primary)" }} />
                <span style={{ fontSize: "0.85rem" }}>Memuat Peta Interaktif...</span>
            </div>
        )
    }
);

export function RegionalMap({ rec, data }: { rec: any, data: any[] }) {
    // We just wrap the client component
    return <RegionalMapClient rec={rec} data={data} />;
}
