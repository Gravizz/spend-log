<script lang="ts">
	import { donutArcs } from '#lib/donut';
	import Calendar from '@lucide/svelte/icons/calendar';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Cloud from '@lucide/svelte/icons/cloud';
	import Moon from '@lucide/svelte/icons/moon';
	import PiggyBank from '@lucide/svelte/icons/piggy-bank';
	import ShoppingBag from '@lucide/svelte/icons/shopping-bag';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const incomeColors = [
		'#7e9e76',
		'#486642',
		'#7e5700',
		'#f5bd5d',
		'#5c8254',
		'#9ab592',
		'#a87b14',
		'#d99f36',
		'#3a5435',
		'#6b8c63',
		'#8c6610',
		'#e5ae49'
	];

	const expenseColors = [
		'#e07a42',
		'#9b450f',
		'#ffb692',
		'#793100',
		'#511e00',
		'#c85d24',
		'#b34e14',
		'#f29b6e',
		'#632600',
		'#873808',
		'#d97736',
		'#ffa073'
	];

	function monthName(month: string) {
		const [year, index] = month.split('-').map(Number);
		return new Intl.DateTimeFormat('th-TH-u-ca-gregory', { month: 'long' }).format(
			new Date(year, index - 1, 1)
		);
	}

	function sliceColor(kind: 'in' | 'out', index: number) {
		const palette = kind === 'in' ? incomeColors : expenseColors;
		return palette[index % palette.length];
	}

	function isLightColor(hex: string) {
		return hex === '#f5bd5d' || hex === '#ffb692' || hex === '#e5ae49' || hex === '#ffa073';
	}

	function formatAmount(satang: number) {
		return new Intl.NumberFormat('th-TH', {
			minimumFractionDigits: satang % 100 === 0 ? 0 : 2,
			maximumFractionDigits: 2
		}).format(satang / 100);
	}
</script>

{#snippet ring(
	kind: 'in' | 'out',
	title: string,
	subtitle: string,
	badge: string,
	centerLabel: string,
	listTitle: string,
	empty: string,
	months: { month: string; total: number }[]
)}
	<section class="rounded-3xl border border-[#dcc1b5]/30 bg-white p-5 shadow-xs">
		<div class="flex items-center justify-between gap-3">
			<div class="flex items-center gap-3">
				<span
					class="grid size-11 shrink-0 place-items-center rounded-full {kind === 'in'
						? 'bg-[#caecbf] text-[#2f5935]'
						: 'bg-[#ffdbcb] text-[#9b450f]'}"
					aria-hidden="true"
				>
					{#if kind === 'in'}
						<PiggyBank class="size-5" />
					{:else}
						<ShoppingBag class="size-5" />
					{/if}
				</span>
				<div>
					<h2 class="m-0 font-display text-lg font-bold text-[#1c1c17]">{title}</h2>
					<p
						class="m-0 text-xs font-semibold {kind === 'in' ? 'text-[#3b6941]' : 'text-[#9b450f]'}"
					>
						{subtitle}
					</p>
				</div>
			</div>
			<span
				class="shrink-0 rounded-full px-3 py-1 text-xs font-bold {kind === 'in'
					? 'bg-[#caecbf] text-[#264e2c]'
					: 'bg-[#ffdbcb] text-[#9b450f]'}"
			>
				{badge}
			</span>
		</div>

		{#if months.length === 0}
			<p class="mt-6 mb-2 text-center text-sm text-[#55433a]">{empty}</p>
		{:else}
			{@const arcs = donutArcs(months.map((month) => month.total))}
			{@const total = months.reduce((sum, month) => sum + month.total, 0)}
			{@const maxTotal = Math.max(...months.map((month) => month.total), 1)}
			<div class="relative mx-auto my-5 size-52">
				<svg viewBox="0 0 42 42" class="size-full" aria-hidden="true">
					<circle cx="21" cy="21" r="16" fill="none" stroke="#f3efe6" stroke-width="5.5" />
					<g transform="rotate(-90 21 21)">
						{#each arcs as arc, index (months[index].month)}
							<circle
								cx="21"
								cy="21"
								r="16"
								fill="none"
								stroke={sliceColor(kind, index)}
								stroke-width="5.5"
								stroke-linecap="round"
								pathLength="100"
								stroke-dasharray="{arc.length} {100 - arc.length}"
								stroke-dashoffset={-arc.offset}
							/>
						{/each}
					</g>
				</svg>
				<div class=" absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
					<span class="text-xs text-[#55433a]">{centerLabel}</span>
					<strong class="mt-0.5 font-display text-2xl leading-tight font-bold text-[#1c1c17]">
						{formatAmount(total)}
					</strong>
					<span class="mt-0.5 text-xs text-[#897268]">บาท</span>
				</div>
			</div>

			<div class="mb-2.5 flex items-center justify-between text-xs">
				<span class="font-bold text-[#1c1c17]">{listTitle} ({months.length} เดือน)</span>
				<span class="text-[#897268]">แตะเพื่อดูรายการ</span>
			</div>

			<ul class="m-0 flex list-none flex-col gap-2.5 p-0">
				{#each months as month, index (month.month)}
					{@const color = sliceColor(kind, index)}
					<li>
						<a
							href="/?m={month.month}"
							class="flex items-center gap-3 rounded-full bg-[#f7f3eb] p-2.5 pr-3.5 text-[#1c1c17] no-underline transition-colors hover:bg-[#ece8e0]"
						>
							<span
								class="grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold {isLightColor(
									color
								)
									? 'text-[#1c1c17]'
									: 'text-white'}"
								style="background: {color}"
							>
								{Number(month.month.slice(5, 7))}
							</span>
							<div class="min-w-0 flex-1">
								<div class="flex items-center gap-1.5 text-sm font-medium text-[#1c1c17]">
									<span class="truncate">{monthName(month.month)}</span>
									{#if kind === 'out'}
										<span
											class="size-2 shrink-0 rounded-full"
											style="background: {color}"
											aria-hidden="true"
										></span>
									{/if}
								</div>
								<div class="mt-1.5 h-1.5 w-28 max-w-full overflow-hidden rounded-full bg-[#e6e1d6]">
									<div
										class="h-full rounded-full"
										style="width: {Math.max(
											8,
											Math.round((month.total / maxTotal) * 100)
										)}%; background: {color}"
									></div>
								</div>
							</div>
							<div class="flex shrink-0 items-center gap-1">
								<span
									class="font-display text-base font-bold {kind === 'in'
										? index % 4 >= 2
											? 'text-[#7e5700]'
											: 'text-[#3b6941]'
										: 'text-[#9b450f]'}"
								>
									{formatAmount(month.total)}
								</span>
								<span class="text-xs text-[#897268]">฿</span>
								<ChevronRight class="size-4 text-[#897268]" aria-hidden="true" />
							</div>
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
{/snippet}

