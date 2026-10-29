<script lang="ts">
	import { page } from '$app/state';
	import LogOut from '@lucide/svelte/icons/log-out';
	import type { LayoutProps } from './$types';
	import '../app.css';

	let { children, data }: LayoutProps = $props();

	const tab =
		'grid min-h-13 min-w-26 place-items-center px-3 text-muted no-underline aria-[current=page]:text-accent aria-[current=page]:shadow-[inset_0_-3px_0_var(--color-accent)] md:min-h-10';
</script>

<svelte:head>
	<title>บันทึกรายรับรายจ่าย</title>
</svelte:head>

<div>
	{#if data.authed}
		<header class="mx-auto flex max-w-lg items-center px-4 pt-3.5 pb-1">
			<strong class="text-[1.35rem]">บันทึก</strong>
		</header>
		<nav
			class="fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-lg justify-end gap-1 border-t border-line bg-surface px-3 pb-[env(safe-area-inset-bottom)] md:static md:border-0 md:bg-transparent md:px-4 md:pb-0"
		>
			<form
				class="fixed bottom-[env(safe-area-inset-bottom)] left-[max(0.25rem,calc(50%-16rem))] z-30 md:bottom-3"
				method="post"
				action="/logout"
			>
				<button
					class="grid size-13 min-h-13 place-items-center border-0 bg-transparent p-0 text-muted md:size-11 md:min-h-11 md:rounded-xl md:border md:border-line md:bg-surface [&_svg]:size-5"
					type="submit"
					aria-label="ออกจากระบบ"
					title="ออกจากระบบ"
				>
					<LogOut aria-hidden="true" />
				</button>
			</form>
			<a
				href="/categories"
				class={tab}
				aria-current={page.url.pathname.startsWith('/categories') ? 'page' : undefined}
			>
				หมวด
			</a>
			<a href="/" class={tab} aria-current={page.url.pathname === '/' ? 'page' : undefined}>รายการ</a>
		</nav>
	{/if}

	<main
		class="mx-auto max-w-lg px-4 {data.authed
			? 'pt-2 pb-[calc(8.4rem+env(safe-area-inset-bottom))] md:pb-8'
			: 'pt-4 pb-8'}"
	>
		{@render children()}
	</main>
</div>
