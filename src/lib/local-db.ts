import Dexie, { type Table } from "dexie";

// Universal schema record for local storage
export interface DataRecord {
    id?: number;
    data: Record<string, any>; // Stores the entire parsed JSON row
}

export class SimbisDatabase extends Dexie {
    salesData!: Table<DataRecord, number>;

    constructor() {
        super("SimbisDatabase");

        // Define schema
        this.version(3).stores({
            salesData: "++id", // Auto-incremented primary key
        }).upgrade(tx => {
            // Note: Schema version upgraded to v3 to drop the SaaS mock tables 
            // since Authentication has now been migrated to the cloud (Turso/Drizzle)
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
