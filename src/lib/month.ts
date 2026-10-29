const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

export function currentMonth(now = new Date()): string {
	const month = String(now.getMonth() + 1).padStart(2, '0');
	return `${now.getFullYear()}-${month}`;
}

export function today(now = new Date()): string {
	const day = String(now.getDate()).padStart(2, '0');
	return `${currentMonth(now)}-${day}`;
}

export function parseMonth(value: string | null, now = new Date()): string {
	if (value && MONTH.test(value)) return value;
	return currentMonth(now);
}

export function shiftMonth(month: string, delta: number): string {
	const [year, monthIndex] = month.split('-').map(Number);
	return currentMonth(new Date(year, monthIndex - 1 + delta, 1));
}

export function monthBounds(month: string): { start: string; end: string } {
	return { start: `${month}-01`, end: `${shiftMonth(month, 1)}-01` };
}

export function formatMonth(month: string): string {
	const [year, monthIndex] = month.split('-').map(Number);
	return new Intl.DateTimeFormat('th-TH-u-ca-gregory', { month: 'long', year: 'numeric' }).format(
		new Date(year, monthIndex - 1, 1)
	);
}

export function parseDate(value: string): string | null {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
	const date = new Date(`${value}T00:00:00Z`);
	if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null;
	return value;
}
