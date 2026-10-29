import { db } from '#lib/server/db';

export function load({ url }) {
	const raw = url.searchParams.get('y');
	const year = raw && /^\d{4}$/.test(raw) ? Number(raw) : new Date().getFullYear();
	const rows = db
		.query<{ month: string; total: number }, [string, string]>(
			`SELECT substr(e.occurred_on, 1, 7) AS month, SUM(e.amount_satang) AS total
			 FROM entries e
			 JOIN categories c ON c.id = e.category_id
			 WHERE c.kind = 'out' AND e.occurred_on >= ? AND e.occurred_on < ?
			 GROUP BY month
			 ORDER BY month`
		)
		.all(`${year}-01-01`, `${year + 1}-01-01`)
		.map((row) => ({ month: row.month, total: Number(row.total) }));
	return { year, months: rows };
}
