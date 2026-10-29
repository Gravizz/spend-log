<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Eye from '@lucide/svelte/icons/eye';
	import EyeOff from '@lucide/svelte/icons/eye-off';
	import Info from '@lucide/svelte/icons/info';
	import Lock from '@lucide/svelte/icons/lock';
	import User from '@lucide/svelte/icons/user';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
	let showPassword = $state(false);
</script>

<div class="login mx-auto flex w-full max-w-sm flex-col items-center">
	<div class="relative mb-8 flex items-center justify-center">
		<div
			class="flex size-24 items-center justify-center rounded-full border border-[#ffdeac]/50 bg-[#ffdeac]/40 p-1.5 shadow-sm"
		>
			<img
				src="/capybara.png"
				alt="มาสคอตคาปิบาร่า"
				class="size-full rounded-full bg-white object-cover object-[center_42%]"
			/>
		</div>
		<div
			class="absolute -top-1 -right-2 flex items-center gap-1 rounded-full border border-[#dcc1b5]/30 bg-white px-2.5 py-1 shadow-sm"
		>
			<span class="text-xs" aria-hidden="true">🍊</span>
			<span class="text-[0.6875rem] leading-[0.875rem] font-bold tracking-[0.03em] text-[#7e5700]"
				>ค่อยๆ จดนะ</span
			>
		</div>
	</div>

	<div class="mb-8 text-center">
		<h1>เข้าสู่ระบบ</h1>
		<p class="m-0 text-base leading-6 text-[#55433a]">จดแบบสบายๆ ไม่เร่งรีบ ☁️</p>
	</div>

	{#if form?.error}
		<div
			class="mb-5 flex w-full items-center gap-3 rounded-2xl border border-[#f5cfca] bg-[#fbe7e4] p-5 text-[#933b2b] shadow-sm"
			role="alert"
		>
			<Info class="size-5 shrink-0 text-[#c5432d]" aria-hidden="true" />
			<p class="m-0 text-sm leading-snug">{form.error}</p>
		</div>
	{/if}

	<div class="w-full rounded-3xl border border-[#dcc1b5]/30 bg-white p-8 shadow-sm">
		<form method="post" class="flex flex-col gap-5">
			<div class="flex flex-col gap-1.5">
				<label
					class="flex items-center gap-1 text-[0.8125rem] leading-4 font-bold tracking-[0.02em] text-[#55433a]"
					for="username"
				>
					ชื่อผู้ใช้
					<span class="text-[#9b450f]">*</span>
				</label>
				<div class="relative flex items-center">
					<User class="pointer-events-none absolute left-4 size-5 text-[#897268]" aria-hidden="true" />
					<input
						id="username"
						name="user"
						autocomplete="username"
						required
						placeholder="เช่น meow_chill"
						class="h-12 min-h-12 w-full rounded-2xl border border-transparent bg-[#f7f3eb] pr-4 pl-12 text-base text-[#1c1c17] placeholder:text-[#dcc1b5] focus:bg-[#ece8e0] focus:ring-1 focus:ring-[#9b450f]/40 focus:outline-none"
					/>
				</div>
			</div>

			<div class="flex flex-col gap-1.5">
				<label
					class="flex items-center gap-1 text-[0.8125rem] leading-4 font-bold tracking-[0.02em] text-[#55433a]"
					for="password"
				>
					รหัสผ่าน
					<span class="text-[#9b450f]">*</span>
				</label>
				<div class="relative flex items-center">
					<Lock class="pointer-events-none absolute left-4 size-5 text-[#897268]" aria-hidden="true" />
					<input
						id="password"
						name="password"
						type={showPassword ? 'text' : 'password'}
						autocomplete="current-password"
						required
						placeholder="••••••••"
						class="h-12 min-h-12 w-full rounded-2xl border border-transparent bg-[#f7f3eb] pr-12 pl-12 text-base tracking-wider text-[#1c1c17] placeholder:text-[#dcc1b5] focus:bg-[#ece8e0] focus:ring-1 focus:ring-[#9b450f]/40 focus:outline-none"
					/>
					<button
						type="button"
						class="absolute right-3 flex size-8 min-h-8 items-center justify-center rounded-full border-0 bg-transparent p-0 text-[#897268] hover:bg-transparent hover:text-[#1c1c17] hover:brightness-100"
						aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
						onclick={() => (showPassword = !showPassword)}
					>
						{#if showPassword}
							<EyeOff class="size-[1.125rem]" aria-hidden="true" />
						{:else}
							<Eye class="size-[1.125rem]" aria-hidden="true" />
						{/if}
					</button>
				</div>
			</div>

			<button
				class="mt-1.5 flex h-12 min-h-12 w-full items-center justify-center gap-2 rounded-full border-0 bg-[#9b450f] text-[0.8125rem] leading-4 font-bold tracking-[0.02em] text-white shadow-sm hover:bg-[#853a0b] hover:brightness-100 active:translate-y-0 active:scale-[0.99]"
				type="submit"
			>
				เข้าสู่ระบบ
				<ArrowRight class="size-4" aria-hidden="true" />
			</button>
		</form>
	</div>

	<p class="mt-8 flex items-center justify-center gap-1.5 text-center text-sm leading-5 text-[#897268]">
		แอปบันทึกรายรับรายจ่ายส่วนตัว
		<span class="inline-block size-1.5 rounded-full bg-[#dcc1b5]" aria-hidden="true"></span>
		ชิลๆ ไม่คิดมาก
	</p>
</div>

<style>
	.login {
		font-family: Karla, Prompt, sans-serif;
		color: #1c1c17;
	}

	.login h1 {
		margin: 0 0 0.375rem;
		font-family: 'Bricolage Grotesque', Prompt, sans-serif;
		font-size: 1.75rem;
		font-weight: 600;
		line-height: 2.25rem;
		letter-spacing: -0.015em;
	}
</style>
