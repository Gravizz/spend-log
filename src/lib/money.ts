export function bahtToSatang(input: string): number | null {
	const text = input.trim().replace(/,/g, '');
	if (!/^\d+(\.\d{1,2})?$/.test(text)) return null;
	const [whole, frac = ''] = text.split('.');
	const satang = Number(whole) * 100 + Number(frac.padEnd(2, '0'));
	if (!Number.isSafeInteger(satang) || satang <= 0) return null;
	return satang;
}

export function formatBaht(satang: number): string {
	return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(satang / 100);
}
