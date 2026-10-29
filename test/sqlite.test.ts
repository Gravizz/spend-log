import { expect, test } from 'bun:test';
import { Database } from '../src/lib/server/sqlite.ts';

test('SQLite adapter supports bound CRUD, integer satang, constraints and transactions', () => {
	const db = new Database(':memory:');
	try {
		db.exec('CREATE TABLE entries (id INTEGER PRIMARY KEY, note TEXT UNIQUE, amount INTEGER CHECK(amount > 0))');
		const insert = db.query('INSERT INTO entries (note, amount) VALUES (?, ?)');
		expect(Number(insert.run("quote ' ?", 125050).changes)).toBe(1);
		const rows = db.query<{ note: string; amount: number }, [number]>(
			'SELECT note, amount FROM entries WHERE id = ?'
		);
		expect(rows.get(1)).toEqual({ note: "quote ' ?", amount: 125050 });
		expect(rows.all(1)).toHaveLength(1);
		expect(rows.get(2)).toBeUndefined();
		expect(() => insert.run("quote ' ?", 100)).toThrow('UNIQUE');
		expect(() => insert.run('invalid', 0)).toThrow();
		db.exec('BEGIN');
		db.query('UPDATE entries SET amount = ? WHERE id = ?').run(200, 1);
		db.exec('ROLLBACK');
		expect(rows.get(1)?.amount).toBe(125050);
		expect(Number(db.query('DELETE FROM entries WHERE id = ?').run(1).changes)).toBe(1);
		expect(rows.all(1)).toEqual([]);
	} finally {
		db.close();
	}
});
