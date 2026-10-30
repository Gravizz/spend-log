export function calendarDays(month: string): (string | null)[] {
	const first = new Date(`${month}-01T00:00:00Z`);
	const last = new Date(first);
	last.setUTCMonth(last.getUTCMonth() + 1, 0);
	return [
		...Array<null>(first.getUTCDay()).fill(null),
		...Array.from({ length: last.getUTCDate() }, (_, index) =>
			`${month}-${String(index + 1).padStart(2, '0')}`
		)
	];
}
