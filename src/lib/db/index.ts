import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

// Singleton Database Connection (Node.js runtime)
const dbPath = process.env.DATABASE_PATH || "./data/vectra.db";
const resolvedPath = path.isAbsolute(dbPath)
  ? dbPath
  : path.resolve(process.cwd(), dbPath);

// Ensure the directory exists
const dir = path.dirname(resolvedPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Global variable for development HMR stability
declare global {
  var __sqliteDb: Database.Database | undefined;
}

const sqlite = global.__sqliteDb || new Database(resolvedPath);

if (process.env.NODE_ENV !== "production") {
  global.__sqliteDb = sqlite;
}

// Konfigurasi PRAGMA Wajib sesuai PRD:
// 1. journal_mode = WAL
// 2. synchronous = NORMAL
// 3. foreign_keys = ON
// 4. busy_timeout = 5000
// 5. cache_size = -20000 (~20MB Cache)
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("synchronous = NORMAL");
sqlite.pragma("foreign_keys = ON");
sqlite.pragma("busy_timeout = 5000");
sqlite.pragma("cache_size = -20000");

export const db = drizzle(sqlite, { schema });
export { sqlite };
export default db;
