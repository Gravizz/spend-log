export type CategoryExpense = { id: number; name: string; total: number };
export type Period = { start: string; end: string };

export function shiftAnalyticsMonth(month: string, delta: number): string {
	const [year, index] = month.split('-').map(Number);
	const offset = year * 12 + index - 1 + delta;
	return `${String(Math.floor(offset / 12)).padStart(4, '0')}-${String(offset % 12 + 1).padStart(2, '0')}`;
}

export function inclusiveEnd(endExclusive: string): string {
	const [year, month, day] = endExclusive.split('-').map(Number);
	const date = new Date(0);
	date.setUTCFullYear(year, month - 1, day - 1);
	return date.toISOString().slice(0, 10);
}

function monthBounds(month: string): Period {
	return { start: `${month}-01`, end: `${shiftAnalyticsMonth(month, 1)}-01` };
}

export function bangkokToday(now: Date): string {
	const parts = new Intl.DateTimeFormat('en-GB', {
		timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit'
	}).formatToParts(now);
	const part = (type: string) => parts.find((p) => p.type === type)!.value;
	return `${part('year')}-${part('month')}-${part('day')}`;
}

export function summaryMonth(params: URLSearchParams, todayISO: string): string {
	const month = params.get('m');
	if (month && /^(?!0000)\d{4}-(0[1-9]|1[0-2])$/.test(month)) return month;
	const year = params.get('y');
	if (year && /^(?!0000)\d{4}$/.test(year)) {
		return year === todayISO.slice(0, 4) ? todayISO.slice(0, 7) : `${year}-01`;
	}
	return todayISO.slice(0, 7);
}

function dayAfter(date: string): string {
	const next = new Date(`${date}T00:00:00Z`);
	next.setUTCDate(next.getUTCDate() + 1);
	return next.toISOString().slice(0, 10);
}

export function analyticsPeriod(month: string, todayISO: string) {
	const previousMonth = shiftAnalyticsMonth(month, -1);
	const mode = month === todayISO.slice(0, 7) ? 'to-date' : month < todayISO.slice(0, 7) ? 'full-month' : 'future';
	const current = monthBounds(month);
	const previous = monthBounds(previousMonth);
	if (mode === 'to-date') {
		current.end = dayAfter(todayISO);
		const lastDay = new Date(`${previous.end}T00:00:00Z`);
		lastDay.setUTCDate(0);
		const day = Math.min(Number(todayISO.slice(8)), lastDay.getUTCDate());
		previous.end = dayAfter(`${previousMonth}-${String(day).padStart(2, '0')}`);
	}
	return { current, previous, mode };
}

export function compareExpenses(current: CategoryExpense[], previous: CategoryExpense[]) {
	const currentTotal = current.reduce((sum, row) => sum + row.total, 0);
	const previousTotal = previous.reduce((sum, row) => sum + row.total, 0);
	const delta = currentTotal - previousTotal;
	const changes = new Map<number, { id: number; name: string; delta: number }>();
	for (const row of previous) changes.set(row.id, { id: row.id, name: row.name, delta: -row.total });
	for (const row of current) changes.set(row.id, { id: row.id, name: row.name, delta: row.total + (changes.get(row.id)?.delta ?? 0) });
	const drivers = [...changes.values()]
		.filter((row) => delta > 0 ? row.delta > 0 : delta < 0 ? row.delta < 0 : false)
		.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta) || a.name.localeCompare(b.name, 'th') || a.id - b.id)
		.slice(0, 2);
	return { currentTotal, previousTotal, delta, percent: previousTotal === 0 ? null : delta / previousTotal * 100, drivers };
}
