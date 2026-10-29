<script lang="ts">
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
</script>

<div class="login">
	<h1>เข้าสู่ระบบ</h1>
	<form method="post" class="stack">
		<label>
			ชื่อผู้ใช้
			<input name="user" autocomplete="username" required />
		</label>
		<label>
			รหัสผ่าน
			<input name="password" type="password" autocomplete="current-password" required />
		</label>
		{#if form?.error}
			<p class="error">{form.error}</p>
		{/if}
		<button>เข้าสู่ระบบ</button>
	</form>
</div>
