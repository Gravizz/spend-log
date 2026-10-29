import { db, isUniqueError, type Kind } from '#lib/server/db';
import { fail, redirect } from '@sveltejs/kit';

function readName(value: FormDataEntryValue | null): string | null {
	const name = String(value ?? '').trim();
	if (!name || name.length > 40) return null;
	return name;
}

function readKind(value: FormDataEntryValue | null): Kind | null {
	const kind = String(value ?? '');
	return kind === 'in' || kind === 'out' ? kind : null;
}

export function load() {
	const categories = db
		.query<{ id: number; name: string; kind: Kind; used: number }, []>(
			`SELECT c.id, c.name, c.kind, EXISTS(SELECT 1 FROM entries e WHERE e.category_id = c.id) AS used
			 FROM categories c
			 ORDER BY c.kind DESC, c.name`
		)
		.all()
		.map((row) => ({ ...row, used: Boolean(row.used) }));
	return { categories };
}

export const actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		const name = readName(data.get('name'));
		const kind = readKind(data.get('kind'));
		if (!name || !kind) return fail(400, { error: 'ชื่อหรือชนิดหมวดไม่ถูกต้อง' });
		try {
			db.query('INSERT INTO categories (name, kind) VALUES (?, ?)').run(name, kind);
		} catch (error) {
			if (isUniqueError(error)) return fail(400, { error: 'มีหมวดนี้อยู่แล้ว' });
			throw error;
		}
		redirect(303, '/categories');
	},
	rename: async ({ request }) => {
		const data = await request.formData();
		const id = Number(data.get('id'));
		const name = readName(data.get('name'));
		if (!Number.isInteger(id) || id <= 0 || !name) return fail(400, { error: 'ชื่อหมวดไม่ถูกต้อง' });
		try {
			const result = db.query('UPDATE categories SET name = ? WHERE id = ?').run(name, id);
			if (Number(result.changes) !== 1) return fail(404, { error: 'ไม่พบหมวด' });
		} catch (error) {
			if (isUniqueError(error)) return fail(400, { error: 'มีหมวดนี้อยู่แล้ว' });
			throw error;
		}
		redirect(303, '/categories');
	},
	remove: async ({ request }) => {
		const data = await request.formData();
		const id = Number(data.get('id'));
		if (!Number.isInteger(id) || id <= 0) return fail(400, { error: 'ไม่พบหมวด' });
		const used = db
			.query<{ n: number }, [number]>('SELECT COUNT(*) AS n FROM entries WHERE category_id = ?')
			.get(id);
		if (used && Number(used.n) > 0) return fail(400, { error: 'ลบไม่ได้ เพราะมีรายการในหมวดนี้' });
		const result = db.query('DELETE FROM categories WHERE id = ?').run(id);
		if (Number(result.changes) !== 1) return fail(404, { error: 'ไม่พบหมวด' });
		redirect(303, '/categories');
	}
};
