# Smart 1-Tap Chips Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add zero-setup Smart 1-Tap Chips to the home page so users can record their most frequent income and expense entries in a single tap.

**Architecture:** A server query helper (`loadQuickChips`) aggregates historical `entries` joined with `categories` by `(category_id, amount_satang, note)` and returns up to 6 top presets per kind (`out` and `in`), ranked by frequency and recency. The home page (`+page.server.ts` / `+page.svelte`) loads these chips and renders each chip for the active kind (when not editing) as a compact `<form method="post" action="?/create">` that submits immediately using the currently selected date.

**Tech Stack:** SvelteKit (Svelte 5 runes), TypeScript, SQLite (`src/lib/server/sqlite.ts`), Tailwind CSS v4, Bun test.

**Spec:** `docs/superpowers/specs/2026-10-29-smart-1-tap-chips-design.md`

## Global Constraints

- Develop inside the isolated worktree (`.worktrees/smart-chips`, branch `feat/smart-chips`) without touching the main working tree.
- Do not modify database schema (`categories`, `entries`) or any `analytics` files.
- Return at most 6 chips per `kind` (`'out'` and `'in'`), ordered by `COUNT(*) DESC, MAX(e.occurred_on) DESC, MAX(e.id) DESC`.
- Hide quick chips while editing an existing entry (`editing !== null`).
- Each chip submits directly to `?/create` in one tap using the active `occurredOn` date (falling back to `data.today` if invalid).

## Review Focus

- Empty `entries` table returns `[]` from `loadQuickChips` and renders no quick-chip section.
- Fractional satang values (e.g. `10005` -> `"100.05"`, `10050` -> `"100.5"`) round-trip through `bahtToSatang` without precision loss.
- Frequency ties break deterministically by `MAX(occurred_on) DESC`, then `MAX(id) DESC`.
- Many `'out'` presets do not starve `'in'` presets; each `kind` gets its own top `limitPerKind` slice.
- Entries with the same `category_id` and `amount_satang` but different `note` (including `""` vs `"ชาเขียว"`) stay distinct chips.

---

### Task 1: Satang-to-Input Helper and Quick Chips Server Query

**Files:**
- Modify: `src/lib/money.ts`
- Create: `src/lib/server/quick-chips.ts`
- Modify: `test/money.test.ts`
- Create: `test/quick-chips.test.ts`

**Interfaces:**
- Consumes: `Database` from `src/lib/server/sqlite.ts`, `Kind` from `src/lib/server/db.ts`
- Produces:
  - `satangToInputBaht(satang: number): string` in `src/lib/money.ts`
  - `export type QuickChip = { category_id: number; name: string; kind: Kind; amount_satang: number; note: string; count: number }` in `src/lib/server/quick-chips.ts`
  - `export function loadQuickChips(database: Database, limitPerKind?: number): QuickChip[]` in `src/lib/server/quick-chips.ts`

- [ ] **Step 1: Write failing tests in `test/money.test.ts` and `test/quick-chips.test.ts`**

Add to `test/money.test.ts`:
```ts
test('satangToInputBaht formats integer and fractional satang for bahtToSatang round-trip', () => {
	expect(satangToInputBaht(6000)).toBe('60');
	expect(satangToInputBaht(10050)).toBe('100.5');
	expect(satangToInputBaht(10005)).toBe('100.05');
	expect(bahtToSatang(satangToInputBaht(10005))).toBe(10005);
});
```

Create `test/quick-chips.test.ts`:
```ts
import { afterEach, beforeEach, expect, test } from 'bun:test';
import { Database } from '../src/lib/server/sqlite';
import { loadQuickChips } from '../src/lib/server/quick-chips';

let db: Database;
beforeEach(() => {
	db = new Database(':memory:');
	db.exec(`CREATE TABLE categories (id INTEGER PRIMARY KEY, name TEXT NOT NULL, kind TEXT NOT NULL);
		CREATE TABLE entries (id INTEGER PRIMARY KEY, occurred_on TEXT NOT NULL, category_id INTEGER NOT NULL, amount_satang INTEGER NOT NULL, note TEXT NOT NULL DEFAULT '');
		INSERT INTO categories VALUES (1, 'กาแฟ', 'out'), (2, 'เดินทาง', 'out'), (3, 'เงินเดือน', 'in');`);
});
afterEach(() => db.close());

function add(date: string, categoryId: number, satang: number, note = '') {
	db.query('INSERT INTO entries (occurred_on, category_id, amount_satang, note) VALUES (?, ?, ?, ?)').run(date, categoryId, satang, note);
}

test('empty database returns no quick chips', () => {
	expect(loadQuickChips(db)).toEqual([]);
});

test('ranks by frequency then latest date then latest id, keeping blank and noted entries distinct', () => {
	add('2026-10-01', 1, 6000, 'ลาเต้');
	add('2026-10-05', 1, 6000, 'ลาเต้');
	add('2026-10-02', 1, 6000, '');
	add('2026-10-03', 2, 4500, 'BTS');
	add('2026-10-03', 2, 3500, 'วิน');

	const chips = loadQuickChips(db);
	expect(chips).toEqual([
		{ category_id: 1, name: 'กาแฟ', kind: 'out', amount_satang: 6000, note: 'ลาเต้', count: 2 },
		{ category_id: 2, name: 'เดินทาง', kind: 'out', amount_satang: 3500, note: 'วิน', count: 1 },
		{ category_id: 2, name: 'เดินทาง', kind: 'out', amount_satang: 4500, note: 'BTS', count: 1 },
		{ category_id: 1, name: 'กาแฟ', kind: 'out', amount_satang: 6000, note: '', count: 1 }
	]);
});

test('limits each kind independently so out chips do not crowd out in chips', () => {
	add('2026-10-01', 1, 5000, 'A');
	add('2026-10-02', 1, 5500, 'B');
	add('2026-10-03', 1, 6000, 'C');
	add('2026-10-01', 3, 3000000, 'เงินเดือนประจำ');

	const chips = loadQuickChips(db, 2);
	expect(chips.filter((c) => c.kind === 'out')).toHaveLength(2);
	expect(chips.filter((c) => c.kind === 'in')).toEqual([
		{ category_id: 3, name: 'เงินเดือน', kind: 'in', amount_satang: 3000000, note: 'เงินเดือนประจำ', count: 1 }
	]);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test test/money.test.ts test/quick-chips.test.ts`
