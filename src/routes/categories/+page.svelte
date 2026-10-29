<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import CirclePlus from '@lucide/svelte/icons/circle-plus';
	import Leaf from '@lucide/svelte/icons/leaf';
	import Lock from '@lucide/svelte/icons/lock';
	import Moon from '@lucide/svelte/icons/moon';
	import PiggyBank from '@lucide/svelte/icons/piggy-bank';
	import Plus from '@lucide/svelte/icons/plus';
	import ShoppingBag from '@lucide/svelte/icons/shopping-bag';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let kind: 'out' | 'in' = $state('out');
</script>

<section class="flex items-center justify-between gap-4 rounded-3xl border border-[#dcc1b5]/35 bg-[#f7f3eb] p-5">
	<div class="min-w-0">
		<div class="mb-2 flex items-center gap-2">
			<span
				class="grid size-6 shrink-0 place-items-center rounded-full bg-[#ffdeac] text-[#7e5700]"
				aria-hidden="true"
			>
				<Leaf class="size-3.5" />
			</span>
			<span class="text-xs font-bold text-[#7e5700]">จัดการสบายๆ ค่อยๆ บันทึก</span>
		</div>
		<h1 class="m-0 font-display text-xl font-bold text-[#1c1c17]">หมวดหมู่</h1>
		<p class="mt-1 mb-0 text-xs leading-5 text-[#55433a]">
			ปรับแต่งให้เหมาะกับสไตล์การใช้ชีวิต ไม่ต้องเป๊ะ แค่สบายใจ
		</p>
	</div>
	<div class="relative shrink-0">
		<div
			class="grid size-16 place-items-center rounded-full border border-[#dcc1b5]/40 bg-[#efeae1] text-[#9b450f]"
			aria-hidden="true"
		>
			<Moon class="size-7" />
		</div>
		<span
			class="absolute -right-1 -bottom-1 rounded-full bg-[#e07a42] px-2.5 py-0.5 text-[0.6875rem] font-bold text-white shadow-xs"
		>
			ชิลๆ
		</span>
	</div>
</section>