<div
	class="flex items-center justify-between gap-2 rounded-full border border-[#dcc1b5]/35 bg-white p-1.5 shadow-xs"
>
	<a
		class="grid size-9 place-items-center rounded-full bg-[#f7f3eb] text-[#55433a] no-underline hover:bg-[#ece8e0]"
		href="?y={data.year - 1}"
		aria-label="ปีก่อน"
	>
		<ChevronLeft aria-hidden="true" class="size-4" />
	</a>
	<div class="flex items-center gap-2 rounded-full bg-[#ffeed4] px-4 py-1.5">
		<Calendar class="size-4 text-[#7e5700]" aria-hidden="true" />
		<h1 class="m-0 font-display text-base font-bold text-[#1c1c17]">ปี {data.year + 543}</h1>
		<span class="rounded-full bg-[#f6c467] px-2 py-0.5 text-[0.6875rem] font-bold text-[#5c3d00]">
			สบายใจ
		</span>
	</div>
	<a
		class="grid size-9 place-items-center rounded-full bg-[#f7f3eb] text-[#55433a] no-underline hover:bg-[#ece8e0]"
		href="?y={data.year + 1}"
		aria-label="ปีถัดไป"
	>
		<ChevronRight aria-hidden="true" class="size-4" />
	</a>
</div>

<div class="mt-4 flex items-center gap-3.5 rounded-3xl border border-[#dcc1b5]/35 bg-[#f7f3eb] p-4">
	<div class="size-12 shrink-0 overflow-hidden rounded-full border border-[#dcc1b5]/40 bg-white">
		<img
			src="/capybara.png"
			alt="มาสคอตคาปิบาร่า"
			class="size-full object-cover object-[center_42%]"
		/>
	</div>
	<div>
		<p class="m-0 flex items-center gap-1.5 text-xs font-bold text-[#9b450f]">
			บันทึกแบบปล่อยใจ
			<Cloud class="size-4 text-[#d97736]" aria-hidden="true" />
		</p>
		<p class="mt-0.5 mb-0 text-xs text-[#55433a]">ดูยอดตามสบาย ไม่ต้องกดดันตัวเอง</p>
	</div>
</div>

<div class="mt-4 grid gap-4">
	{@render ring(
		'in',
		'เงินที่ได้รับ',
		'ทั้งปีมีเข้าเรื่อยๆ',
		'รายรับ',
		'ยอดรวมรับทั้งปี',
		'เดือนที่มีเงินเข้า',
		'ปีนี้ยังไม่มีเงินที่ได้รับ',
		data.income
	)}
	{@render ring(
		'out',
		'เงินที่ใช้ไป',
		'ใช้ชีวิตอย่างมีความสุข',
		'รายจ่าย',
		'ยอดรวมจ่ายทั้งปี',
		'เดือนที่มีการจ่าย',
		'ปีนี้ยังไม่มีการใช้เงิน',
		data.expense
	)}
</div>

<p class="mt-5 mb-0 flex items-center justify-center gap-1.5 text-center text-xs text-[#897268]">
	<Moon class="size-3.5" aria-hidden="true" />
	<span>เดือนที่ไม่มีรายการถูกซ่อนไว้เพื่อความสบายตา</span>
</p>
