import type { Kind } from './db';
import type { Database } from './sqlite';

export type QuickChip = {
	category_id: number;
	name: string;
	kind: Kind;
	amount_satang: number;
	note: string;
	count: number;
};

const quickChipsByKindSql = `
	SELECT e.category_id, c.name, c.kind, e.amount_satang, e.note, COUNT(*) AS count
	FROM entries e
	JOIN categories c ON c.id = e.category_id
	WHERE c.kind = ?
	GROUP BY e.category_id, e.amount_satang, e.note
	ORDER BY count DESC, MAX(e.occurred_on) DESC, MAX(e.id) DESC
	LIMIT ?
`;

export function loadQuickChips(database: Database, limitPerKind = 6): QuickChip[] {
	const queryKind = (kind: Kind) =>
		database
			.query<QuickChip, [Kind, number]>(quickChipsByKindSql)
			.all(kind, limitPerKind)
			.map((row) => ({
				...row,
				category_id: Number(row.category_id),
				amount_satang: Number(row.amount_satang),
				note: row.note ?? '',
				count: Number(row.count)
			}));

	return [...queryKind('out'), ...queryKind('in')];
}