<section class="mt-4 rounded-3xl border border-[#dcc1b5]/30 bg-white p-5 shadow-xs">
	<div class="mb-4 flex items-center justify-between gap-2">
		<div class="flex items-center gap-2.5">
			<span
				class="grid size-9 shrink-0 place-items-center rounded-full bg-[#ffdbcb] text-[#9b450f]"
				aria-hidden="true"
			>
				<CirclePlus class="size-5" />
			</span>
			<h2 class="m-0 font-display text-lg font-bold text-[#1c1c17]">เพิ่มหมวดใหม่</h2>
		</div>
		<span class="text-xs text-[#55433a]">ไม่เกิน 40 ตัวอักษร</span>
	</div>

	<form method="post" action="?/create" class="flex flex-col gap-3.5">
		<div class="flex flex-col gap-1.5">
			<label class="text-xs font-bold text-[#1c1c17]" for="category-name">ชื่อหมวดหมู่</label>
			<div class="relative flex items-center">
				<input
					id="category-name"
					name="name"
					aria-label="ชื่อหมวด"
					placeholder="เช่น ชานมไข่มุก, ขนมแมว, ค่าเน็ต..."
					required
					maxlength="40"
					class="h-12 min-h-12 w-full rounded-full border border-[#dcc1b5]/40 bg-[#f7f3eb] pr-11 pl-4 text-sm text-[#1c1c17] placeholder:text-[#897268]/80 focus:border-[#9b450f]/50 focus:bg-[#ece8e0] focus:outline-none"
				/>
				<svg
					viewBox="0 0 24 24"
					class="pointer-events-none absolute right-4 size-5 text-[#55433a]"
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
			</div>
		</div>

		<fieldset class="m-0 flex flex-col gap-1.5 border-0 p-0">
			<legend class="mb-1.5 text-xs font-bold text-[#1c1c17]">ชนิดของหมวด</legend>
			<div class="grid grid-cols-2 rounded-full border border-[#dcc1b5]/40 bg-[#f7f3eb] p-1">
				<label
					class="flex min-h-10 cursor-pointer items-center justify-center gap-1.5 rounded-full text-xs font-bold transition-colors {kind ===
					'out'
						? 'bg-[#d97736] text-white shadow-xs'
						: 'text-[#55433a]'}"
				>
					<input
						type="radio"
						name="kind"
						value="out"
						class="sr-only"
						bind:group={kind}
					/>
					<ShoppingBag class="size-4" aria-hidden="true" />
					<span>รายจ่าย</span>
				</label>
				<label
					class="flex min-h-10 cursor-pointer items-center justify-center gap-1.5 rounded-full text-xs font-bold transition-colors {kind ===
					'in'
						? 'bg-[#d97736] text-white shadow-xs'
						: 'text-[#55433a]'}"
				>
					<input
						type="radio"
						name="kind"
						value="in"
						class="sr-only"
						bind:group={kind}
					/>
					<PiggyBank class="size-4" aria-hidden="true" />
					<span>รายรับ</span>
				</label>
			</div>
		</fieldset>

		<button
			type="submit"
			class="mt-0.5 flex h-12 min-h-12 w-full items-center justify-center gap-1.5 rounded-full border-0 bg-[#d97736] text-sm font-bold text-white shadow-xs hover:bg-[#c3672b] hover:brightness-100"
		>
			<Plus class="size-4" aria-hidden="true" />
			<span>เพิ่มหมวดหมู่นี้</span>
		</button>
	</form>

	{#if form?.error}
		<p
			class="mt-3 mb-0 rounded-2xl border border-[#f5cfca] bg-[#fbe7e4] px-4 py-3 text-sm text-[#933b2b]"
			role="alert"
		>
			{form.error}
		</p>
	{/if}
</section>

<section class="mt-6">
	<div class="flex flex-wrap items-center justify-between gap-2">
		<div class="flex items-center gap-2">
			<svg
				viewBox="0 0 24 24"
				class="size-5 text-[#9b450f]"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M5 4v16" />
				<path d="M19 4v16" />
				<path d="M5 8h14" />
				<path d="M5 16h14" />
				<path d="M9 12h6" />
			</svg>
			<h2 class="m-0 font-display text-lg font-bold text-[#1c1c17]">รายการทั้งหมด</h2>
		</div>
		<span
			class="inline-flex items-center gap-1.5 rounded-full bg-[#ffdeac]/75 px-3 py-1 text-xs font-bold text-[#5c3d00]"
		>
			<span class="size-2 rounded-full bg-[#7e5700]" aria-hidden="true"></span>
			มี {data.categories.length} หมวดหมู่ใช้งานอยู่
		</span>
	</div>
	<p class="mt-1.5 mb-3.5 text-xs leading-5 text-[#55433a]">
		แตะที่ชื่อเพื่อเปลี่ยนชื่อได้ทันที หมวดที่ยังไม่เคยใช้สามารถกดถังขยะเพื่อลบได้เลยนะ
	</p>

	{#if data.categories.length === 0}
		<p class="rounded-3xl border border-[#dcc1b5]/35 bg-white p-5 text-center text-sm text-[#55433a]">
			ยังไม่มีหมวด เพิ่มชื่อด้านบนก่อนบันทึกรายการ
		</p>
	{:else}
		<ul class="m-0 flex list-none flex-col gap-2.5 p-0">
			{#each data.categories as category (category.id)}
				<li
					class="flex items-center gap-2 rounded-full border border-[#dcc1b5]/35 bg-white p-2 pl-3 shadow-[0_1px_2px_rgba(28,28,23,0.03)]"
				>
					<span
						class="shrink-0 rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap {category.kind ===
						'in'
							? 'bg-[#caecbf] text-[#264e2c]'
							: 'bg-[#ffdbcb] text-[#9b450f]'}"
					>
						{category.kind === 'in' ? 'รายรับ' : 'รายจ่าย'}
					</span>
					<form method="post" action="?/rename" class="flex min-w-0 flex-1 items-center gap-2">
						<input type="hidden" name="id" value={category.id} />
						<input
							class="h-10 min-h-10 w-auto min-w-0 flex-1 rounded-full border border-transparent bg-[#f7f3eb] px-4 text-sm text-[#1c1c17] focus:border-[#9b450f]/40 focus:bg-[#ece8e0] focus:outline-none"
							name="name"
							aria-label="ชื่อ"
							value={category.name}
							required
							maxlength="40"
						/>
						<button
							class="grid size-10 min-h-10 shrink-0 place-items-center rounded-full border-0 bg-[#f7f3eb] p-0 text-[#55433a] hover:bg-[#ece8e0] hover:brightness-100"
							type="submit"
							aria-label="บันทึก"
							title="บันทึก"
						>
							<Check class="size-4" aria-hidden="true" />
						</button>
					</form>
					{#if category.used}
						<span
							class="grid size-10 shrink-0 place-items-center text-[#897268]"
							title="หมวดนี้มีรายการอยู่ ลบไม่ได้"
							aria-label="หมวดนี้มีรายการอยู่"
						>
							<Lock class="size-4" aria-hidden="true" />
						</span>
					{:else}
						<form method="post" action="?/remove" class="shrink-0">
							<input type="hidden" name="id" value={category.id} />
							<button
								class="grid size-10 min-h-10 shrink-0 place-items-center rounded-full border-0 bg-[#f7f3eb] p-0 text-[#55433a] hover:bg-[#fbe7e4] hover:text-[#933b2b] hover:brightness-100"
								type="submit"
								aria-label="ลบ"
								title="ลบ"
							>
								<Trash2 class="size-4" aria-hidden="true" />
							</button>
						</form>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</section>

<div class="mt-6 flex items-center gap-3.5 rounded-3xl border border-[#dcc1b5]/35 bg-[#f7f3eb] p-4">
	<span
		class="grid size-11 shrink-0 place-items-center rounded-full bg-[#eae4d9] text-[#9b450f]"
		aria-hidden="true"
	>
		<svg viewBox="0 0 24 24" class="size-5 fill-current">
			<circle cx="12" cy="5.5" r="2" />
			<path
				d="M12 9c-1.8 0-3.2 1-3.9 2.5L6.5 15H4a1 1 0 0 0 0 2h3.2a1.5 1.5 0 0 0 1.3-.8l1.2-2.4v2.7L7.2 18a1.2 1.2 0 0 0 .6 2.2h8.4a1.2 1.2 0 0 0 .6-2.2l-2.5-1.5v-2.7l1.2 2.4a1.5 1.5 0 0 0 1.3.8H20a1 1 0 0 0 0-2h-2.5l-1.6-3.5C15.2 10 13.8 9 12 9Z"
			/>
		</svg>
	</span>
	<div>
		<p class="m-0 text-xs font-bold text-[#1c1c17]">อย่ากดดันตัวเอง</p>
		<p class="mt-0.5 mb-0 text-xs leading-5 text-[#55433a]">
			มีหมวดน้อยๆ ชีวิตก็สบายดี จะเพิ่มหรือลดเมื่อไหร่ก็ย่อมได้เสมอ
		</p>
	</div>
</div>
