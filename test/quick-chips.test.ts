import { afterEach, beforeEach, expect, test } from 'bun:test';
import { Database } from '../src/lib/server/sqlite';
import { loadQuickChips } from '../src/lib/server/quick-chips';

let db: Database;
beforeEach(() => {
	db = new Database(':memory:');
	db.exec(`CREATE TABLE categories (id INTEGER PRIMARY KEY, name TEXT NOT NULL, kind TEXT NOT NULL);
		CREATE TABLE entries (id INTEGER PRIMARY KEY, occurred_on TEXT NOT NULL, category_id INTEGER NOT NULL, amount_satang INTEGER NOT NULL, note TEXT NOT NULL DEFAULT '');
		INSERT INTO categories VALUES (1, 'กาแฟ', 'out'), (2, 'เดินทาง', 'out'), (3, 'เงินเดือน', 'in');`);
});
afterEach(() => db.close());

function add(date: string, categoryId: number, satang: number, note = '') {
	db.query('INSERT INTO entries (occurred_on, category_id, amount_satang, note) VALUES (?, ?, ?, ?)').run(date, categoryId, satang, note);
}

test('empty database returns no quick chips', () => {
	expect(loadQuickChips(db)).toEqual([]);
});

test('ranks by frequency then latest date then latest id, keeping blank and noted entries distinct', () => {
	add('2026-10-01', 1, 6000, 'ลาเต้');
	add('2026-10-05', 1, 6000, 'ลาเต้');
	add('2026-10-02', 1, 6000, '');
	add('2026-10-03', 2, 4500, 'BTS');
	add('2026-10-03', 2, 3500, 'วิน');

	const chips = loadQuickChips(db);
	expect(chips).toEqual([
		{ category_id: 1, name: 'กาแฟ', kind: 'out', amount_satang: 6000, note: 'ลาเต้', count: 2 },
		{ category_id: 2, name: 'เดินทาง', kind: 'out', amount_satang: 3500, note: 'วิน', count: 1 },
		{ category_id: 2, name: 'เดินทาง', kind: 'out', amount_satang: 4500, note: 'BTS', count: 1 },
		{ category_id: 1, name: 'กาแฟ', kind: 'out', amount_satang: 6000, note: '', count: 1 }
	]);
});

test('limits each kind independently so out chips do not crowd out in chips', () => {
	add('2026-10-01', 1, 5000, 'A');
	add('2026-10-02', 1, 5500, 'B');
	add('2026-10-03', 1, 6000, 'C');
	add('2026-10-01', 3, 3000000, 'เงินเดือนประจำ');

	const chips = loadQuickChips(db, 2);
	expect(chips.filter((c) => c.kind === 'out')).toHaveLength(2);
	expect(chips.filter((c) => c.kind === 'in')).toEqual([
		{ category_id: 3, name: 'เงินเดือน', kind: 'in', amount_satang: 3000000, note: 'เงินเดือนประจำ', count: 1 }
	]);
});
