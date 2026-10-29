<script lang="ts">
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';
	import '../app.css';

	let { children, data }: LayoutProps = $props();
</script>

<svelte:head>
	<title>บันทึกรายรับรายจ่าย</title>
</svelte:head>

<div class:app={data.authed}>
	{#if data.authed}
		<header>
			<strong>บันทึก</strong>
			<form method="post" action="/logout">
				<button class="ghost" type="submit">ออกจากระบบ</button>
			</form>
		</header>
		<nav class="tabs">
			<a
				href="/categories"
				aria-current={page.url.pathname.startsWith('/categories') ? 'page' : undefined}
			>
				หมวด
			</a>
			<a href="/" aria-current={page.url.pathname === '/' ? 'page' : undefined}>รายการ</a>
		</nav>
	{/if}

	<main>
		{@render children()}
	</main>
</div>
