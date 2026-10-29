# Monthly analytics validation — 2026-10-29

Implemented on `codex/monthly-analytics` without schema changes or new dependencies.

- `bun test`: 23 passed, 0 failed (14 analytics tests + 9 existing tests).
- `bun run check`: 0 errors, 0 warnings.
- `bun run build`: passed.
- `git diff --check`: passed; Git reports existing Windows LF/CRLF normalization notices.

Browser acceptance used a separate local `data/analytics-acceptance.db`, with fixture-only credentials. No real entries were changed. Checked production build at widths 360, 390 and 768 px: no document overflow, all 19 expense categories visible, long category names and a million-baht expense readable.

Verified current-to-date, completed-month equality with changed category composition, future month with no comparison, empty month, zero comparison base and income-only month. Verified legacy year links, invalid-month fallback, previous-month navigation, month picker, return to current month, annual numeric details and link to existing transaction page. Keyboard checks passed for chart scrolling and month selection. Chart automatically reveals the selected month without moving the page to the chart. Current browser page had no console errors or warnings.

Fresh independent review found two defects: accepted edge-year ranges and the one-satang maximum label. Both are fixed. Edge-year period/query regression tests were observed failing then passing; browser rendering returned HTTP 200 for 0001-01, 0099-12, 0100-01, 1000-01 and 9999-12. A real fixture with a one-satang annual maximum displayed `฿0.01` correctly.

Date handling decision: keep end-exclusive periods in the calculation API; bind their inclusive last date to SQLite using `<=` to preserve lexical order at year 9999. Analytics uses its own padded civil-month arithmetic; existing transaction date helpers are untouched. Amount arithmetic remains integer satang; percentages are presentation values.

Performance review: constant 2–3 aggregate queries per summary load, no per-month/per-category queries, and no raw annual entry payload. No additional index, cache or dependency was justified for this scope.

Limits: desktop browser emulation is not physical-device acceptance. Summary covers recorded entries; current-month totals stop at today in Bangkok, while annual bars include all entries dated in each month, including future entries, as explained in the UI. No commit, merge or deployment performed.
