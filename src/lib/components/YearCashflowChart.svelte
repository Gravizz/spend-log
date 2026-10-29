<script lang="ts">
	import { formatBaht } from '#lib/money';
	let { months, selectedMonth }: {
		months: { month: string; income: number; expense: number; net: number }[];
		selectedMonth: string;
	} = $props();
	const max = $derived(Math.max(...months.flatMap((m) => [m.income, m.expense]), 0));
	const names = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
	let chart: HTMLDivElement;
	$effect(() => {
		selectedMonth;
		const selected = chart?.querySelector<HTMLElement>('[aria-current="date"]');
		if (selected) chart.scrollLeft += selected.getBoundingClientRect().left - chart.getBoundingClientRect().left - (chart.clientWidth - selected.clientWidth) / 2;
	});
</script>

<div class="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
	<span class="flex items-center gap-1.5"><span class="size-2.5 rounded-sm bg-[#7e9e76]" aria-hidden="true"></span>รายรับ</span>
	<span class="flex items-center gap-1.5"><span class="size-2.5 rounded-sm bg-[#e07a42]" aria-hidden="true"></span>รายจ่าย</span>
	<span>หน่วย: บาท</span>
</div>
<!-- svelte-ignore a11y_no_noninteractive_tabindex (scrollable chart region needs keyboard access) -->
<div bind:this={chart} class="overflow-x-auto rounded-xl pb-2" role="region" aria-label="กราฟรายรับรายจ่ายทั้งปี เลื่อนเพื่อดูครบ 12 เดือน" tabindex="0">
	<div class="relative min-w-[540px] pt-6">
		<p class="absolute top-0 left-0 m-0 text-[0.65rem] text-muted">สเกลสูงสุด {formatBaht(max)}</p>
		<div class="relative grid grid-cols-12 gap-1">
			<div class="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-line" aria-hidden="true"></div>
			<div class="pointer-events-none absolute inset-x-0 top-20 border-t border-dashed border-line" aria-hidden="true"></div>
			{#each months as month, i (month.month)}
				<a href="/summary?m={month.month}" class="relative rounded-lg px-1 pt-1 text-center no-underline hover:bg-[#f7f3eb] {selectedMonth === month.month ? 'bg-[#ffeed4]' : ''}"
					aria-current={selectedMonth === month.month ? 'date' : undefined}
					aria-label="{names[i]} รายรับ {formatBaht(month.income)} รายจ่าย {formatBaht(month.expense)} ส่วนต่าง {formatBaht(month.net)}"
					title="{names[i]} · รับ {formatBaht(month.income)} · จ่าย {formatBaht(month.expense)}">
					<div class="flex h-40 items-end justify-center gap-1 border-b border-[#dcc1b5]" aria-hidden="true">
						<span class="w-3 rounded-t-sm bg-[#7e9e76]" style:height="{month.income / (max || 1) * 100}%"></span>
						<span class="w-3 rounded-t-sm bg-[#e07a42]" style:height="{month.expense / (max || 1) * 100}%"></span>
					</div>
					<span class="mt-2 block pb-1 text-[0.65rem] {selectedMonth === month.month ? 'font-bold text-accent' : 'text-muted'}">{names[i]}</span>
				</a>
			{/each}
		</div>
		<span class="text-[0.65rem] text-muted">0</span>
	</div>
</div>
<p class="mt-2 mb-3 text-xs text-muted">แตะเดือนเพื่อดูสรุปด้านบน · เลื่อนกราฟดูได้ครบทั้งปี</p>
<details class="border-t border-line pt-3">
	<summary class="cursor-pointer text-sm font-bold text-accent">ดูตัวเลขรายเดือนและส่วนต่าง</summary>
	<ul class="mt-3 list-none space-y-3 p-0">
		{#each months as month, i (month.month)}
			<li class="rounded-xl bg-[#f7f3eb] p-3 text-xs">
				<a href="/summary?m={month.month}" class="font-bold">{names[i]}</a>
				<dl class="mt-1 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1">
					<dt class="text-muted">รายรับ</dt><dd class="m-0 text-right wrap-anywhere text-in">{formatBaht(month.income)}</dd>
					<dt class="text-muted">รายจ่าย</dt><dd class="m-0 text-right wrap-anywhere text-out">{formatBaht(month.expense)}</dd>
					<dt class="text-muted">ส่วนต่าง</dt><dd class="m-0 text-right font-bold wrap-anywhere">{formatBaht(month.net)}</dd>
				</dl>
			</li>
		{/each}
	</ul>
</details>
