<script lang="ts">
	import type { LayoutProps } from './$types';
	import '../app.css';

	let { children, data }: LayoutProps = $props();
</script>

<svelte:head>
	<title>บันทึกรายรับรายจ่าย</title>
</svelte:head>

{#if data.authed}
	<header>
		<strong>บันทึกรายรับรายจ่าย</strong>
		<a href="/">รายการ</a>
		<a href="/categories">หมวด</a>
		<form method="post" action="/logout">
			<button class="ghost" type="submit">ออกจากระบบ</button>
		</form>
	</header>
{/if}

<main>
	{@render children()}
</main>
