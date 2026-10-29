import { expect, test } from 'bun:test';
import { donutArcs } from '../src/lib/donut.ts';

test('donut arcs share the ring', () => {
	expect(donutArcs([])).toEqual([]);
	expect(donutArcs([0])).toEqual([]);
	const full = donutArcs([100]);
	expect(full).toEqual([{ length: 100, offset: 0 }]);
	const halves = donutArcs([1, 1]);
	expect(halves[0].length).toBeCloseTo(48.5);
	expect(halves[1].offset).toBeCloseTo(50);
	expect(halves[0].length + halves[1].length + 3).toBeCloseTo(100);
});
