<script lang="ts">
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<h1>หมวด</h1>
<form method="post" action="?/create" class="cat-create">
	<input name="name" aria-label="ชื่อหมวด" placeholder="ชื่อหมวด" required maxlength="40" />
	<select name="kind" aria-label="ชนิด">
		<option value="out">รายจ่าย</option>
		<option value="in">รายรับ</option>
	</select>
	<button class="thumb">เพิ่มหมวด</button>
</form>
{#if form?.error}
	<p class="error">{form.error}</p>
{/if}

{#if data.categories.length === 0}
	<p class="muted">ยังไม่มีหมวด เพิ่มชื่อด้านบนก่อนบันทึกรายการ</p>
{:else}
	<ul class="plain">
		{#each data.categories as category (category.id)}
			<li class="cat">
				<span class="chip {category.kind}">{category.kind === 'in' ? 'รายรับ' : 'รายจ่าย'}</span>
				<form method="post" action="?/rename" class="cat-edit">
					<input type="hidden" name="id" value={category.id} />
					<input
						name="name"
						aria-label="ชื่อ"
						value={category.name}
						required
						maxlength="40"
					/>
					<button class="icon" type="submit" aria-label="บันทึก" title="บันทึก">
						<svg viewBox="0 0 24 24" aria-hidden="true">
							<path
								d="M5 12.5 9.5 17 19 7"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</button>
				</form>
				<form method="post" action="?/remove" class="cat-remove">
					<input type="hidden" name="id" value={category.id} />
					<button class="danger icon" type="submit" aria-label="ลบ" title="ลบ">
						<svg viewBox="0 0 24 24" aria-hidden="true">
							<path
								d="M4 7h16M9 7V5h6v2M8 7l1 12h6l1-12"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</button>
				</form>
			</li>
		{/each}
	</ul>
{/if}
