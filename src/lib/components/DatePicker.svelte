<script lang="ts">
	import { tick, untrack } from 'svelte';
	import { calendarDays } from '#lib/calendar';
	import { shiftAnalyticsMonth } from '#lib/analytics';
	import { parseDate } from '#lib/month';
	import Calendar from '@lucide/svelte/icons/calendar';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	let { value, today, onchange }: {
		value: string;
		today: string;
		onchange: (date: string) => void;
	} = $props();
	const id = $props.id();
	let trigger: HTMLButtonElement;
	let popup: HTMLDivElement;
	let open = $state(false);
	let month = $state(untrack(() => today.slice(0, 7)));
	let left = $state(0);
	let top = $state(0);
	const days = $derived(calendarDays(month));
	const monthLabel = $derived(new Intl.DateTimeFormat('th-TH', {
		month: 'long', year: 'numeric', timeZone: 'UTC'
	}).format(new Date(`${month}-01T00:00:00Z`)));
	const label = $derived(parseDate(value) ? formatDate(value, true) : 'เลือกวัน');

	function formatDate(date: string, compact = false) {
		return new Intl.DateTimeFormat('th-TH', {
			day: 'numeric', month: 'short', year: compact ? '2-digit' : 'numeric', timeZone: 'UTC'
		}).format(new Date(`${date}T00:00:00Z`));
	}

	async function toggle() {
		if (open) { popup.hidePopover(); return; }
		month = (parseDate(value) ? value : today).slice(0, 7);
		popup.showPopover();
		await tick();
		positionPopup();
		await tick();
		popup.querySelector<HTMLButtonElement>(`[data-date="${value}"]`)?.focus();
	}

	function positionPopup() {
		const rect = trigger.getBoundingClientRect();
		left = Math.max(12, Math.min(rect.left, window.innerWidth - 316));
		const height = popup.getBoundingClientRect().height;
		top = rect.bottom + 8 + height <= window.innerHeight - 12
			? rect.bottom + 8 : Math.max(12, rect.top - height - 8);
	}

	async function browseMonth(delta: number) {
		month = shiftAnalyticsMonth(month, delta);
		await tick();
		positionPopup();
	}

	function choose(date: string) {
		onchange(date);
		popup.hidePopover();
		trigger.focus();
	}

	async function moveFocus(event: KeyboardEvent) {
		const target = event.target as HTMLElement;
		const date = target.dataset.date;
		if (!date) return;
		const offsets: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
		const offset = offsets[event.key];
		if (offset === undefined) return;
		event.preventDefault();
		const next = new Date(`${date}T00:00:00Z`);
		next.setUTCDate(next.getUTCDate() + offset);
		const iso = next.toISOString().slice(0, 10);
		if (!parseDate(iso)) return;
		month = iso.slice(0, 7);
		await tick();
		positionPopup();
		await tick();
		popup.querySelector<HTMLButtonElement>(`[data-date="${iso}"]`)?.focus();
	}
</script>

<svelte:window onresize={() => popup?.hidePopover()} onscroll={() => popup?.hidePopover()} />

<input type="hidden" name="occurred_on" {value} />
<button
	bind:this={trigger}
	type="button"
	class="mt-1 flex h-8 min-h-8 w-full min-w-0 items-center gap-1.5 rounded-lg border border-[#dcc1b5]/40 bg-white/60 px-2 py-0 text-left text-xs font-semibold text-[#1c1c17] hover:bg-white hover:brightness-100"
	aria-label={`วันที่ ${label}`}
	aria-haspopup="dialog"
	aria-expanded={open}
	aria-controls={id}
	onclick={toggle}
>
	<Calendar class="size-4 shrink-0 text-[#9b450f]" aria-hidden="true" />
	<span class="min-w-0 flex-1 truncate">{label}</span>
	<ChevronDown class="size-3 shrink-0 text-[#9b450f]" aria-hidden="true" />
</button>

<div
	bind:this={popup}
	{id}
	popover="auto"
	role="dialog"
	tabindex="-1"
	aria-label="เลือกวันที่"
	ontoggle={(event) => (open = event.newState === 'open')}
	onkeydown={moveFocus}
	style:left={`${left}px`}
	style:top={`${top}px`}
	class="fixed m-0 w-[304px] max-w-[calc(100vw-24px)] max-h-[calc(100dvh-24px)] overflow-y-auto rounded-3xl border border-[#dcc1b5]/40 bg-white p-4 text-[#1c1c17] shadow-[0_0.6rem_1.4rem_rgba(28,28,23,0.12)]"
>
	<div class="mb-3 flex items-center justify-between gap-2">
		<p class="m-0 font-display text-base font-bold" aria-live="polite">{monthLabel}</p>
		<div class="flex gap-1">
			<button type="button" aria-label="เดือนก่อนหน้า" disabled={month === '0000-01'}
				class="grid size-9 min-h-9 place-items-center rounded-full border-0 bg-[#f7f3eb] p-0 text-[#55433a] hover:bg-[#ece8e0] hover:brightness-100 disabled:opacity-40"
				onclick={() => browseMonth(-1)}>
				<ChevronLeft class="size-4" aria-hidden="true" />
			</button>
			<button type="button" aria-label="เดือนถัดไป" disabled={month === '9999-12'}
				class="grid size-9 min-h-9 place-items-center rounded-full border-0 bg-[#f7f3eb] p-0 text-[#55433a] hover:bg-[#ece8e0] hover:brightness-100 disabled:opacity-40"
				onclick={() => browseMonth(1)}>
				<ChevronRight class="size-4" aria-hidden="true" />
			</button>
		</div>
	</div>
	<div class="grid grid-cols-7 gap-1 text-center">
		{#each ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'] as day}
			<span class="pb-1 text-[0.6875rem] font-semibold text-[#897268]" aria-hidden="true">{day}</span>
		{/each}
		{#each days as date, index (date ?? index)}
			{#if date}
				<button type="button" data-date={date} aria-label={formatDate(date)}
					aria-pressed={date === value} aria-current={date === today ? 'date' : undefined}
					class="grid aspect-square min-h-9 place-items-center rounded-full border p-0 text-sm font-semibold hover:brightness-100 {date === value
						? 'border-[#e07a42] bg-[#e07a42] text-white shadow-2xs'
						: `${date === today ? 'border-[#e07a42] text-[#9b450f]' : 'border-transparent text-[#55433a]'} bg-[#f7f3eb] hover:bg-[#ffeed4]`}"
					onclick={() => choose(date)}>{Number(date.slice(8))}</button>
			{:else}<span aria-hidden="true"></span>{/if}
		{/each}
	</div>
	<div class="mt-3 flex items-center justify-between border-t border-[#dcc1b5]/30 pt-3">
		<button type="button" class="min-h-9 rounded-full border-0 bg-[#ffeed4] px-3 py-1 text-xs font-bold text-[#9b450f] hover:bg-[#ffe4bd] hover:brightness-100" onclick={() => choose(today)}>วันนี้</button>
		<button type="button" class="min-h-9 rounded-full border-0 bg-transparent px-3 py-1 text-xs font-semibold text-[#55433a] hover:bg-[#f7f3eb] hover:brightness-100" onclick={() => { popup.hidePopover(); trigger.focus(); }}>ปิด</button>
	</div>
</div>
