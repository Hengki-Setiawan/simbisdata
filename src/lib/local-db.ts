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

export class SimbisDatabase extends Dexie {
    salesData!: Table<DataRecord, number>;
    mappings!: Table<ColumnMapping, string>;

    constructor() {
        super("SimbisDatabase");

        // Define schema
        this.version(4).stores({
            salesData: "++id",
            mappings: "id",
        }).upgrade(tx => {
            // Version 4: Add mappings table
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
}

export const db = new SimbisDatabase();
