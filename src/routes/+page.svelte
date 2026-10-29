<script lang="ts">
	import { goto } from '$app/navigation';
	import { satangToInputBaht } from '#lib/money';
	import ArrowDownLeft from '@lucide/svelte/icons/arrow-down-left';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import Banknote from '@lucide/svelte/icons/banknote';
	import Calendar from '@lucide/svelte/icons/calendar';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import CirclePlus from '@lucide/svelte/icons/circle-plus';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Zap from '@lucide/svelte/icons/zap';
	import type { PageProps } from './$types';

	const monthNames = [
		'ม.ค.',
		'ก.พ.',
		'มี.ค.',
		'เม.ย.',
		'พ.ค.',
		'มิ.ย.',
		'ก.ค.',
		'ส.ค.',
		'ก.ย.',
		'ต.ค.',
		'พ.ย.',
		'ธ.ค.'
	];

	let { data, form }: PageProps = $props();

	const editing = $derived(data.editing);
	let pickedDate = $state<string | null>(null);
	const occurredOn = $derived(pickedDate ?? form?.occurred_on ?? editing?.occurred_on ?? data.today);
	const chipOccurredOn = $derived(/^\d{4}-\d{2}-\d{2}$/.test(occurredOn) ? occurredOn : data.today);
	const dateLabel = $derived(
		/^\d{4}-\d{2}-\d{2}$/.test(occurredOn) ? formatDay(occurredOn, true) : 'เลือกวัน'
	);

	$effect(() => {
		editing?.id;
		form?.occurred_on;
		pickedDate = null;
	});
	const initialCategoryId = $derived(
		form?.category_id ?? (editing ? String(editing.category_id) : '')
	);
	const amount = $derived(
		form?.amount ?? (editing ? String(editing.amount_satang / 100) : '')
	);
	const note = $derived(form?.note ?? editing?.note ?? '');

	let open = $state(false);
	let pickYear = $state(0);
	let selectedKind = $state<'out' | 'in' | null>(null);
	let pickedCategoryId = $state<string | null>(null);

	const activeKind = $derived.by((): 'out' | 'in' => {
		if (selectedKind) return selectedKind;
		const matched = data.categories.find((c) => String(c.id) === initialCategoryId);
		if (matched) return matched.kind;
		if (data.categories.some((c) => c.kind === 'out')) return 'out';
		return 'in';
	});

	const visibleCategories = $derived.by(() => {
		const filtered = data.categories.filter((c) => c.kind === activeKind);
		return filtered.length > 0 ? filtered : data.categories;
	});

	const visibleChips = $derived(data.quickChips.filter((chip) => chip.kind === activeKind));

	const activeCategoryId = $derived.by(() => {
		if (pickedCategoryId && visibleCategories.some((c) => String(c.id) === pickedCategoryId)) {
			return pickedCategoryId;
		}
		if (initialCategoryId && visibleCategories.some((c) => String(c.id) === initialCategoryId)) {
			return initialCategoryId;
		}
		return visibleCategories[0] ? String(visibleCategories[0].id) : '';
	});

	function selectKind(nextKind: 'out' | 'in') {
		selectedKind = nextKind;
		const first = data.categories.find((c) => c.kind === nextKind);
		pickedCategoryId = first ? String(first.id) : null;
	}

	function toggleMonth() {
		open = !open;
		if (open) pickYear = Number(data.month.slice(0, 4));
	}

	function chooseMonth(month: number) {
		open = false;
		const value = `${pickYear}-${String(month).padStart(2, '0')}`;
		if (value !== data.month) goto(`?m=${value}`);
	}

	function formatMonthLabel(month: string) {
		const [year, index] = month.split('-').map(Number);
		const name = new Intl.DateTimeFormat('th-TH-u-ca-gregory', { month: 'long' }).format(
			new Date(year, index - 1, 1)
		);
		return `${name} ${year + 543}`;
	}

	function formatDay(iso: string, withYear = false) {
		const [year, month, day] = iso.split('-').map(Number);
		return new Intl.DateTimeFormat('th-TH-u-ca-gregory', {
			day: 'numeric',
			month: 'short',
			...(withYear ? { year: '2-digit' as const } : {})
		}).format(new Date(year, month - 1, day));
	}

	function formatAmount(satang: number) {
		return new Intl.NumberFormat('th-TH', {
			minimumFractionDigits: satang % 100 === 0 ? 0 : 2,
			maximumFractionDigits: 2
		}).format(satang / 100);
	}

	function categoryEmoji(name: string, kind: 'in' | 'out') {
		if (/กาแฟ|เครื่องดื่ม|ชา|น้ำ/.test(name)) return '☕';
		if (/อาหาร|กิน|ข้าว|ขนม/.test(name)) return '🍜';
		if (/ของใช้|ช้อป|บ้าน|เสื้อ/.test(name)) return '🧺';
		if (/เดินทาง|รถ|น้ำมัน/.test(name)) return '🚆';
		if (/สตรีม|หนัง|เกม|บันเทิง/.test(name)) return '🎬';
		if (/เงินเดือน|งาน|โบนัส/.test(name)) return '💼';
		if (/เงินคืน|ดอกเบี้ย|ออม|ปันผล/.test(name)) return '🪙';
		return kind === 'in' ? '💰' : '🏷️';
	}
