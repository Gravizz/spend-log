import { expect, test } from 'bun:test';
import { calendarDays } from '../src/lib/calendar';

test('calendar aligns Sunday-first dates and includes the last day', () => {
	const days = calendarDays('2026-10');
	expect(days.slice(0, 5)).toEqual([null, null, null, null, '2026-10-01']);
	expect(days.at(-1)).toBe('2026-10-31');
	expect(days.filter(Boolean)).toHaveLength(31);
});

test('calendar handles leap years, short months and four-digit civil years', () => {
	expect(calendarDays('2024-02').filter(Boolean)).toHaveLength(29);
	expect(calendarDays('2026-02').filter(Boolean)).toHaveLength(28);
	expect(calendarDays('0099-02').filter(Boolean)).toHaveLength(28);
	expect(calendarDays('2026-11')[0]).toBe('2026-11-01');
});
