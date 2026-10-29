export function donutArcs(totals: number[]) {
	const sum = totals.reduce((total, value) => total + value, 0);
	if (sum <= 0) return [];
	const gap = totals.length > 1 ? 1.5 : 0;
	const usable = 100 - gap * totals.length;
	let offset = 0;
	return totals.map((total) => {
		const length = (total / sum) * usable;
		const arc = { length, offset };
		offset += length + gap;
		return arc;
	});
}
