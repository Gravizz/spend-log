import { bahtToSatang } from '#lib/money';
import { formatMonth, monthBounds, parseDate, parseMonth, shiftMonth, today } from '#lib/month';
import { db, type Category, type CategoryTotal, type EntryRow } from '#lib/server/db';
import { loadQuickChips } from '#lib/server/quick-chips';
import { fail, redirect } from '@sveltejs/kit';

const categoriesSql = 'SELECT id, name, kind FROM categories ORDER BY kind, name';

function categories(): Category[] {
	return db.query<Category, []>(categoriesSql).all();
}

function entryError(data: FormData, list: Category[]) {
	const occurredOn = parseDate(String(data.get('occurred_on') ?? ''));
	const categoryId = Number(data.get('category_id'));
	const amount = bahtToSatang(String(data.get('amount') ?? ''));
	const note = String(data.get('note') ?? '').trim();
	const category = list.find((item) => item.id === categoryId);
	const fields = {
		occurred_on: String(data.get('occurred_on') ?? ''),
		category_id: String(data.get('category_id') ?? ''),
		amount: String(data.get('amount') ?? ''),
		note: String(data.get('note') ?? '')
	};
	if (!occurredOn) return fail(400, { error: 'วันที่ไม่ถูกต้อง', ...fields });
	if (!category) return fail(400, { error: 'เลือกหมวด', ...fields });
	if (amount == null) return fail(400, { error: 'จำนวนเงินไม่ถูกต้อง', ...fields });
	if (note.length > 200) return fail(400, { error: 'โน้ตยาวเกินไป', ...fields });
	return { occurredOn, categoryId, amount, note, month: occurredOn.slice(0, 7) };
}

export function load({ url }) {
	const month = parseMonth(url.searchParams.get('m'));
	const { start, end } = monthBounds(month);
	const entries = db
		.query<EntryRow, [string, string]>(
			`SELECT e.id, e.occurred_on, e.amount_satang, e.note, e.category_id, c.name, c.kind
			 FROM entries e JOIN categories c ON c.id = e.category_id
			 WHERE e.occurred_on >= ? AND e.occurred_on < ?
			 ORDER BY e.occurred_on DESC, e.id DESC`
		)
		.all(start, end)
		.map((row) => ({ ...row, amount_satang: Number(row.amount_satang) }));
	const byCategory = db
		.query<CategoryTotal, [string, string]>(
			`SELECT c.id, c.name, c.kind, COALESCE(SUM(e.amount_satang), 0) AS total
			 FROM categories c
			 LEFT JOIN entries e ON e.category_id = c.id AND e.occurred_on >= ? AND e.occurred_on < ?
			 GROUP BY c.id
			 HAVING COALESCE(SUM(e.amount_satang), 0) > 0
			 ORDER BY c.kind, c.name`
		)
		.all(start, end)
		.map((row) => ({ ...row, total: Number(row.total) }));
	const editId = Number(url.searchParams.get('edit'));
	const editing =
		Number.isInteger(editId) && editId > 0
			? db
					.query<EntryRow, [number]>(
						`SELECT e.id, e.occurred_on, e.amount_satang, e.note, e.category_id, c.name, c.kind
						 FROM entries e JOIN categories c ON c.id = e.category_id
						 WHERE e.id = ?`
					)
					.get(editId)
			: null;
	let income = 0;
	let expense = 0;
	for (const row of byCategory) {
		if (row.kind === 'in') income += row.total;
		else expense += row.total;
	}
	return {
		month,
		label: formatMonth(month),
		prev: shiftMonth(month, -1),
		next: shiftMonth(month, 1),
		today: today(),
		entries,
		byCategory,
		categories: categories(),
		quickChips: loadQuickChips(db),
		income,
		expense,
		net: income - expense,
		editing: editing ? { ...editing, amount_satang: Number(editing.amount_satang) } : null
	};
}

export const actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		const entry = entryError(data, categories());
		if ('status' in entry) return entry;
		db.query(
			'INSERT INTO entries (occurred_on, category_id, amount_satang, note) VALUES (?, ?, ?, ?)'
		).run(entry.occurredOn, entry.categoryId, entry.amount, entry.note);
		redirect(303, `/?m=${entry.month}`);
	},
	update: async ({ request }) => {
		const data = await request.formData();
		const id = Number(data.get('id'));
		const entry = entryError(data, categories());
		if ('status' in entry) return entry;
		if (!Number.isInteger(id) || id <= 0) return fail(404, { error: 'ไม่พบรายการ' });
		const result = db
			.query(
				'UPDATE entries SET occurred_on = ?, category_id = ?, amount_satang = ?, note = ? WHERE id = ?'
			)
			.run(entry.occurredOn, entry.categoryId, entry.amount, entry.note, id);
		if (Number(result.changes) !== 1) return fail(404, { error: 'ไม่พบรายการ' });
		redirect(303, `/?m=${entry.month}`);
	},
	remove: async ({ request }) => {
		const data = await request.formData();
		const id = Number(data.get('id'));
		const month = parseMonth(String(data.get('m') ?? ''));
		if (Number.isInteger(id) && id > 0) db.query('DELETE FROM entries WHERE id = ?').run(id);
		redirect(303, `/?m=${month}`);
	}
};
