import { analyticsPeriod, compareExpenses, inclusiveEnd, type CategoryExpense, type Period } from '../analytics';
import type { Database } from './sqlite';

export function loadSummary(database: Database, month: string, todayISO: string) {
	const period = analyticsPeriod(month, todayISO);
	const categoryTotals = (bounds: Period) => database.query<CategoryExpense & { kind: 'in' | 'out' }, [string, string]>(
		`SELECT c.id, c.name, c.kind, SUM(e.amount_satang) AS total
		 FROM entries e JOIN categories c ON c.id = e.category_id
		 WHERE e.occurred_on >= ? AND e.occurred_on <= ?
		 GROUP BY c.id, c.name, c.kind`
	).all(bounds.start, inclusiveEnd(bounds.end)).map((row) => ({ ...row, total: Number(row.total) }));
	const totals = categoryTotals(period.current);
	const categories: CategoryExpense[] = totals.filter((row) => row.kind === 'out')
		.map(({ id, name, total }) => ({ id, name, total }))
		.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, 'th') || a.id - b.id);
	const income = totals.filter((row) => row.kind === 'in').reduce((sum, row) => sum + row.total, 0);
	const expense = categories.reduce((sum, row) => sum + row.total, 0);
	const comparison = period.mode === 'future' ? null : compareExpenses(categories,
		categoryTotals(period.previous).filter((row) => row.kind === 'out'));
	const year = Number(month.slice(0, 4));
	const annual = database.query<{ month: string; kind: 'in' | 'out'; total: number }, [string, string]>(
		`SELECT substr(e.occurred_on, 1, 7) AS month, c.kind, SUM(e.amount_satang) AS total
		 FROM entries e JOIN categories c ON c.id = e.category_id
		 WHERE e.occurred_on >= ? AND e.occurred_on <= ?
		 GROUP BY month, c.kind`
	).all(`${String(year).padStart(4, '0')}-01-01`, `${String(year).padStart(4, '0')}-12-31`);
	const byMonth = new Map(annual.map((row) => [`${row.month}:${row.kind}`, Number(row.total)]));
	const yearMonths = Array.from({ length: 12 }, (_, index) => {
		const key = `${month.slice(0, 4)}-${String(index + 1).padStart(2, '0')}`;
		const income = byMonth.get(`${key}:in`) ?? 0;
		const expense = byMonth.get(`${key}:out`) ?? 0;
		return { month: key, income, expense, net: income - expense };
	});
	return { month, today: todayISO, period, income, expense, net: income - expense, categories, comparison, yearMonths };
}
