<script lang="ts">
	import Calendar from '@lucide/svelte/icons/calendar';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import YearCashflowChart from '#lib/components/YearCashflowChart.svelte';
	import { donutArcs } from '#lib/donut';
	import { formatBaht } from '#lib/money';
	import { inclusiveEnd, shiftAnalyticsMonth, type Period } from '#lib/analytics';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const comparison = $derived(data.comparison);
	const currentMonth = $derived(data.today.slice(0, 7));
	const monthLabel = $derived(new Intl.DateTimeFormat('th-TH', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${data.month}-01T00:00:00Z`)));
	const percentFormat = new Intl.NumberFormat('th-TH', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
	const shortDayFormatter = new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', timeZone: 'UTC' });

	function periodLabel(period: Period) {
		const last = new Date(`${inclusiveEnd(period.end)}T00:00:00Z`);
		const formatter = new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
		return formatter.formatRange(new Date(`${period.start}T00:00:00Z`), last);
	}

	function formatShortDay(iso: string) {
		return shortDayFormatter.format(new Date(`${iso}T00:00:00Z`));
	}

	const palette = ['#e07a42', '#9b450f', '#d99b26', '#7e9e76', '#55433a', '#c46d5e'];
	const arcs = $derived(donutArcs(data.categoryDetails.map((c) => c.total)));
	const maxDailyExpense = $derived(Math.max(...data.dailyExpenses.map((d) => d.total), 0));
	const peakDay = $derived(
		data.dailyExpenses.reduce<(typeof data.dailyExpenses)[number] | null>(
			(best, cur) => (cur.total > (best?.total ?? 0) ? cur : best),
			null
		)
	);
	const yearTotals = $derived(
		data.yearMonths.reduce(
			(acc, m) => ({ income: acc.income + m.income, expense: acc.expense + m.expense, net: acc.net + m.net }),
			{ income: 0, expense: 0, net: 0 }
		)
	);
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
	{#if data.savingsRate !== null || (data.period.mode === 'to-date' && data.pace.projectedExpense !== null && data.expense > 0)}
		<div class="mt-3 flex flex-wrap gap-2 border-t border-[#dcc1b5]/40 pt-3 text-xs">
			{#if data.savingsRate !== null}
				<span class="rounded-full px-2.5 py-1 font-bold {data.savingsRate >= 0 ? 'bg-[#caecbf]/80 text-[#2f5935]' : 'bg-[#ffdbcb] text-[#9b450f]'}">
					{data.savingsRate >= 0 ? 'คงเหลือ' : 'เกินรายรับ'} {percentFormat.format(Math.abs(data.savingsRate))}% ของรายรับ
				</span>
			{/if}
			{#if data.period.mode === 'to-date' && data.pace.projectedExpense !== null && data.expense > 0}
				<span class="rounded-full bg-white/75 px-2.5 py-1 font-semibold text-[#793100] wrap-anywhere">
					คาดการณ์จบเดือน ~{formatBaht(data.pace.projectedExpense)}
				</span>
			{/if}
		</div>
	{/if}
	{#if data.period.mode === 'future'}<p class="mt-3 mb-0 text-xs text-muted">เป็นเดือนอนาคต จึงยังไม่เปรียบเทียบกับเดือนก่อน</p>{/if}
	<a href="/?m={data.month}" class="mt-4 inline-flex items-center gap-1 text-xs font-bold">ดูรายการของเดือนนี้ <ChevronRight class="size-3.5" aria-hidden="true" /></a>
</section>

{#if data.period.mode !== 'future'}
	<section class="{panel} mt-4" aria-labelledby="pace-title">
		<div class="flex flex-wrap items-baseline justify-between gap-2">
			<h2 id="pace-title" class="m-0 text-base font-bold">จังหวะการใช้เงินรายวัน</h2>
			<span class="text-xs text-muted">{data.pace.elapsedDays} วัน ({data.pace.activeSpendDays} วันที่มีรายจ่าย)</span>
		</div>

		<dl class="mt-3 mb-0 grid grid-cols-2 gap-2.5">
			<div class="min-w-0 rounded-2xl bg-[#f7f3eb] p-3">
				<dt class="text-xs text-muted">เฉลี่ยต่อวัน</dt>
				<dd class="mt-1 ml-0 text-base font-bold wrap-anywhere text-[#793100]">{formatBaht(data.pace.dailyAverage)}</dd>
			</div>
			<div class="min-w-0 rounded-2xl bg-[#f7f3eb] p-3">
				<dt class="text-xs text-muted">วันไม่ใช้เงิน (No-spend)</dt>
				<dd class="mt-1 ml-0 text-base font-bold text-in">{data.pace.noSpendDays} วัน</dd>
			</div>
			<div class="col-span-2 min-w-0 rounded-2xl bg-[#f7f3eb] p-3">
				<dt class="text-xs text-muted">เทียบวันหยุดเสาร์-อาทิตย์ กับ วันธรรมดา</dt>
				<dd class="mt-1.5 ml-0 grid grid-cols-2 gap-3 text-xs">
					<div class="min-w-0">
						<span class="block text-muted">เสาร์-อาทิตย์ (เฉลี่ย/วัน)</span>
						<strong class="mt-0.5 block text-sm font-bold wrap-anywhere text-accent">{formatBaht(data.pace.weekendAverage)}</strong>
					</div>
					<div class="min-w-0">
						<span class="block text-muted">จันทร์-ศุกร์ (เฉลี่ย/วัน)</span>
						<strong class="mt-0.5 block text-sm font-bold wrap-anywhere text-ink">{formatBaht(data.pace.weekdayAverage)}</strong>
					</div>
				</dd>
			</div>
		</dl>

		{#if data.expense > 0}
			<div class="mt-4 border-t border-line pt-3">
				<div class="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
					<span>กราฟรายวันในเดือน</span>
					{#if peakDay}
						<span class="font-bold text-accent wrap-anywhere">พีคสุด {formatShortDay(peakDay.date)} · {formatBaht(peakDay.total)}</span>
					{/if}
				</div>
				<div class="flex h-20 items-end gap-[2px] border-b border-[#dcc1b5] pt-2" role="img" aria-label="กราฟรายจ่ายรายวันตั้งแต่วันที่ 1 ถึง {data.pace.elapsedDays}">
					{#each data.dailyExpenses as d (d.date)}
						<div
							class="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
							title="วันที่ {d.day}: {formatBaht(d.total)} ({d.count} รายการ)"
						>
							{#if d.total > 0}
								<span
									class="w-full rounded-t-[2px] {d.isWeekend ? 'bg-[#9b450f]' : 'bg-[#e07a42]'}"
									style:height="{Math.max((d.total / (maxDailyExpense || 1)) * 100, 8)}%"
								></span>
							{:else}
								<span class="mb-0.5 size-1.5 rounded-full bg-[#7e9e76]/60"></span>
							{/if}
						</div>
					{/each}
				</div>
				<div class="mt-1.5 flex items-center justify-between text-[0.65rem] text-muted">
					<span>วันที่ 1</span>
					<span class="flex items-center gap-3">
						<span class="inline-flex items-center gap-1"><span class="size-2 rounded-xs bg-[#e07a42]"></span>จ.-ศ.</span>
						<span class="inline-flex items-center gap-1"><span class="size-2 rounded-xs bg-[#9b450f]"></span>ส.-อา.</span>
						<span class="inline-flex items-center gap-1"><span class="size-1.5 rounded-full bg-[#7e9e76]"></span>ไม่ใช้เงิน</span>
					</span>
					<span>วันที่ {data.pace.elapsedDays}</span>
				</div>
			</div>
		{/if}
	</section>
{/if}

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
	<p class="mt-1 mb-4 text-xs text-muted">สัดส่วน ความถี่ และค่าเฉลี่ยต่อครั้งในช่วงที่ดู</p>
	{#if data.categoryDetails.length === 0}
		<p class="my-5 text-center text-sm text-muted">ยังไม่มีรายจ่ายบันทึกในช่วงนี้</p>
	{:else}
		<div class="mb-5 flex items-center gap-4 rounded-2xl bg-[#f7f3eb] p-3.5">
			<div class="relative size-20 shrink-0">
				<svg viewBox="0 0 42 42" class="size-full -rotate-90" aria-hidden="true">
					<circle cx="21" cy="21" r="15.915" fill="none" stroke="#e5dcd3" stroke-width="5" />
					{#each arcs as arc, i (i)}
						<circle
							cx="21"
							cy="21"
							r="15.915"
							fill="none"
							stroke={palette[i % palette.length]}
							stroke-width="5"
							pathLength="100"
							stroke-dasharray="{arc.length} {100 - arc.length}"
							stroke-dashoffset={-arc.offset}
						/>
					{/each}
				</svg>
				<div class=" absolute inset-0 grid place-items-center text-center">
					<span class="text-xs leading-none font-bold text-ink">{data.categoryDetails.length}<br /><span class="text-[0.6rem] font-normal text-muted">หมวด</span></span>
				</div>
			</div>
			<div class="min-w-0 flex-1 text-xs">
				<p class="m-0 font-bold text-ink wrap-anywhere">อันดับ 1: {data.categoryDetails[0].name}</p>
				<p class="mt-0.5 mb-0 text-accent font-bold wrap-anywhere">
					{formatBaht(data.categoryDetails[0].total)} ({percentFormat.format((data.categoryDetails[0].total / data.expense) * 100)}%)
				</p>
				<p class="mt-1 mb-0 text-muted">
					บันทึก {data.categoryDetails[0].count} ครั้ง · เฉลี่ย {formatBaht(data.categoryDetails[0].average)}/ครั้ง
				</p>
			</div>
		</div>

		<ul class="m-0 list-none space-y-4 p-0">
			{#each data.categoryDetails as category, i (category.id)}
				{@const color = palette[i % palette.length]}
				<li>
					<div class="mb-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm">
						<span class="inline-flex min-w-0 items-center gap-1.5 font-bold wrap-anywhere">
							<span class="size-2.5 shrink-0 rounded-full" style:background-color={color} aria-hidden="true"></span>
							<span>{category.name}</span>
						</span>
						<span class="ml-auto shrink-0 text-accent">{formatBaht(category.total)} <span class="text-[0.7rem] text-muted">· {percentFormat.format(category.total / data.expense * 100)}%</span></span>
					</div>
					<div class="h-2 overflow-hidden rounded-full bg-[#f3efe6]" aria-hidden="true"><div class="h-full rounded-full" style:background-color={color} style:width="{category.total / data.expense * 100}%"></div></div>
					<div class="mt-1.5 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[0.72rem] text-muted">
						<span>{category.count} รายการ · เฉลี่ย {formatBaht(category.average)}/ครั้ง</span>
						{#if data.period.mode !== 'future' && category.previousTotal > 0 && category.delta !== 0}
							<span class={category.delta > 0 ? 'text-out' : 'text-in'}>
								{category.delta > 0 ? '+' : '−'}{formatBaht(Math.abs(category.delta))} จากช่วงก่อน
							</span>
						{/if}
					</div>
					<details class="mt-1.5">
						<summary class="cursor-pointer text-xs font-semibold text-accent">ดูรายการในหมวดนี้ ({category.count})</summary>
						<ul class="mt-2 list-none space-y-1.5 rounded-2xl bg-[#f7f3eb] p-2.5 text-xs">
							{#each category.entries as item (item.id)}
								<li class="flex flex-wrap items-baseline justify-between gap-2">
									<span class="min-w-0 wrap-anywhere text-ink">
										<span class="text-muted">{formatShortDay(item.occurred_on)}</span>
										{#if item.note} · {item.note}{/if}
									</span>
									<span class="ml-auto shrink-0 font-bold text-accent">{formatBaht(item.amount_satang)}</span>
								</li>
							{/each}
						</ul>
					</details>
				</li>
			{/each}
		</ul>
	{/if}
</section>

{#if data.topExpenses.length > 0}
	<section class="{panel} mt-4" aria-labelledby="top-expenses-title">
		<div class="flex items-baseline justify-between gap-2">
			<h2 id="top-expenses-title" class="m-0 text-base font-bold">รายการที่จ่ายหนักสุด</h2>
			<span class="text-xs text-muted">Top {data.topExpenses.length}</span>
		</div>
		<p class="mt-1 mb-3 text-xs text-muted">รายการเดี่ยวที่ดึงยอดรายจ่ายสูงสุดในช่วงนี้</p>
		<ol class="m-0 list-none space-y-2.5 p-0">
			{#each data.topExpenses as item, idx (item.id)}
				<li class="flex items-center justify-between gap-3 rounded-2xl bg-[#f7f3eb] p-3 text-sm">
					<div class="flex min-w-0 items-center gap-2.5">
						<span class="grid size-6 shrink-0 place-items-center rounded-full bg-[#ffdbcb] text-xs font-bold text-accent">{idx + 1}</span>
						<div class="min-w-0">
							<p class="m-0 font-bold wrap-anywhere text-ink">{item.note || item.name}</p>
							<p class="m-0 text-xs text-muted">{formatShortDay(item.occurred_on)} · {item.name}</p>
						</div>
					</div>
					<div class="shrink-0 text-right">
						<p class="m-0 font-bold wrap-anywhere text-accent">{formatBaht(item.amount_satang)}</p>
						<p class="m-0 text-[0.68rem] text-muted">{percentFormat.format((item.amount_satang / data.expense) * 100)}% ของเดือน</p>
					</div>
				</li>
			{/each}
		</ol>
	</section>
{/if}

<section class="{panel} mt-4" aria-labelledby="year-title">
	<h2 id="year-title" class="m-0 text-base font-bold">ภาพรวมปี {Number(data.month.slice(0, 4)) + 543}</h2>
	<p class="mt-1 mb-3 text-xs text-muted">ยอดตามวันที่บันทึก รวมรายการล่วงหน้า</p>
	<dl class="mb-4 grid grid-cols-3 gap-2 rounded-2xl bg-[#f7f3eb] p-3 text-xs">
		<div class="min-w-0">
			<dt class="text-muted">รับทั้งปี</dt>
			<dd class="mt-0.5 ml-0 font-bold wrap-anywhere text-in">{formatBaht(yearTotals.income)}</dd>
		</div>
		<div class="min-w-0">
			<dt class="text-muted">จ่ายทั้งปี</dt>
			<dd class="mt-0.5 ml-0 font-bold wrap-anywhere text-out">{formatBaht(yearTotals.expense)}</dd>
		</div>
		<div class="min-w-0">
			<dt class="text-muted">คงเหลือปีนี้</dt>
			<dd class="mt-0.5 ml-0 font-bold wrap-anywhere">{formatBaht(yearTotals.net)}</dd>
		</div>
	</dl>
	<YearCashflowChart months={data.yearMonths} selectedMonth={data.month} />
	{#if data.month.slice(0, 4) === data.today.slice(0, 4)}<p class="mt-3 mb-0 text-xs text-muted">เดือนปัจจุบันยังไม่ครบเดือน กราฟรวมรายการล่วงหน้า จึงอาจต่างจากยอดถึงวันนี้ด้านบน</p>{/if}
</section>
<p class="mt-5 mb-0 text-center text-xs text-muted">สรุปจากรายการที่บันทึก อาจไม่ครอบคลุมการใช้เงินจริงทั้งหมด</p>
