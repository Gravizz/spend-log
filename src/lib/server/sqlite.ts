import { DatabaseSync, type SQLInputValue, type StatementResultingChanges } from 'node:sqlite';

// Keep the existing typed query API while using SQLite built into both Node and Bun.
export class Database extends DatabaseSync {
	query<Row = Record<string, unknown>, Params extends SQLInputValue[] = SQLInputValue[]>(sql: string) {
		return this.prepare(sql) as unknown as {
			all(...params: Params): Row[];
			get(...params: Params): Row | undefined;
			run(...params: Params): StatementResultingChanges;
		};
	}
}
