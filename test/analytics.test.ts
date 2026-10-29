import { expect, test } from 'bun:test';
import { analyticsPeriod, bangkokToday, compareExpenses, summaryMonth, shiftAnalyticsMonth, inclusiveEnd } from '../src/lib/analytics';

test('all accepted four-digit years preserve padded civil bounds without Date year remapping', () => {
	expect(shiftAnalyticsMonth('0001-01', -1)).toBe('0000-12');
	expect(shiftAnalyticsMonth('0099-12', 1)).toBe('0100-01');
	expect(analyticsPeriod('0001-01', '2026-10-29').current.end).toBe('0001-02-01');
	expect(analyticsPeriod('1000-01', '2026-10-29').previous.start).toBe('0999-12-01');
	expect(inclusiveEnd('10000-01-01')).toBe('9999-12-31');
	expect(inclusiveEnd('2024-03-01')).toBe('2024-02-29');
});

test('current month compares elapsed days with exclusive query bounds', () => {
	expect(analyticsPeriod('2026-10', '2026-10-29')).toEqual({
		current: { start: '2026-10-01', end: '2026-10-30' },
		previous: { start: '2026-09-01', end: '2026-09-30' }, mode: 'to-date'
	});
});

test('comparison clamps short months and handles leap years and year rollover', () => {
	expect(analyticsPeriod('2026-03', '2026-03-31').previous).toEqual({ start: '2026-02-01', end: '2026-03-01' });
	expect(analyticsPeriod('2024-03', '2024-03-31').previous).toEqual({ start: '2024-02-01', end: '2024-03-01' });
	expect(analyticsPeriod('2026-01', '2026-01-05').previous).toEqual({ start: '2025-12-01', end: '2025-12-06' });
});

test('past and future months use full months with distinct modes', () => {
	expect(analyticsPeriod('2026-09', '2026-10-29')).toEqual({
		current: { start: '2026-09-01', end: '2026-10-01' },
		previous: { start: '2026-08-01', end: '2026-09-01' }, mode: 'full-month'
	});
	expect(analyticsPeriod('2026-11', '2026-10-29').mode).toBe('future');
});

test('Bangkok date changes at 17:00 UTC independently of server timezone', () => {
	expect(bangkokToday(new Date('2026-10-28T17:00:00Z'))).toBe('2026-10-29');
	expect(bangkokToday(new Date('2026-10-28T16:59:59Z'))).toBe('2026-10-28');
});

test('month URL takes precedence, legacy years remain usable, invalid values fall back', () => {
	const select = (query: string) => summaryMonth(new URLSearchParams(query), '2026-10-29');
	expect(select('')).toBe('2026-10');
	expect(select('m=2026-13')).toBe('2026-10');
	expect(select('m=2026-09&y=2025')).toBe('2026-09');
	expect(select('y=2026')).toBe('2026-10');
	expect(select('y=2025')).toBe('2025-01');
	expect(select('y=0000')).toBe('2026-10');
});

test('expense comparison preserves integer satang and computes percentages', () => {
	const result = compareExpenses([{ id: 1, name: 'อาหาร', total: 12000 }], [{ id: 1, name: 'อาหาร', total: 10000 }]);
	expect(result).toEqual({ currentTotal: 12000, previousTotal: 10000, delta: 2000, percent: 20, drivers: [{ id: 1, name: 'อาหาร', delta: 2000 }] });
	expect(compareExpenses([], []).percent).toBeNull();
	expect(compareExpenses([{ id: 1, name: 'อาหาร', total: 1 }], []).percent).toBeNull();
	expect(compareExpenses([], [{ id: 1, name: 'อาหาร', total: 100 }]).percent).toBe(-100);
});

test('drivers include missing categories and follow net direction, at most two', () => {
	const result = compareExpenses([
		{ id: 1, name: 'ใหม่', total: 600 }, { id: 2, name: 'ลดลง', total: 10 },
		{ id: 4, name: 'เพิ่ม', total: 200 }, { id: 5, name: 'เพิ่มน้อย', total: 100 }
	], [{ id: 2, name: 'ลดลง', total: 100 }, { id: 3, name: 'หายไป', total: 500 }]);
	expect(result.delta).toBe(310);
	expect(result.drivers.map((d) => d.id)).toEqual([1, 4]);
	expect(compareExpenses([], [{ id: 3, name: 'หายไป', total: 500 }]).drivers[0].delta).toBe(-500);
	expect(compareExpenses([{ id: 1, name: 'ใหม่', total: 500 }], [{ id: 3, name: 'หายไป', total: 500 }]).drivers).toEqual([]);
});
