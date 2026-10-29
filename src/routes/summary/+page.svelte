<script lang="ts">
	import Calendar from '@lucide/svelte/icons/calendar';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import YearCashflowChart from '#lib/components/YearCashflowChart.svelte';
	import { formatBaht } from '#lib/money';
	import { inclusiveEnd, shiftAnalyticsMonth, type Period } from '#lib/analytics';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const comparison = $derived(data.comparison);
	const currentMonth = $derived(data.today.slice(0, 7));
	const monthLabel = $derived(new Intl.DateTimeFormat('th-TH', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${data.month}-01T00:00:00Z`)));
	const percentFormat = new Intl.NumberFormat('th-TH', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
	function periodLabel(period: Period) {
		const last = new Date(`${inclusiveEnd(period.end)}T00:00:00Z`);
		const formatter = new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
		return formatter.formatRange(new Date(`${period.start}T00:00:00Z`), last);
	}
	const panel = 'rounded-3xl border border-[#dcc1b5]/35 bg-white p-5 shadow-xs';
</script>

<div class="flex items-center justify-between gap-2 rounded-full border border-[#dcc1b5]/35 bg-white p-1.5 shadow-xs">
	{#if data.month > '0001-01'}<a href="?m={shiftAnalyticsMonth(data.month, -1)}" class="grid size-10 shrink-0 place-items-center rounded-full bg-[#f7f3eb] text-muted" aria-label="เดือนก่อน"><ChevronLeft class="size-4" /></a>{:else}<span class="size-10 shrink-0"></span>{/if}
	<h1 class="m-0 flex min-w-0 items-center gap-2 text-base font-bold"><Calendar class="size-4 shrink-0 text-accent" aria-hidden="true" /><span>{monthLabel}</span></h1>
	{#if data.month < '9999-12'}<a href="?m={shiftAnalyticsMonth(data.month, 1)}" class="grid size-10 shrink-0 place-items-center rounded-full bg-[#f7f3eb] text-muted" aria-label="เดือนถัดไป"><ChevronRight class="size-4" /></a>{:else}<span class="size-10 shrink-0"></span>{/if}
</div>
<div class="mt-2 flex min-h-8 items-center justify-between gap-2 text-xs text-muted">
	<details class="relative">
		<summary class="cursor-pointer px-2 py-1 text-accent">เลือกเดือนอื่น</summary>
		<form method="get" class="absolute top-full left-0 z-10 mt-1 flex w-64 max-w-[calc(100vw-3rem)] gap-2 rounded-2xl border border-line bg-white p-3 shadow-lg">
			<input type="month" name="m" min="0001-01" max="9999-12" value={data.month} required aria-label="เดือนที่ต้องการดู" class="min-w-0 flex-1 text-sm" />
			<button type="submit" class="shrink-0 text-sm">ดูสรุป</button>
		</form>
	</details>
	{#if data.month !== currentMonth}<a href="/summary" class="px-2 py-1 font-bold">กลับเดือนนี้</a>{:else}<span class="pr-2">อัปเดตจากรายการที่บันทึก</span>{/if}
</div>

<section class="mt-3 overflow-hidden rounded-3xl border border-[#e07a42]/25 bg-[#ffeed4] p-5" aria-labelledby="expense-title">
	<div class="flex items-start justify-between gap-3">
		<div class="min-w-0 flex-1">
			<h2 id="expense-title" class="m-0 text-sm font-bold text-accent">{data.period.mode === 'to-date' ? 'เดือนนี้ใช้ไปแล้ว' : data.period.mode === 'future' ? 'รายจ่ายที่บันทึกไว้ล่วงหน้า' : 'รายจ่ายของเดือนนี้'}</h2>
			<p class="mt-2 mb-1 text-[clamp(1.65rem,7vw,2.4rem)] leading-tight font-bold tracking-tight wrap-anywhere text-[#793100]">{formatBaht(data.expense)}</p>
			<p class="m-0 text-xs text-muted">{periodLabel(data.period.current)}</p>
		</div>
		<img src="/capybara.png" alt="" class="size-14 shrink-0 rounded-full border border-[#dcc1b5]/40 object-cover object-[center_42%]" />
	</div>
	<dl class="mt-5 mb-0 grid grid-cols-2 gap-4 border-t border-[#dcc1b5]/50 pt-4">
		<div class="min-w-0"><dt class="text-xs text-muted">รายรับที่บันทึก</dt><dd class="mt-1 ml-0 text-lg font-bold wrap-anywhere text-in">{formatBaht(data.income)}</dd></div>
		<div class="min-w-0"><dt class="text-xs text-muted">รายรับหักรายจ่ายที่บันทึก</dt><dd class="mt-1 ml-0 text-lg font-bold wrap-anywhere">{formatBaht(data.net)}</dd></div>
	</dl>
	{#if data.period.mode === 'future'}<p class="mt-3 mb-0 text-xs text-muted">เป็นเดือนอนาคต จึงยังไม่เปรียบเทียบกับเดือนก่อน</p>{/if}
	<a href="/?m={data.month}" class="mt-4 inline-flex items-center gap-1 text-xs font-bold">ดูรายการของเดือนนี้ <ChevronRight class="size-3.5" aria-hidden="true" /></a>
</section>

{#if comparison}
	<section class="{panel} mt-4" aria-labelledby="comparison-title">
		<div class="flex flex-wrap items-center justify-between gap-2">
			<h2 id="comparison-title" class="m-0 text-base font-bold">เทียบรายจ่ายกับเดือนก่อน</h2>
			<span class="rounded-full bg-[#f7f3eb] px-2.5 py-1 text-[0.65rem] text-muted">{data.period.mode === 'to-date' ? 'เทียบช่วงเดียวกัน' : 'เทียบเต็มเดือน'}</span>
		</div>
		{#if comparison.previousTotal === 0 && comparison.currentTotal === 0}
			<p class="mt-3 mb-0 font-bold text-muted">ยังไม่มีรายจ่ายบันทึกในทั้งสองช่วง</p>
		{:else if comparison.previousTotal === 0}
			<p class="mt-3 mb-0 font-bold text-muted">ไม่มีรายจ่ายบันทึกในช่วงก่อน</p>
			<p class="mt-1 mb-0 text-sm text-muted">ช่วงนี้มีรายจ่าย {formatBaht(comparison.currentTotal)} จึงยังคำนวณเปอร์เซ็นต์เทียบไม่ได้</p>
		{:else if comparison.delta === 0}
			<p class="mt-3 mb-0 text-lg font-bold">ยอดรวมเท่าเดิม</p>
		{:else}
			<p class="mt-3 mb-1 text-xl font-bold wrap-anywhere {comparison.delta > 0 ? 'text-out' : 'text-in'}">{comparison.delta > 0 ? 'เพิ่มขึ้น' : 'ลดลง'} {formatBaht(Math.abs(comparison.delta))}</p>
			<p class="m-0 text-sm text-muted">{comparison.delta > 0 ? 'เพิ่ม' : 'ลด'} {percentFormat.format(Math.abs(comparison.percent ?? 0))}% จาก {formatBaht(comparison.previousTotal)}</p>
		{/if}
		<div class="mt-3 space-y-1 text-[0.7rem] text-muted"><p class="m-0">ช่วงที่ดู: {periodLabel(data.period.current)}</p><p class="m-0">ช่วงก่อน: {periodLabel(data.period.previous)}</p></div>
		{#if comparison.drivers.length > 0}
			<div class="mt-4 border-t border-line pt-3">
				<p class="mt-0 mb-2 text-xs font-bold text-muted">หมวดที่มีส่วนทำให้ยอด{comparison.delta > 0 ? 'เพิ่ม' : 'ลด'}มากที่สุด</p>
				<ul class="m-0 list-none space-y-2 p-0">
					{#each comparison.drivers as driver (driver.id)}
						<li class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-sm"><span class="min-w-0 wrap-anywhere">{driver.name}</span><span class="ml-auto shrink-0 font-bold text-muted">{driver.delta > 0 ? '+' : '−'}{formatBaht(Math.abs(driver.delta))}</span></li>
					{/each}
				</ul>
			</div>
		{/if}
	</section>
{/if}

<section class="{panel} mt-4" aria-labelledby="categories-title">
	<div class="flex items-baseline justify-between gap-3"><h2 id="categories-title" class="m-0 text-base font-bold">เงินไปอยู่หมวดไหนบ้าง</h2><span class="shrink-0 text-xs text-muted">{data.categories.length} หมวด</span></div>
	<p class="mt-1 mb-4 text-xs text-muted">สัดส่วนจากรายจ่ายในช่วงที่ดู</p>
	{#if data.categories.length === 0}
		<p class="my-5 text-center text-sm text-muted">ยังไม่มีรายจ่ายบันทึกในช่วงนี้</p>
	{:else}
		<ul class="m-0 list-none space-y-4 p-0">
			{#each data.categories as category (category.id)}
				<li>
					<div class="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm"><span class="min-w-0 font-bold wrap-anywhere">{category.name}</span><span class="ml-auto shrink-0 text-accent">{formatBaht(category.total)} <span class="text-[0.7rem] text-muted">· {percentFormat.format(category.total / data.expense * 100)}%</span></span></div>
					<div class="h-2 overflow-hidden rounded-full bg-[#f3efe6]" aria-hidden="true"><div class="h-full rounded-full bg-[#e07a42]" style:width="{category.total / data.expense * 100}%"></div></div>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<section class="{panel} mt-4" aria-labelledby="year-title">
	<h2 id="year-title" class="m-0 text-base font-bold">ภาพรวมปี {Number(data.month.slice(0, 4)) + 543}</h2>
	<p class="mt-1 mb-4 text-xs text-muted">ยอดตามวันที่บันทึก รวมรายการล่วงหน้า</p>
	<YearCashflowChart months={data.yearMonths} selectedMonth={data.month} />
	{#if data.month.slice(0, 4) === data.today.slice(0, 4)}<p class="mt-3 mb-0 text-xs text-muted">เดือนปัจจุบันยังไม่ครบเดือน กราฟรวมรายการล่วงหน้า จึงอาจต่างจากยอดถึงวันนี้ด้านบน</p>{/if}
</section>
<p class="mt-5 mb-0 text-center text-xs text-muted">สรุปจากรายการที่บันทึก อาจไม่ครอบคลุมการใช้เงินจริงทั้งหมด</p>
