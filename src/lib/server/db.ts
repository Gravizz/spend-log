import { Database } from 'bun:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const path = process.env.DATABASE_PATH || 'data/spend.db';
if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });

export const db = new Database(path);
db.exec('PRAGMA foreign_keys = ON');
db.exec('PRAGMA journal_mode = WAL');
db.exec(`
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('in', 'out')),
  UNIQUE (name, kind)
);
CREATE TABLE IF NOT EXISTS entries (
  id INTEGER PRIMARY KEY,
  occurred_on TEXT NOT NULL,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  amount_satang INTEGER NOT NULL CHECK (amount_satang > 0),
  note TEXT NOT NULL DEFAULT ''
);
`);

export type Kind = 'in' | 'out';

export type Category = { id: number; name: string; kind: Kind };

export type EntryRow = {
	id: number;
	occurred_on: string;
	amount_satang: number;
	note: string;
	category_id: number;
	name: string;
	kind: Kind;
};

export type CategoryTotal = { id: number; name: string; kind: Kind; total: number };

export function isUniqueError(error: unknown): boolean {
	return error instanceof Error && error.message.includes('UNIQUE');
}
