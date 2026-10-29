<script lang="ts">
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
</script>

<div class="grid min-h-[calc(100dvh-2rem)] content-center gap-5 pb-8">
	<h1>เข้าสู่ระบบ</h1>
	<form method="post" class="grid gap-3">
		<label>
			ชื่อผู้ใช้
			<input name="user" autocomplete="username" required />
		</label>
		<label>
			รหัสผ่าน
			<input name="password" type="password" autocomplete="current-password" required />
		</label>
		{#if form?.error}
			<p class="m-0 rounded-xl bg-error-soft px-3 py-2.5 text-out">{form.error}</p>
		{/if}
		<button class="w-full">เข้าสู่ระบบ</button>
	</form>
</div>