</script>

{#if open}
	<button
		class="fixed inset-0 z-10 min-h-0 w-auto cursor-default rounded-none border-0 bg-[#1c1c17]/20 p-0"
		type="button"
		aria-label="ปิด"
		onclick={() => (open = false)}
	></button>
{/if}

<div class="relative z-20">
	<div
		class="flex items-center justify-between gap-2 rounded-full border border-[#dcc1b5]/35 bg-white p-1.5 shadow-xs"
	>
		<a
			class="grid size-9 place-items-center rounded-full bg-[#f7f3eb] text-[#55433a] no-underline hover:bg-[#ece8e0]"
			href="?m={data.prev}"
			aria-label="เดือนก่อน"
		>
			<ChevronLeft aria-hidden="true" class="size-4" />
		</a>
		<h1 class="m-0">
			<button
				class="inline-flex min-h-9 items-center gap-2 rounded-full border-0 bg-[#ffeed4] px-4 py-1.5 font-display text-sm font-bold text-[#1c1c17] hover:bg-[#ffe4bd] hover:brightness-100"
				type="button"
				aria-expanded={open}
				aria-haspopup="dialog"
				onclick={toggleMonth}
			>
				<Calendar aria-hidden="true" class="size-4 text-[#9b450f]" />
				<span>{formatMonthLabel(data.month)}</span>
				<ChevronDown aria-hidden="true" class="size-4 text-[#9b450f]" />
			</button>
		</h1>
		<a
			class="grid size-9 place-items-center rounded-full bg-[#f7f3eb] text-[#55433a] no-underline hover:bg-[#ece8e0]"
			href="?m={data.next}"
			aria-label="เดือนถัดไป"
		>
			<ChevronRight aria-hidden="true" class="size-4" />
		</a>
	</div>

	{#if open}
		<div
			class="absolute inset-x-0 top-full z-20 pt-2"
			role="dialog"
			tabindex="-1"
			aria-label="เลือกเดือน"
			onkeydown={(event) => {
				if (event.key === 'Escape') open = false;
			}}
		>
			<div
				class="rounded-3xl border border-[#dcc1b5]/40 bg-white p-4 shadow-[0_0.6rem_1.4rem_rgba(28,28,23,0.12)]"
			>
				<div class="flex items-center justify-between gap-2">
					<p class="m-0 font-display text-lg font-bold text-[#1c1c17]">พ.ศ. {pickYear + 543}</p>
					<div class="flex gap-1.5">
						<button
							class="grid size-9 min-h-9 place-items-center rounded-full border-0 bg-[#f7f3eb] p-0 text-[#55433a] hover:bg-[#ece8e0] hover:brightness-100"
							type="button"
							aria-label="ปีก่อน"
							onclick={() => pickYear--}
						>
							<ChevronLeft aria-hidden="true" class="size-4" />
						</button>
						<button
							class="grid size-9 min-h-9 place-items-center rounded-full border-0 bg-[#f7f3eb] p-0 text-[#55433a] hover:bg-[#ece8e0] hover:brightness-100"
							type="button"
							aria-label="ปีถัดไป"
							onclick={() => pickYear++}
						>
							<ChevronRight aria-hidden="true" class="size-4" />
						</button>
					</div>
				</div>
				<div class="mt-3 grid grid-cols-4 gap-1.5">
					{#each monthNames as name, index (name)}
						{@const value = `${pickYear}-${String(index + 1).padStart(2, '0')}`}
						<button
							class="min-h-10 rounded-full border-0 px-1 text-xs font-bold hover:brightness-100 {value ===
							data.month
								? 'bg-[#e07a42] text-white'
								: 'bg-[#f7f3eb] text-[#1c1c17] hover:bg-[#ece8e0]'}"
							type="button"
							aria-current={value === data.month ? 'date' : undefined}
							onclick={() => chooseMonth(index + 1)}
						>
							{name}
						</button>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>

<section
	class="mt-4 rounded-3xl border border-[#dcc1b5]/30 bg-white p-5 shadow-xs"
	aria-label="สรุปเดือนนี้"
>
	<span class="text-xs font-semibold text-[#897268]">คงเหลือเดือนนี้</span>
	<div class="mt-1 flex items-baseline gap-1.5">
		<strong
			class="font-display text-3xl leading-tight font-bold {data.net < 0
				? 'text-[#9b450f]'
				: 'text-[#3b6941]'}"
		>
			{data.net < 0 ? '−' : '+'}{formatAmount(Math.abs(data.net))}
		</strong>
		<span class="text-sm text-[#55433a]">บาท</span>
	</div>

	<div class="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-[#f7f3eb] p-3.5">
		<div class="flex items-center gap-2.5">
			<span
				class="grid size-8 shrink-0 place-items-center rounded-full bg-[#caecbf] text-[#2f5935]"
				aria-hidden="true"
			>
				<ArrowDownLeft class="size-4" />
			</span>
			<div class="min-w-0">
				<span class="block text-xs text-[#55433a]">รายรับ</span>
				<strong class="font-display text-base font-bold text-[#3b6941]">
					{formatAmount(data.income)}
					<span class="font-sans text-xs font-normal text-[#55433a]">บ.</span>
				</strong>
			</div>
		</div>
		<div class="flex items-center gap-2.5">
			<span
				class="grid size-8 shrink-0 place-items-center rounded-full bg-[#ffdbcb] text-[#9b450f]"
				aria-hidden="true"
			>
				<ArrowUpRight class="size-4" />
			</span>
			<div class="min-w-0">
				<span class="block text-xs text-[#55433a]">รายจ่าย</span>
				<strong class="font-display text-base font-bold text-[#9b450f]">
					{formatAmount(data.expense)}
					<span class="font-sans text-xs font-normal text-[#55433a]">บ.</span>
				</strong>
			</div>
		</div>
	</div>
</section>

{#if data.byCategory.length > 0}
	<section class="mt-5">
		<div class="mb-2 flex items-center justify-between text-xs">
			<h2 class="m-0 text-xs font-bold text-[#55433a]">หมวดหมู่ที่มีการเคลื่อนไหว</h2>
			<span class="text-[#897268]">{data.byCategory.length} หมวด</span>
		</div>
		<ul class="m-0 flex list-none gap-2 overflow-x-auto p-0 pb-1">
			{#each data.byCategory as row (row.id)}
				<li
					class="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#dcc1b5]/35 bg-white px-3.5 py-2 text-xs shadow-2xs"
				>
					<span aria-hidden="true">{categoryEmoji(row.name, row.kind)}</span>
					<span class="font-bold text-[#1c1c17]">{row.name}</span>
					<span class="font-bold {row.kind === 'in' ? 'text-[#3b6941]' : 'text-[#9b450f]'}">
						{formatAmount(row.total)} บ.
					</span>
				</li>
			{/each}
		</ul>
	</section>
{/if}

<section class="mt-5 rounded-3xl border border-[#dcc1b5]/30 bg-white p-5 shadow-xs">
	<div class="flex items-center justify-between gap-3">
		<div class="flex items-center gap-2">
			<span class="size-2.5 shrink-0 rounded-full bg-[#e07a42]" aria-hidden="true"></span>
			<h2 class="m-0 font-display text-lg leading-snug font-bold text-[#1c1c17]">
				{editing ? 'แก้รายการแบบชิลๆ' : 'จดรายการแบบชิลๆ'}
			</h2>
		</div>
		{#if data.categories.length > 0}
			<div class="grid shrink-0 grid-cols-2 rounded-full border border-[#dcc1b5]/35 bg-[#f7f3eb] p-1">
				<button
					type="button"
					class="min-h-8 rounded-full border-0 px-3 py-1 text-xs leading-tight font-bold hover:brightness-100 {activeKind ===
					'out'
						? 'bg-[#e07a42] text-white shadow-2xs'
						: 'bg-transparent text-[#55433a]'}"
					onclick={() => selectKind('out')}
				>
					รายจ่าย
				</button>
				<button
					type="button"
					class="min-h-8 rounded-full border-0 px-3 py-1 text-xs leading-tight font-bold hover:brightness-100 {activeKind ===
					'in'
						? 'bg-[#e07a42] text-white shadow-2xs'
						: 'bg-transparent text-[#55433a]'}"
					onclick={() => selectKind('in')}
				>
					รายรับ
				</button>
			</div>
		{/if}
	</div>

	{#if data.categories.length === 0}
		<p class="mt-3 mb-0 text-sm text-[#55433a]">
			ยังไม่มีหมวด <a class="font-bold text-[#9b450f]" href="/categories">เพิ่มหมวดก่อน</a>
		</p>
	{:else}
		{#if !editing && visibleChips.length > 0}
			<div class="mt-3.5 rounded-2xl bg-[#f7f3eb] p-3" aria-label="ปุ่มลัดรายการที่ใช้บ่อย">
				<div class="mb-2 flex items-center justify-between gap-2 text-xs">
					<span class="inline-flex items-center gap-1 font-semibold text-[#55433a]">
						<Zap class="size-3.5 text-[#e07a42]" aria-hidden="true" />
						<span>กดซ้ำในคลิกเดียว</span>
					</span>
					<span class="text-[0.6875rem] text-[#897268]">ลงวันที่ {formatDay(chipOccurredOn, true)}</span>
				</div>
				<div class="flex flex-wrap gap-1.5">
					{#each visibleChips as chip (`${chip.category_id}:${chip.amount_satang}:${chip.note}`)}
						<form method="post" action="?/create" class="m-0">
							<input type="hidden" name="occurred_on" value={chipOccurredOn} />
							<input type="hidden" name="category_id" value={chip.category_id} />
							<input type="hidden" name="amount" value={satangToInputBaht(chip.amount_satang)} />
							<input type="hidden" name="note" value={chip.note} />
							<button
								type="submit"
								class="inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-full border border-[#dcc1b5]/45 bg-white px-3 py-1.5 text-xs text-[#1c1c17] shadow-2xs transition-colors hover:border-[#e07a42]/50 hover:bg-[#ffeed4] hover:brightness-100"
								title="บันทึก {chip.note || chip.name} {formatAmount(chip.amount_satang)} บาท ทันที"
							>
								<span aria-hidden="true">{categoryEmoji(chip.name, chip.kind)}</span>
								<span class="max-w-36 truncate font-semibold">{chip.note || chip.name}</span>
								<span
									class="font-display font-bold {chip.kind === 'in'
										? 'text-[#3b6941]'
										: 'text-[#9b450f]'}"
								>
									{formatAmount(chip.amount_satang)} บ.
								</span>
							</button>
						</form>
					{/each}
				</div>
			</div>
		{/if}

		<form method="post" action={editing ? '?/update' : '?/create'} class="mt-4 grid gap-3.5">
			{#if editing}
				<input type="hidden" name="id" value={editing.id} />
			{/if}

			<div class="grid grid-cols-2 gap-3">
				<label class="min-w-0 rounded-2xl bg-[#f7f3eb] p-3 text-xs font-semibold text-[#55433a]">
					<span>วันที่</span>
					<div
						class="relative mt-1 flex h-8 min-h-8 min-w-0 items-center gap-1.5 overflow-hidden rounded-lg border border-[#dcc1b5]/40 bg-white/60 px-2 focus-within:border-[#9b450f]/50"
					>
						<Calendar class="size-4 shrink-0 text-[#9b450f]" aria-hidden="true" />
						<span class="min-w-0 truncate text-xs font-semibold text-[#1c1c17]">{dateLabel}</span>
						<input
							class="absolute inset-0 h-full min-h-0 w-full min-w-0 cursor-pointer opacity-0 max-md:scroll-mb-36"
							type="date"
							name="occurred_on"
							required
							aria-label="วันที่"
							value={occurredOn}
							oninput={(event) => (pickedDate = event.currentTarget.value)}
						/>
					</div>
				</label>

				<label class="min-w-0 rounded-2xl bg-[#f7f3eb] p-3 text-xs font-semibold text-[#55433a]">
					<span>จำนวนเงิน (บาท)</span>
					<div class="mt-1 flex items-center gap-1.5">
						<Banknote class="size-4 shrink-0 text-[#9b450f]" aria-hidden="true" />
						<input
							class="h-8 min-h-8 w-full rounded-lg border border-[#dcc1b5]/40 bg-white/60 px-2 font-display text-base font-bold text-[#1c1c17] placeholder:text-[#897268]/60 focus:border-[#9b450f]/50 focus:outline-none max-md:scroll-mb-36"
							name="amount"
							inputmode="decimal"
							placeholder="0"
							required
							value={amount}
						/>
					</div>
				</label>
			</div>

			<fieldset class="m-0 border-0 p-0">
				<legend class="mb-2 text-xs font-semibold text-[#55433a]">เลือกหมวดหมู่</legend>
				<div class="flex flex-wrap gap-2">
					{#each visibleCategories as category (category.id)}
						{@const selected = String(category.id) === activeCategoryId}
						<label
							class="inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs transition-colors {selected
								? 'border-[#e07a42]/50 bg-[#ffdbcb]/75 font-bold text-[#9b450f]'
								: 'border-[#dcc1b5]/30 bg-[#f7f3eb] font-medium text-[#55433a] hover:bg-[#ece8e0]'}"
						>
							<input
								type="radio"
								name="category_id"
								value={category.id}
								checked={selected}
								required
								class="sr-only"
								onchange={() => (pickedCategoryId = String(category.id))}
							/>
							<span aria-hidden="true">{categoryEmoji(category.name, category.kind)}</span>
							<span>{category.name}</span>
						</label>
					{/each}
				</div>
			</fieldset>

			<div class="flex items-center gap-2.5 rounded-2xl bg-[#f7f3eb] p-3">
				<svg
					viewBox="0 0 24 24"
					class="size-4 shrink-0 text-[#897268]"
					fill="none"
					stroke="currentColor"
					stroke-width="1.8"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M4 7h11" />
					<path d="M4 11h11" />
					<path d="M4 15h7" />
					<path d="M18.4 12.6a1.5 1.5 0 0 1 2.1 2.1L16 19.2l-2.5.4.4-2.5Z" />
				</svg>
				<input
					class="h-9 min-h-9 w-full rounded-lg border border-[#dcc1b5]/40 bg-white/60 px-3 text-sm text-[#1c1c17] placeholder:text-[#897268]/75 focus:border-[#9b450f]/50 focus:outline-none max-md:scroll-mb-36"
					name="note"
					aria-label="โน้ต"
					placeholder="โน้ตช่วยจำ (เช่น ชาเขียวมะนาวแก้วโปรด...)"
					maxlength="200"
					value={note}
				/>
			</div>

			{#if form?.error}
				<p
					class="m-0 rounded-2xl border border-[#f5cfca] bg-[#fbe7e4] px-4 py-3 text-sm text-[#933b2b]"
					role="alert"
				>
					{form.error}
				</p>
			{/if}

			<div class="flex flex-wrap items-center gap-2">
				<button
					type="submit"
					class="flex h-12 min-h-12 items-center justify-center gap-2 rounded-full border-0 bg-[#e07a42] px-5 text-sm font-bold text-white hover:bg-[#c96832] hover:brightness-100 max-md:fixed max-md:right-4 max-md:bottom-[calc(4.6rem+env(safe-area-inset-bottom))] max-md:z-30 max-md:w-auto max-md:min-w-40 max-md:flex-none max-md:shadow-[0_0.35rem_0.9rem_rgba(155,69,15,0.28)] md:flex-1"
				>
					<CirclePlus class="size-4" aria-hidden="true" />
					<span>{editing ? 'บันทึกการแก้' : 'บันทึกรายการ'}</span>
				</button>
				{#if editing}
					<a
						class="grid min-h-11 place-items-center rounded-full border border-[#dcc1b5]/50 bg-[#f7f3eb] px-4 text-xs font-bold text-[#9b450f] no-underline hover:bg-[#ece8e0]"
						href="?m={data.month}"
					>
						ยกเลิก
					</a>
				{/if}
			</div>
		</form>
	{/if}
</section>

<section class="mt-6">
	<div class="mb-3 flex items-center justify-between">
		<h2 class="m-0 font-display text-lg font-bold text-[#1c1c17]">รายการล่าสุด</h2>
		<span class="text-xs text-[#897268]">เรียงล่าสุดก่อน</span>
	</div>

	{#if data.entries.length === 0}
		<p class="rounded-3xl border border-[#dcc1b5]/30 bg-white p-5 text-center text-sm text-[#55433a]">
			เดือนนี้ยังไม่มีรายการ
		</p>
	{:else}
		<ul class="m-0 flex list-none flex-col gap-2.5 p-0">
			{#each data.entries as entry (entry.id)}
				<li
					class="flex items-center gap-3 rounded-2xl border border-[#dcc1b5]/30 bg-white p-3.5 shadow-2xs"
				>
					<span
						class="grid size-10 shrink-0 place-items-center rounded-full text-base {entry.kind ===
						'in'
							? 'bg-[#caecbf]'
							: 'bg-[#ffdbcb]'}"
						aria-hidden="true"
					>
						{categoryEmoji(entry.name, entry.kind)}
					</span>

					<div class="min-w-0 flex-1">
						<div class="flex items-center gap-1.5 text-sm">
							<span class="shrink-0 text-xs text-[#55433a]">{formatDay(entry.occurred_on)}</span>
							<span class="text-xs text-[#897268]" aria-hidden="true">•</span>
							<strong class="truncate font-bold text-[#1c1c17]">{entry.name}</strong>
						</div>
						{#if entry.note}
							<p class="m-0 truncate text-xs text-[#55433a]">{entry.note}</p>
						{/if}
					</div>

					<div class="flex shrink-0 items-center gap-1">
						<span
							class="mr-1 font-display text-base font-bold whitespace-nowrap {entry.kind === 'in'
								? 'text-[#3b6941]'
								: 'text-[#9b450f]'}"
						>
							{entry.kind === 'in' ? '+' : '−'}{formatAmount(entry.amount_satang)}
						</span>
						<a
							class="grid size-8 place-items-center rounded-full text-[#55433a] no-underline hover:bg-[#f7f3eb]"
							href="?m={data.month}&edit={entry.id}"
							aria-label="แก้"
							title="แก้"
						>
							<Pencil class="size-4" aria-hidden="true" />
						</a>
						<form method="post" action="?/remove" class="shrink-0">
							<input type="hidden" name="id" value={entry.id} />
							<input type="hidden" name="m" value={data.month} />
							<button
								class="grid size-8 min-h-8 place-items-center rounded-full border-0 bg-transparent p-0 text-[#55433a] hover:bg-[#fbe7e4] hover:text-[#933b2b] hover:brightness-100"
								type="submit"
								aria-label="ลบ"
								title="ลบ"
							>
								<Trash2 class="size-4" aria-hidden="true" />
							</button>
						</form>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</section>
