<script lang="ts">
	import { donutArcs } from '#lib/donut';
	import { formatBaht } from '#lib/money';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const colors = [
		'oklch(0.55 0.12 180)',
		'oklch(0.58 0.12 200)',
		'oklch(0.55 0.12 155)',
		'oklch(0.58 0.13 28)',
		'oklch(0.52 0.1 250)',
		'oklch(0.58 0.12 130)',
		'oklch(0.5 0.08 210)',
		'oklch(0.6 0.12 55)',
		'oklch(0.52 0.1 190)',
		'oklch(0.55 0.12 330)',
		'oklch(0.55 0.1 95)',
		'oklch(0.48 0.08 230)'
	];

	function monthName(month: string) {
		const [year, index] = month.split('-').map(Number);
		return new Intl.DateTimeFormat('th-TH-u-ca-gregory', { month: 'long' }).format(
			new Date(year, index - 1, 1)
		);
	}

	function sliceColor(month: string) {
		return colors[Number(month.slice(5, 7)) - 1];
	}
</script>

{#snippet ring(title: string, months: { month: string; total: number }[], tone: string, empty: string)}
	<section class="grid justify-items-center gap-3">
		<h2 class={tone}>{title}</h2>
		{#if months.length === 0}
			<p class="text-muted">{empty}</p>
		{:else}
			{@const arcs = donutArcs(months.map((month) => month.total))}
			{@const total = months.reduce((sum, month) => sum + month.total, 0)}
			<div class="relative size-60">
				<svg viewBox="0 0 42 42" class="size-full" aria-hidden="true">
					<g transform="rotate(-90 21 21)">
						{#each arcs as arc, index (months[index].month)}
							<circle
								cx="21"
								cy="21"
								r="16"
								fill="none"
								stroke={sliceColor(months[index].month)}
								stroke-width="8"
								pathLength="100"
								stroke-dasharray="{arc.length} {100 - arc.length}"
								stroke-dashoffset={-arc.offset}
							/>
						{/each}
					</g>
				</svg>
				<p class="absolute inset-0 grid place-items-center px-10 text-center text-[1.15rem] {tone}">
					{formatBaht(total)}
				</p>
			</div>
			<ul class="m-0 w-full list-none p-0">
				{#each months as month (month.month)}
					<li class="flex items-center gap-3 border-b border-line py-3">
						<span class="size-3 shrink-0 rounded-full" style="background: {sliceColor(month.month)}"></span>
						<a class="min-w-0 flex-1 text-ink no-underline" href="/?m={month.month}">{monthName(month.month)}</a>
						<span class={tone}>{formatBaht(month.total)}</span>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
{/snippet}

<div class="sticky top-0 z-10 -mx-4 -mt-3.5 mb-4 bg-bg px-4 pt-3.5 pb-2">
	<h1>สรุปปี</h1>
	<div class="mt-2 flex items-center justify-between gap-2">
		<p class="text-[1.6rem] leading-none">{data.year}</p>
		<div class="flex gap-1.5">
			<a
				class="grid size-11 place-items-center rounded-xl border border-line bg-surface text-ink no-underline"
				href="?y={data.year - 1}"
				aria-label="ปีก่อน"
			>
				<ChevronLeft aria-hidden="true" class="size-5" />
			</a>
			<a
				class="grid size-11 place-items-center rounded-xl border border-line bg-surface text-ink no-underline"
				href="?y={data.year + 1}"
				aria-label="ปีถัดไป"
			>
				<ChevronRight aria-hidden="true" class="size-5" />
			</a>
		</div>
	</div>
</div>

<div class="grid gap-8">
	{@render ring('เงินที่ได้รับ', data.income, 'text-in', 'ปีนี้ยังไม่มีเงินที่ได้รับ')}
	{@render ring('เงินที่ใช้ไป', data.expense, 'text-out', 'ปีนี้ยังไม่มีการใช้เงิน')}
</div>
