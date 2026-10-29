<script lang="ts">
	import { formatBaht } from '#lib/money';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const editing = $derived(data.editing);
	const occurredOn = $derived(form?.occurred_on ?? editing?.occurred_on ?? data.today);
	const categoryId = $derived(form?.category_id ?? (editing ? String(editing.category_id) : ''));
	const amount = $derived(
		form?.amount ?? (editing ? (editing.amount_satang / 100).toFixed(2) : '')
	);
	const note = $derived(form?.note ?? editing?.note ?? '');
</script>

<div class="month-nav">
	<a href="?m={data.prev}">เดือนก่อน</a>
	<h1>{data.label}</h1>
	<a href="?m={data.next}">เดือนถัดไป</a>
</div>

<section class="cards">
	<article class="card">
		<p class="muted">รวมรับ</p>
		<p class="in">{formatBaht(data.income)}</p>
	</article>
	<article class="card">
		<p class="muted">รวมจ่าย</p>
		<p class="out">{formatBaht(data.expense)}</p>
	</article>
	<article class="card">
		<p class="muted">คงเหลือ</p>
		<p class={data.net < 0 ? 'out' : 'in'}>{formatBaht(data.net)}</p>
	</article>
</section>

{#if data.byCategory.length > 0}
	<section>
		<h2>แยกตามหมวด</h2>
		<ul class="plain">
			{#each data.byCategory as row (row.id)}
				<li class="row">
					<span>{row.name}</span>
					<span class={row.kind}>{formatBaht(row.total)}</span>
				</li>
			{/each}
		</ul>
	</section>
{/if}

<section>
	<h2>{editing ? 'แก้รายการ' : 'เพิ่มรายการ'}</h2>
	{#if data.categories.length === 0}
		<p>ยังไม่มีหมวด <a href="/categories">เพิ่มหมวดก่อน</a></p>
	{:else}
		<form method="post" action={editing ? '?/update' : '?/create'} class="stack">
			{#if editing}
				<input type="hidden" name="id" value={editing.id} />
			{/if}
			<label>
				วันที่
				<input type="date" name="occurred_on" required value={occurredOn} />
			</label>
			<label>
				หมวด
				<select name="category_id" required>
					<option value="" selected={categoryId === ''}>เลือกหมวด</option>
					{#each data.categories as category (category.id)}
						<option value={category.id} selected={String(category.id) === categoryId}>
							{category.name} ({category.kind === 'in' ? 'รายรับ' : 'รายจ่าย'})
						</option>
					{/each}
				</select>
			</label>
			<label>
				จำนวนเงิน (บาท)
				<input name="amount" inputmode="decimal" required value={amount} />
			</label>
			<label>
				โน้ต
				<input name="note" maxlength="200" value={note} />
			</label>
			{#if form?.error}
				<p class="error">{form.error}</p>
			{/if}
			<div class="buttons">
				<button>{editing ? 'บันทึกการแก้' : 'เพิ่ม'}</button>
				{#if editing}
					<a href="?m={data.month}">ยกเลิก</a>
				{/if}
			</div>
		</form>
	{/if}
</section>

<section>
	<h2>รายการ</h2>
	{#if data.entries.length === 0}
		<p class="muted">เดือนนี้ยังไม่มีรายการ</p>
	{:else}
		<ul class="plain">
			{#each data.entries as entry (entry.id)}
				<li class="row">
					<div class="grow">
						<div>{entry.occurred_on} · {entry.name}</div>
						{#if entry.note}<div class="muted">{entry.note}</div>{/if}
					</div>
					<div class={entry.kind}>
						{entry.kind === 'in' ? '+' : '−'}{formatBaht(entry.amount_satang)}
					</div>
					<a href="?m={data.month}&edit={entry.id}">แก้</a>
					<form method="post" action="?/remove">
						<input type="hidden" name="id" value={entry.id} />
						<input type="hidden" name="m" value={data.month} />
						<button class="ghost" type="submit">ลบ</button>
					</form>
				</li>
			{/each}
		</ul>
	{/if}
</section>
