<script lang="ts">
	import { page } from '$app/state';
	import LogOut from '@lucide/svelte/icons/log-out';
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
		</header>
		<nav class="tabs">
			<form class="logout" method="post" action="/logout">
				<button type="submit" aria-label="ออกจากระบบ" title="ออกจากระบบ">
					<LogOut aria-hidden="true" />
				</button>
			</form>
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
