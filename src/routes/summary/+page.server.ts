import { bangkokToday, summaryMonth } from '#lib/analytics';
import { loadSummary } from '#lib/server/analytics';
import { db } from '#lib/server/db';

export function load({ url }) {
	const today = bangkokToday(new Date());
	return loadSummary(db, summaryMonth(url.searchParams, today), today);
}
