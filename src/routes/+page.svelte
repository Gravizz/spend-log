<script lang="ts">
	import { formatBaht } from '#lib/money';
	import { goto } from '$app/navigation';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import type { PageProps } from './$types';

	const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

	let { data, form }: PageProps = $props();

	const editing = $derived(data.editing);
	const occurredOn = $derived(form?.occurred_on ?? editing?.occurred_on ?? data.today);
	const categoryId = $derived(form?.category_id ?? (editing ? String(editing.category_id) : ''));
	const amount = $derived(
		form?.amount ?? (editing ? (editing.amount_satang / 100).toFixed(2) : '')
	);
	const note = $derived(form?.note ?? editing?.note ?? '');
	let open = $state(false);
	let pickYear = $state(Number(data.month.slice(0, 4)));
	const field = 'max-md:scroll-mb-36';
	const thumb =
		'max-md:fixed max-md:right-4 max-md:bottom-[calc(4.6rem+env(safe-area-inset-bottom))] max-md:z-30 max-md:w-auto max-md:min-w-36 max-md:flex-none max-md:shadow-[0_0.35rem_0.9rem_oklch(0.28_0.04_230/0.18)] md:flex-1';

	function toggleMonth() {
		open = !open;
		if (open) pickYear = Number(data.month.slice(0, 4));
	}

	function chooseMonth(month: number) {
		open = false;
		const value = `${pickYear}-${String(month).padStart(2, '0')}`;
		if (value !== data.month) goto(`?m=${value}`);
	}

	function formatDay(iso: string) {
		const [year, month, day] = iso.split('-').map(Number);
		return new Intl.DateTimeFormat('th-TH-u-ca-gregory', {
			day: 'numeric',
			month: 'short'
		}).format(new Date(year, month - 1, day));
	}
</script>

