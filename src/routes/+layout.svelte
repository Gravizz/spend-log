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
		</header>
		<nav class="tabs">
			<form class="logout" method="post" action="/logout">
				<button type="submit" aria-label="ออกจากระบบ" title="ออกจากระบบ">
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path
							d="M10 4H6v16h4M10 12h9M15 8l4 4-4 4"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
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
