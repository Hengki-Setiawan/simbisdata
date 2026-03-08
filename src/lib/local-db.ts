import Dexie, { type Table } from "dexie";

// Universal schema record for local storage
export interface DataRecord {
    id?: number;
    data: Record<string, any>;
}

export interface ColumnMapping {
    id: string; // The platform name, e.g., "shopee"
    mapping: Record<string, string>;
    updatedAt: number;
}

export interface FileRecord {
    id?: number;
    name: string;
    size: number;
    type: string;
    uploadedAt: number;
    url?: string;
}

export class SimbisDataDatabase extends Dexie {
    salesData!: Table<DataRecord, number>;
    mappings!: Table<ColumnMapping, string>;
    files!: Table<FileRecord, number>;

    constructor() {
        super("SimbisDataDatabase");

        // Define schema
        this.version(5).stores({
            salesData: "++id",
            mappings: "id",
            files: "++id, uploadedAt",
        }).upgrade(tx => {
            // Version 5: Add files table
        });
    }

    // Clear and bulk add new raw data
    async saveNewData(rows: Record<string, any>[]) {
        await this.transaction("rw", this.salesData, async () => {
            await this.salesData.clear();
            const records = rows.map((r) => ({ data: r }));
            await this.salesData.bulkAdd(records);
        });
    }

    // Retrieve all data
    async getAllData(): Promise<Record<string, any>[]> {
        const records = await this.salesData.toArray();
        return records.map((r) => r.data);
    }

    async getMapping(platform: string): Promise<Record<string, string> | null> {
        const record = await this.mappings.get(platform);
        return record ? record.mapping : null;
    }

    async saveMapping(platform: string, mapping: Record<string, string>) {
        await this.mappings.put({
            id: platform,
            mapping,
            updatedAt: Date.now()
        });
    }

    // Check if data exists
    async hasData(): Promise<boolean> {
        const count = await this.salesData.count();
        return count > 0;
    }

    // Get current data (alias for getAllData, used by Data Studio)
    async getCurrentData(): Promise<Record<string, any>[]> {
        return this.getAllData();
    }

    // Completely wipe all data and settings (Reset)
    async clearAll() {
        await this.transaction("rw", this.salesData, this.mappings, async () => {
            await this.salesData.clear();
            await this.mappings.clear();
        });
        
        // Also wipe local storage cache for analysis pipeline
        if (typeof window !== "undefined") {
            localStorage.removeItem("analyze_cache");
            localStorage.removeItem("feature_cache");
            localStorage.removeItem("ml_cluster_cache");
            localStorage.removeItem("pipeline_report");
        }
    }
}

export const db = new SimbisDataDatabase();
