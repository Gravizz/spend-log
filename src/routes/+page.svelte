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

	function formatDay(iso: string) {
		const [year, month, day] = iso.split('-').map(Number);
		return new Intl.DateTimeFormat('th-TH-u-ca-gregory', {
			day: 'numeric',
			month: 'short'
		}).format(new Date(year, month - 1, day));
	}
</script>

<div class="month-nav">
	<h1>{data.label}</h1>
	<div class="month-buttons">
		<a href="?m={data.prev}">ก่อน</a>
		<a href="?m={data.next}">ถัดไป</a>
	</div>
</div>

<section>
	<h2>{editing ? 'แก้รายการ' : 'เพิ่มรายการ'}</h2>
	{#if data.categories.length === 0}
		<p>ยังไม่มีหมวด <a href="/categories">เพิ่มหมวดก่อน</a></p>
	{:else}
		<form method="post" action={editing ? '?/update' : '?/create'} class="stack">
			{#if editing}
				<input type="hidden" name="id" value={editing.id} />
			{/if}
			<div class="pair">
				<label>
					วันที่
					<input type="date" name="occurred_on" required value={occurredOn} />
				</label>
				<label>
					จำนวนเงิน (บาท)
					<input name="amount" inputmode="decimal" required value={amount} />
				</label>
			</div>
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
				โน้ต
				<input name="note" maxlength="200" value={note} />
			</label>
			{#if form?.error}
				<p class="error">{form.error}</p>
			{/if}
			<div class="actions">
				<button class="thumb">{editing ? 'บันทึกการแก้' : 'เพิ่มรายการ'}</button>
				{#if editing}
					<a class="quiet" href="?m={data.month}">ยกเลิก</a>
				{/if}
			</div>
		</form>
	{/if}
</section>

<section class="tally" aria-label="สรุปเดือนนี้">
	<div>
		<span class="muted">คงเหลือ</span>
		<strong class={data.net < 0 ? 'out' : 'in'}>{formatBaht(data.net)}</strong>
	</div>
	<div class="tally-side">
		<span>รับ <b class="in">{formatBaht(data.income)}</b></span>
		<span>จ่าย <b class="out">{formatBaht(data.expense)}</b></span>
	</div>
</section>

{#if data.byCategory.length > 0}
	<section>
		<h2>แยกตามหมวด</h2>
		<ul class="plain">
			{#each data.byCategory as row (row.id)}
				<li class="split">
					<span>{row.name}</span>
					<span class="{row.kind} amount">{formatBaht(row.total)}</span>
				</li>
			{/each}
		</ul>
	</section>
{/if}

<section>
	<h2>รายการ</h2>
	{#if data.entries.length === 0}
		<p class="muted">เดือนนี้ยังไม่มีรายการ</p>
	{:else}
		<ul class="plain">
			{#each data.entries as entry (entry.id)}
				<li class="entry">
					<div>
						<div>{formatDay(entry.occurred_on)} {entry.name}</div>
						{#if entry.note}<div class="muted">{entry.note}</div>{/if}
					</div>
					<div class="{entry.kind} amount">
						{entry.kind === 'in' ? '+' : '−'}{formatBaht(entry.amount_satang)}
					</div>
					<div class="entry-actions">
						<form method="post" action="?/remove">
							<input type="hidden" name="id" value={entry.id} />
							<input type="hidden" name="m" value={data.month} />
							<button class="danger" type="submit">ลบ</button>
						</form>
						<a class="quiet" href="?m={data.month}&edit={entry.id}">แก้</a>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</section>
