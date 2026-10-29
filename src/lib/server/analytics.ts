import { analyticsPeriod, compareExpenses, inclusiveEnd, shiftAnalyticsMonth, type CategoryExpense, type Period } from '../analytics';
import type { Database } from './sqlite';

type SummaryEntryRow = {
	id: number;
	occurred_on: string;
	amount_satang: number;
	note: string;
	category_id: number;
	name: string;
	kind: 'in' | 'out';
};

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
	const previousExpenses = period.mode === 'future' ? [] : categoryTotals(period.previous).filter((row) => row.kind === 'out');
	const comparison = period.mode === 'future' ? null : compareExpenses(categories, previousExpenses);

	const entries = database.query<SummaryEntryRow, [string, string]>(
		`SELECT e.id, e.occurred_on, e.amount_satang, e.note, e.category_id, c.name, c.kind
		 FROM entries e JOIN categories c ON c.id = e.category_id
		 WHERE e.occurred_on >= ? AND e.occurred_on <= ?
		 ORDER BY e.occurred_on DESC, e.id DESC`
	).all(period.current.start, inclusiveEnd(period.current.end)).map((row) => ({
		...row,
		amount_satang: Number(row.amount_satang),
		note: row.note ?? ''
	}));

	const daysInMonth = Number(inclusiveEnd(`${shiftAnalyticsMonth(month, 1)}-01`).slice(8));
	const elapsedDays = Number(inclusiveEnd(period.current.end).slice(8));
	const dailyByDate = new Map<string, { total: number; count: number }>();
	for (const entry of entries) {
		if (entry.kind !== 'out') continue;
		const prev = dailyByDate.get(entry.occurred_on) ?? { total: 0, count: 0 };
		dailyByDate.set(entry.occurred_on, { total: prev.total + entry.amount_satang, count: prev.count + 1 });
	}

	const [yearNum, monthNum] = month.split('-').map(Number);
	let weekdayTotal = 0, weekdayCount = 0, weekendTotal = 0, weekendCount = 0;
	const dailyExpenses = Array.from({ length: elapsedDays }, (_, index) => {
		const day = index + 1;
		const date = `${month}-${String(day).padStart(2, '0')}`;
		const d = new Date(0);
		d.setUTCFullYear(yearNum, monthNum - 1, day);
		const isWeekend = d.getUTCDay() === 0 || d.getUTCDay() === 6;
		const stat = dailyByDate.get(date) ?? { total: 0, count: 0 };
		if (isWeekend) { weekendTotal += stat.total; weekendCount++; }
		else { weekdayTotal += stat.total; weekdayCount++; }
		return { date, day, total: stat.total, count: stat.count, isWeekend };
	});

	const activeSpendDays = dailyByDate.size;
	const pace = {
		daysInMonth,
		elapsedDays,
		dailyAverage: elapsedDays > 0 ? Math.round(expense / elapsedDays) : 0,
		projectedExpense: period.mode === 'to-date' ? Math.round((expense / elapsedDays) * daysInMonth) : period.mode === 'full-month' ? expense : null,
		activeSpendDays,
		noSpendDays: period.mode === 'future' ? 0 : elapsedDays - activeSpendDays,
		weekdayAverage: weekdayCount > 0 ? Math.round(weekdayTotal / weekdayCount) : 0,
		weekendAverage: weekendCount > 0 ? Math.round(weekendTotal / weekendCount) : 0
	};
	const savingsRate = income > 0 ? ((income - expense) / income) * 100 : null;
	const topExpenses = entries
		.filter((e) => e.kind === 'out')
		.sort((a, b) => b.amount_satang - a.amount_satang || b.occurred_on.localeCompare(a.occurred_on) || b.id - a.id)
		.slice(0, 3);
	const previousByCat = new Map(previousExpenses.map((row) => [row.id, row.total]));
	const categoryDetails = categories.map((cat) => {
		const catEntries = entries
			.filter((e) => e.kind === 'out' && e.category_id === cat.id)
			.map(({ id, occurred_on, amount_satang, note }) => ({ id, occurred_on, amount_satang, note }));
		const previousTotal = previousByCat.get(cat.id) ?? 0;
		return {
			...cat,
			count: catEntries.length,
			average: Math.round(cat.total / catEntries.length),
			previousTotal,
			delta: cat.total - previousTotal,
			entries: catEntries
		};
	});

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
	return {
		month,
		today: todayISO,
		period,
		income,
		expense,
		net: income - expense,
		savingsRate,
		pace,
		dailyExpenses,
		categories,
		categoryDetails,
		topExpenses,
		comparison,
		yearMonths
	};
}
