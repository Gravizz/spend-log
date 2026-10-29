import { expect, test } from 'bun:test';
import { bahtToSatang, satangToInputBaht } from '../src/lib/money.ts';
import { monthBounds, parseDate, parseMonth, shiftMonth, today } from '../src/lib/month.ts';

test('baht to satang', () => {
	expect(bahtToSatang('1,250.50')).toBe(125050);
	expect(bahtToSatang('0.5')).toBe(50);
	expect(bahtToSatang('0')).toBeNull();
	expect(bahtToSatang('-1')).toBeNull();
	expect(bahtToSatang('1.234')).toBeNull();
	expect(bahtToSatang('')).toBeNull();
});

test('satangToInputBaht formats integer and fractional satang for bahtToSatang round-trip', () => {
	expect(satangToInputBaht(6000)).toBe('60');
	expect(satangToInputBaht(10050)).toBe('100.5');
	expect(satangToInputBaht(10005)).toBe('100.05');
	expect(bahtToSatang(satangToInputBaht(10005))).toBe(10005);
});

test('month bounds', () => {
	expect(monthBounds('2026-10')).toEqual({ start: '2026-10-01', end: '2026-11-01' });
	expect(monthBounds('2026-12')).toEqual({ start: '2026-12-01', end: '2027-01-01' });
	expect(parseMonth('2026-13', new Date(2026, 9, 15))).toBe('2026-10');
	expect(parseMonth(null, new Date(2026, 9, 15))).toBe('2026-10');
	expect(shiftMonth('2026-01', -1)).toBe('2025-12');
	expect(today(new Date(2026, 9, 5))).toBe('2026-10-05');
	expect(parseDate('2026-02-28')).toBe('2026-02-28');
	expect(parseDate('2026-02-31')).toBeNull();
});
