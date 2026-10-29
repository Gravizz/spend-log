import { db, type Kind } from '#lib/server/db';

export function load({ url }) {
	const raw = url.searchParams.get('y');
	const year = raw && /^\d{4}$/.test(raw) ? Number(raw) : new Date().getFullYear();
	const rows = db
		.query<{ kind: Kind; month: string; total: number }, [string, string]>(
			`SELECT c.kind, substr(e.occurred_on, 1, 7) AS month, SUM(e.amount_satang) AS total
			 FROM entries e
			 JOIN categories c ON c.id = e.category_id
			 WHERE e.occurred_on >= ? AND e.occurred_on < ?
			 GROUP BY c.kind, month
			 ORDER BY month`
		)
		.all(`${year}-01-01`, `${year + 1}-01-01`)
		.map((row) => ({ kind: row.kind, month: row.month, total: Number(row.total) }));
	return {
		year,
		income: rows.filter((row) => row.kind === 'in'),
		expense: rows.filter((row) => row.kind === 'out')
	};
}
