<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const field = 'max-md:scroll-mb-36';
	const icon = 'grid size-10 min-h-10 place-items-center p-0 [&_svg]:size-5';
</script>

<h1>หมวด</h1>
<form
	method="post"
	action="?/create"
	class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-1.5 md:grid-cols-[minmax(0,1fr)_auto_auto]"
>
	<input class={field} name="name" aria-label="ชื่อหมวด" placeholder="ชื่อหมวด" required maxlength="40" />
	<select class="{field} w-auto" name="kind" aria-label="ชนิด">
		<option value="out">รายจ่าย</option>
		<option value="in">รายรับ</option>
	</select>
	<button
		class="max-md:fixed max-md:right-4 max-md:bottom-[calc(4.6rem+env(safe-area-inset-bottom))] max-md:z-30 max-md:w-auto max-md:min-w-36 max-md:shadow-[0_0.35rem_0.9rem_oklch(0.28_0.04_230/0.18)]"
	>
		เพิ่มหมวด
	</button>
</form>
{#if form?.error}
	<p class="m-0 rounded-xl bg-error-soft px-3 py-2.5 text-out">{form.error}</p>
{/if}

{#if data.categories.length === 0}
	<p class="text-muted">ยังไม่มีหมวด เพิ่มชื่อด้านบนก่อนบันทึกรายการ</p>
{:else}
	<ul class="m-0 list-none p-0">
		{#each data.categories as category (category.id)}
			<li class="flex flex-wrap items-center gap-1.5 border-b border-line py-1.5">
				<span
					class="rounded-full px-2.5 py-0.5 whitespace-nowrap {category.kind === 'in'
						? 'bg-in-soft text-in'
						: 'bg-out-soft text-out'}"
				>
					{category.kind === 'in' ? 'รายรับ' : 'รายจ่าย'}
				</span>
				<form method="post" action="?/rename" class="contents">
					<input type="hidden" name="id" value={category.id} />
					<input
						class="{field} w-auto min-w-0 flex-[1_1_8rem]"
						name="name"
						aria-label="ชื่อ"
						value={category.name}
						required
						maxlength="40"
					/>
					<button class="{icon} order-2" type="submit" aria-label="บันทึก" title="บันทึก">
						<Check aria-hidden="true" />
					</button>
				</form>
				<form method="post" action="?/remove" class="contents">
					<input type="hidden" name="id" value={category.id} />
					<button
						class="{icon} order-1 border-line bg-transparent text-out"
						type="submit"
						aria-label="ลบ"
						title="ลบ"
					>
						<Trash2 aria-hidden="true" />
					</button>
				</form>
			</li>
		{/each}
	</ul>
{/if}
