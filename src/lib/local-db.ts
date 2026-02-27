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
        this.version(1).stores({
            salesData: "++id", // Auto-incremented primary key
        });
    }

    // Clear and bulk add new data
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
}

export const db = new SimbisDatabase();