Expected: FAIL (`satangToInputBaht` not exported / `../src/lib/server/quick-chips` not found)

- [ ] **Step 3: Implement `satangToInputBaht` in `src/lib/money.ts` and `loadQuickChips` in `src/lib/server/quick-chips.ts`**

In `src/lib/money.ts`, export `satangToInputBaht(satang: number): string` using integer math (`Math.trunc(satang / 100)` and `satang % 100`, stripping a trailing zero on `.X0`).
In `src/lib/server/quick-chips.ts`, query each kind (`'out'` and `'in'`) with:
```sql
SELECT e.category_id, c.name, c.kind, e.amount_satang, e.note, COUNT(*) AS count
FROM entries e
JOIN categories c ON c.id = e.category_id
WHERE c.kind = ?
GROUP BY e.category_id, e.amount_satang, e.note
ORDER BY count DESC, MAX(e.occurred_on) DESC, MAX(e.id) DESC
LIMIT ?
```
Coerce `amount_satang` and `count` with `Number(...)`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test test/money.test.ts test/quick-chips.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/money.ts src/lib/server/quick-chips.ts test/money.test.ts test/quick-chips.test.ts
git commit -m "feat(chips): add quick chips query and satang input formatter"
```

---

### Task 2: Home Page Integration for Smart 1-Tap Chips

**Files:**
- Modify: `src/routes/+page.server.ts`
- Modify: `src/routes/+page.svelte`

**Interfaces:**
- Consumes:
  - `loadQuickChips` from `#lib/server/quick-chips`
  - `satangToInputBaht` from `#lib/money`
- Produces:
  - `data.quickChips` returned from `load()` in `src/routes/+page.server.ts`
  - Instant 1-tap chip forms inside the entry card in `src/routes/+page.svelte`

- [ ] **Step 1: Wire `quickChips` into `src/routes/+page.server.ts`**

Import `loadQuickChips` from `#lib/server/quick-chips` and add `quickChips: loadQuickChips(db)` to the object returned by `load({ url })`.

- [ ] **Step 2: Render Smart 1-Tap Chips in `src/routes/+page.svelte`**

In `src/routes/+page.svelte`:
- Import `satangToInputBaht` from `#lib/money` and `Zap` (or `Sparkles`) from `@lucide/svelte/icons/...`.
- Derive `visibleChips = $derived(data.quickChips.filter((chip) => chip.kind === activeKind))` and `chipOccurredOn = $derived(/^\d{4}-\d{2}-\d{2}$/.test(occurredOn) ? occurredOn : data.today)`.
- Inside the entry form `<section>`, when `!editing && visibleChips.length > 0`, render a quick-chips block above the main `<form>` with label `"กดซ้ำในคลิกเดียว"` and a flex-wrap list of `<form method="post" action="?/create">` items.
- Each chip form contains hidden inputs for `occurred_on={chipOccurredOn}`, `category_id={chip.category_id}`, `amount={satangToInputBaht(chip.amount_satang)}`, `note={chip.note}`, and a submit `<button type="submit">` showing `{categoryEmoji(chip.name, chip.kind)}`, `{chip.note || chip.name}`, and `{formatAmount(chip.amount_satang)} บ.`.

- [ ] **Step 3: Run typecheck and full test suite**

Run: `bun run check && bun test`
Expected: `svelte-check found 0 errors and 0 warnings` and all tests PASS.

- [ ] **Step 4: Commit**

```bash
git add src/routes/+page.server.ts src/routes/+page.svelte
git commit -m "feat(home): add smart 1-tap chips to entry card"
```
