export function bahtToSatang(input: string): number | null {
	const text = input.trim().replace(/,/g, '');
	if (!/^\d+(\.\d{1,2})?$/.test(text)) return null;
	const [whole, frac = ''] = text.split('.');
	const satang = Number(whole) * 100 + Number(frac.padEnd(2, '0'));
	if (!Number.isSafeInteger(satang) || satang <= 0) return null;
	return satang;
}

export function satangToInputBaht(satang: number): string {
	const whole = Math.trunc(satang / 100);
	const frac = satang % 100;
	if (frac === 0) return String(whole);
	return `${whole}.${String(frac).padStart(2, '0').replace(/0$/, '')}`;
}

export function formatBaht(satang: number): string {
	return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(satang / 100);
}
