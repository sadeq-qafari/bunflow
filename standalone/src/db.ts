import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

export class ApiError extends Error {
  constructor(public status: number, public details: string) {
    super(details);
  }
}
export const fail = (status: number, details: string): never => {
  throw new ApiError(status, details);
};
export function openDatabase(path: string) {
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path, { create: true, strict: true });
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS forms(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL COLLATE NOCASE UNIQUE, definition TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS properties(id INTEGER PRIMARY KEY AUTOINCREMENT, form_id INTEGER NOT NULL REFERENCES forms(id) ON DELETE CASCADE, name TEXT NOT NULL COLLATE NOCASE, definition TEXT NOT NULL, UNIQUE(form_id,name));
    CREATE TABLE IF NOT EXISTS lookups(id INTEGER PRIMARY KEY AUTOINCREMENT, definition TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS records(id INTEGER PRIMARY KEY AUTOINCREMENT, form_id INTEGER NOT NULL REFERENCES forms(id) ON DELETE CASCADE, data TEXT NOT NULL, created_at TEXT NOT NULL, modified_at TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS records_form ON records(form_id,id);
    CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), kind TEXT NOT NULL, expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS imports(reference TEXT PRIMARY KEY, user_id INTEGER NOT NULL, payload TEXT NOT NULL, expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS files(id TEXT PRIMARY KEY, name TEXT NOT NULL, mime TEXT NOT NULL, content BLOB NOT NULL);
    PRAGMA user_version=1;`);
  return db;
}
export function setting(db: Database, key: string, value?: string) {
  if (value !== undefined)
    db.query(
      "INSERT INTO settings VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value"
    ).run(key, value);
  return (
    db.query("SELECT value FROM settings WHERE key=?").get(key) as {
      value: string;
    } | null
  )?.value;
}
export const bumpVersion = (db: Database) =>
  setting(
    db,
    "version",
    String(Math.max(Date.now(), Number(setting(db, "version") || 0) + 1))
  );
export const safeJson = (value: string | null, fallback: any = null): any => {
  if (!value) return fallback;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return JSON.parse(value);
    } catch {
      try {
        const decoded = decodeURIComponent(value);
        if (decoded === value) break;
        value = decoded;
      } catch {
        break;
      }
    }
  }
  return fail(400, "invalid_json");
};
export const nameIsValid = (value: unknown) =>
  typeof value === "string" && /^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(value);
