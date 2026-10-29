import { afterEach, beforeEach, expect, test } from 'bun:test';
import { Database } from '../src/lib/server/sqlite';
import { loadSummary } from '../src/lib/server/analytics';

let db: Database;
beforeEach(() => {
	db = new Database(':memory:');
	db.exec(`CREATE TABLE categories (id INTEGER PRIMARY KEY, name TEXT, kind TEXT);
		CREATE TABLE entries (id INTEGER PRIMARY KEY, occurred_on TEXT, category_id INTEGER, amount_satang INTEGER, note TEXT DEFAULT '');
		INSERT INTO categories VALUES (1, 'อาหาร', 'out'), (2, 'เดินทาง', 'out'), (3, 'เงินเดือน', 'in'), (4, 'ของใช้', 'out');`);
});
afterEach(() => db.close());

function entry(date: string, category: number, amount: number) {
	db.query('INSERT INTO entries (occurred_on, category_id, amount_satang) VALUES (?, ?, ?)').run(date, category, amount);
}

test('summary separates income, expense and category shares at exact date boundaries', () => {
	entry('2026-10-01', 1, 10001); entry('2026-10-29', 2, 20002);
	entry('2026-10-29', 3, 50000); entry('2026-10-30', 1, 90000);
	entry('2026-09-29', 4, 10000); entry('2026-09-30', 4, 70000);
	const result = loadSummary(db, '2026-10', '2026-10-29');
	expect(result.income).toBe(50000);
	expect(result.expense).toBe(30003);
	expect(result.net).toBe(19997);
	expect(result.categories).toEqual([{ id: 2, name: 'เดินทาง', total: 20002 }, { id: 1, name: 'อาหาร', total: 10001 }]);
	expect(result.comparison?.previousTotal).toBe(10000);
	expect(result.comparison?.delta).toBe(20003);
	expect(result.yearMonths).toHaveLength(12);
	expect(result.yearMonths[9]).toEqual({ month: '2026-10', income: 50000, expense: 120003, net: -70003 });
	expect(result.yearMonths[0]).toEqual({ month: '2026-01', income: 0, expense: 0, net: 0 });
});

test('completed months include all days and compare entire previous month', () => {
	entry('2026-09-30', 1, 101); entry('2026-08-31', 2, 100);
	entry('2026-10-01', 1, 900);
	const result = loadSummary(db, '2026-09', '2026-10-29');
	expect(result.expense).toBe(101);
	expect(result.comparison?.previousTotal).toBe(100);
	expect(result.comparison?.drivers).toEqual([{ id: 1, name: 'อาหาร', delta: 101 }]);
});

test('future months show booked amounts but no comparison', () => {
	entry('2026-11-30', 1, 100);
	const result = loadSummary(db, '2026-11', '2026-10-29');
	expect(result.expense).toBe(100);
	expect(result.comparison).toBeNull();
	expect(result.period.mode).toBe('future');
});

test('empty months, income only and cross-year comparisons do not invent expenses', () => {
	expect(loadSummary(db, '2026-10', '2026-10-29').comparison).toMatchObject({ delta: 0, percent: null });
	entry('2026-01-01', 3, 12345); entry('2025-12-05', 1, 101);
	const result = loadSummary(db, '2026-01', '2026-01-05');
	expect(result.categories).toEqual([]);
	expect(result.expense).toBe(0);
	expect(result.net).toBe(12345);
	expect(result.comparison?.percent).toBe(-100);
	expect(result.comparison?.drivers[0]).toEqual({ id: 1, name: 'อาหาร', delta: -101 });
	expect(result.yearMonths.reduce((sum, m) => sum + m.expense, 0)).toBe(0);
});

test('equal category totals have a stable name and id order', () => {
	entry('2026-10-01', 2, 100); entry('2026-10-01', 1, 100);
	const result = loadSummary(db, '2026-10', '2026-10-29');
	expect(result.categories.map((c) => c.name)).toEqual(['เดินทาง', 'อาหาร']);
});

test('earliest and latest accepted years query only their own month and year', () => {
	entry('0001-01-01', 1, 100); entry('0099-12-31', 1, 200);
	entry('9999-12-31', 1, 300); entry('9998-12-31', 1, 400);
	expect(loadSummary(db, '0001-01', '2026-10-29').expense).toBe(100);
	expect(loadSummary(db, '0099-12', '2026-10-29').expense).toBe(200);
	const last = loadSummary(db, '9999-12', '2026-10-29');
	expect(last.expense).toBe(300);
	expect(last.yearMonths[11].expense).toBe(300);
});
