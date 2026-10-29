<script lang="ts">
	import { page } from '$app/state';
	import ChartNoAxesCombined from '@lucide/svelte/icons/chart-no-axes-combined';
	import List from '@lucide/svelte/icons/list';
	import LogOut from '@lucide/svelte/icons/log-out';
	import Shapes from '@lucide/svelte/icons/shapes';
	import User from '@lucide/svelte/icons/user';
	import type { LayoutProps } from './$types';
	import '../app.css';

	let { children, data }: LayoutProps = $props();

	const title = $derived(
		page.url.pathname.startsWith('/categories')
			? 'Categories'
			: page.url.pathname.startsWith('/summary')
				? 'Summary'
				: 'Transactions'
	);

	const tab =
		'relative flex min-h-12 min-w-15 flex-col items-center justify-center gap-0.5 px-2.5 pt-1 pb-1.5 text-xs font-medium text-[#55433a] no-underline aria-[current=page]:font-bold aria-[current=page]:text-[#9b450f] aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-2 aria-[current=page]:after:bottom-0 aria-[current=page]:after:h-[2.5px] aria-[current=page]:after:rounded-full aria-[current=page]:after:bg-[#9b450f]';
</script>

<svelte:head>
	<title>บันทึกรายรับรายจ่าย</title>
</svelte:head>

<div class="min-h-dvh bg-[#fdf9f1] text-[#1c1c17]">
	{#if data.authed}
		<header class="sticky top-0 z-20 border-b border-[#dcc1b5]/30 bg-[#fdf9f1]/95 backdrop-blur-sm">
			<div class="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
				<div class="flex items-center gap-2.5">
					<span
						class="grid size-9 place-items-center rounded-full bg-[#ffdbcb] text-[#9b450f]"
						aria-hidden="true"
					>
						<svg viewBox="0 0 24 24" class="size-5 fill-none stroke-current" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
							<path d="M12 4.5C9.5 7.5 9 11.5 12 16.5C15 11.5 14.5 7.5 12 4.5Z" />
							<path d="M12 16.5C8.5 16 5.5 13.5 4.5 9.5C8 10 10.5 12.5 12 16.5Z" />
							<path d="M12 16.5C15.5 16 18.5 13.5 19.5 9.5C16 10 13.5 12.5 12 16.5Z" />
							<path d="M7 19H17" />
						</svg>
					</span>
					<span class="font-display text-lg font-semibold tracking-[-0.01em] text-[#1c1c17]">
						{title}
					</span>
				</div>
				<span
					class="grid size-8 place-items-center rounded-full bg-[#9b450f] text-white"
					aria-hidden="true"
				>
					<User class="size-4" />
				</span>
			</div>
		</header>

		<nav
			class="fixed inset-x-0 bottom-0 z-20 border-t border-[#dcc1b5]/35 bg-[#fdf9f1] pb-[env(safe-area-inset-bottom)]"
		>
			<div class="mx-auto flex max-w-lg items-center justify-between px-4 pt-1.5 pb-1">
				<form method="post" action="/logout">
					<button
						class="grid size-11 min-h-11 place-items-center rounded-full border border-[#dcc1b5]/40 bg-[#f3efe6] p-0 text-[#55433a] hover:bg-[#ece8e0] hover:brightness-100"
						type="submit"
						aria-label="ออกจากระบบ"
						title="ออกจากระบบ"
					>
						<LogOut class="size-5" aria-hidden="true" />
					</button>
				</form>
				<div class="flex items-center gap-1">
					<a
						href="/summary"
						class={tab}
						aria-current={page.url.pathname.startsWith('/summary') ? 'page' : undefined}
					>
						<ChartNoAxesCombined class="size-5" aria-hidden="true" />
						<span>สรุป</span>
					</a>
					<a
						href="/categories"
						class={tab}
						aria-current={page.url.pathname.startsWith('/categories') ? 'page' : undefined}
					>
						<Shapes class="size-5" aria-hidden="true" />
						<span>หมวด</span>
					</a>
					<a href="/" class={tab} aria-current={page.url.pathname === '/' ? 'page' : undefined}>
						<List class="size-5" aria-hidden="true" />
						<span>รายการ</span>
					</a>
				</div>
			</div>
		</nav>
	{/if}

	<main
		class="mx-auto {data.authed
			? 'max-w-lg px-4 pt-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))]'
			: 'flex min-h-dvh w-full max-w-md items-center px-5 py-12'}"
	>
		{@render children()}
	</main>
</div>