{#if open}
	<button
		class="fixed inset-0 z-10 min-h-0 w-auto cursor-default rounded-none border-0 bg-ink/20 p-0"
		type="button"
		aria-label="ปิด"
		onclick={() => (open = false)}
	></button>
{/if}
<div class="sticky top-0 z-20 -mx-4 -mt-3.5 mb-1 bg-bg px-4 pt-3.5 pb-2">
	<div class="flex items-center justify-between gap-2">
	<h1 class="text-start">
		<button
			class="inline-flex min-h-0 items-center gap-1 border-0 bg-transparent p-0 text-[1.6rem] font-normal text-ink"
			type="button"
			aria-expanded={open}
			aria-haspopup="dialog"
			onclick={toggleMonth}
		>
			{data.label}
			<ChevronDown aria-hidden="true" class="size-5 text-accent" />
		</button>
	</h1>
	<div class="flex gap-1.5">
		<a
			class="grid size-11 place-items-center rounded-xl border border-line bg-surface no-underline"
			href="?m={data.prev}">ก่อน</a
		>
		<a
			class="grid size-11 place-items-center rounded-xl border border-line bg-surface no-underline"
			href="?m={data.next}">ถัดไป</a
		>
	</div>
	</div>
	{#if open}
		<div
			class="absolute inset-x-0 top-full z-20 px-4 pt-1"
			role="dialog"
			aria-label="เลือกเดือน"
			onkeydown={(event) => {
				if (event.key === 'Escape') open = false;
			}}
		>
			<div
				class="rounded-2xl border border-line bg-surface p-3 shadow-[0_0.6rem_1.4rem_oklch(0.28_0.04_230/0.16)]"
			>
				<div class="flex items-center justify-between gap-2">
					<p class="text-[1.6rem] leading-none">{pickYear}</p>
					<div class="flex gap-1.5">
						<button
							class="grid size-11 min-h-11 place-items-center border-line bg-bg p-0 text-ink"
							type="button"
							aria-label="ปีก่อน"
							onclick={() => pickYear--}
						>
							<ChevronLeft aria-hidden="true" class="size-5" />
						</button>
						<button
							class="grid size-11 min-h-11 place-items-center border-line bg-bg p-0 text-ink"
							type="button"
							aria-label="ปีถัดไป"
							onclick={() => pickYear++}
						>
							<ChevronRight aria-hidden="true" class="size-5" />
						</button>
					</div>
				</div>
				<div class="mt-3 grid grid-cols-4 gap-1.5">
					{#each monthNames as name, index (name)}
						{@const value = `${pickYear}-${String(index + 1).padStart(2, '0')}`}
						<button
							class="min-h-11 border-transparent px-1 {value === data.month
								? 'bg-accent text-white'
								: 'bg-bg text-ink'}"
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

<section class="mt-3 grid gap-3">
	<h2>{editing ? 'แก้รายการ' : 'เพิ่มรายการ'}</h2>
	{#if data.categories.length === 0}
		<p>ยังไม่มีหมวด <a href="/categories">เพิ่มหมวดก่อน</a></p>
	{:else}
		<form method="post" action={editing ? '?/update' : '?/create'} class="grid gap-3">
			{#if editing}
				<input type="hidden" name="id" value={editing.id} />
			{/if}
			<div class="grid gap-3 sm:grid-cols-2">
				<label>
					วันที่
					<input class={field} type="date" name="occurred_on" required value={occurredOn} />
				</label>
				<label>
					จำนวนเงิน (บาท)
					<input class={field} name="amount" inputmode="decimal" required value={amount} />
				</label>
			</div>
			<label>
				หมวด
				<select class={field} name="category_id" required>
					<option value="" selected={categoryId === ''}>เลือกหมวด</option>
					{#each data.categories as category (category.id)}
						<option value={category.id} selected={String(category.id) === categoryId}>
							{category.name} ({category.kind === 'in' ? 'รายรับ' : 'รายจ่าย'})
						</option>
					{/each}
				</select>
			</label>
			<label>
				โน้ต
				<input class={field} name="note" maxlength="200" value={note} />
			</label>
			{#if form?.error}
				<p class="m-0 rounded-xl bg-error-soft px-3 py-2.5 text-out">{form.error}</p>
			{/if}
			<div class="flex flex-wrap items-center gap-2">
				<button class={thumb}>{editing ? 'บันทึกการแก้' : 'เพิ่มรายการ'}</button>
				{#if editing}
					<a
						class="grid min-h-11 place-items-center rounded-xl border border-line bg-transparent px-4 text-accent no-underline"
						href="?m={data.month}">ยกเลิก</a
					>
				{/if}
			</div>
		</form>
	{/if}
</section>

<section class="mt-1 grid gap-1.5 pt-3.5 pb-1" aria-label="สรุปเดือนนี้">
	<div>
		<span class="text-muted">คงเหลือ</span>
		<strong class="block text-[2rem] leading-tight font-normal {data.net < 0 ? 'text-out' : 'text-in'}">
			{formatBaht(data.net)}
		</strong>
	</div>
	<div class="flex flex-wrap gap-x-4 gap-y-1">
		<span>รับ <b class="text-in">{formatBaht(data.income)}</b></span>
		<span>จ่าย <b class="text-out">{formatBaht(data.expense)}</b></span>
	</div>
</section>

{#if data.byCategory.length > 0}
	<section class="mt-3 grid gap-3">
		<h2>แยกตามหมวด</h2>
		<ul class="m-0 list-none p-0">
			{#each data.byCategory as row (row.id)}
				<li class="grid grid-cols-[1fr_auto] items-center gap-x-3 border-b border-line py-3.5">
					<span>{row.name}</span>
					<span class="text-[1.15rem] whitespace-nowrap {row.kind === 'in' ? 'text-in' : 'text-out'}">
						{formatBaht(row.total)}
					</span>
				</li>
			{/each}
		</ul>
	</section>
{/if}

<section class="mt-3 grid gap-3">
	<h2>รายการ</h2>
	{#if data.entries.length === 0}
		<p class="text-muted">เดือนนี้ยังไม่มีรายการ</p>
	{:else}
		<ul class="m-0 list-none p-0">
			{#each data.entries as entry (entry.id)}
				<li class="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-0.5 border-b border-line py-3.5">
					<div>
						<div>{formatDay(entry.occurred_on)} {entry.name}</div>
						{#if entry.note}<div class="text-muted">{entry.note}</div>{/if}
					</div>
					<div class="text-[1.15rem] whitespace-nowrap {entry.kind === 'in' ? 'text-in' : 'text-out'}">
						{entry.kind === 'in' ? '+' : '−'}{formatBaht(entry.amount_satang)}
					</div>
					<div class="col-span-full flex justify-end gap-2">
						<form method="post" action="?/remove">
							<input type="hidden" name="id" value={entry.id} />
							<input type="hidden" name="m" value={data.month} />
							<button
								class="grid size-10 min-h-10 place-items-center border-line bg-transparent p-0 text-out [&_svg]:size-5"
								type="submit"
								aria-label="ลบ"
								title="ลบ"
							>
								<Trash2 aria-hidden="true" />
							</button>
						</form>
						<a
							class="grid size-10 min-h-10 place-items-center rounded-xl border border-line bg-transparent text-accent no-underline [&_svg]:size-5"
							href="?m={data.month}&edit={entry.id}"
							aria-label="แก้"
							title="แก้"
						>
							<Pencil aria-hidden="true" />
						</a>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</section>
