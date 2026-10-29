import { credentialsMatch, sessionCookie, signSession } from '#lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
// shortcut: counters reset on restart and are per process; use shared storage for multiple instances.
const failures = new Map<string, number[]>();
let lastCleanup = 0;

function recentFailures(ip: string, now: number): number[] {
	const cutoff = now - WINDOW_MS;
	if (now - lastCleanup >= 60_000) {
		for (const [address, times] of failures) {
			if (times[times.length - 1] <= cutoff) failures.delete(address);
		}
		lastCleanup = now;
	}
	return (failures.get(ip) ?? []).filter((time) => time > cutoff);
}

export const actions = {
	default: async ({ request, cookies, url, getClientAddress, setHeaders }) => {
		const data = await request.formData();
		const ip = getClientAddress();
		const now = Date.now();
		// Keep the check, credential comparison and update synchronous after reading the body.
		const times = recentFailures(ip, now);
		if (times.length >= MAX_FAILURES) {
			const retryAfter = Math.ceil((times[0] + WINDOW_MS - now) / 1000);
			setHeaders({ 'Retry-After': String(retryAfter) });
			return fail(429, {
				error: `ลองเข้าสู่ระบบผิดครบ 5 ครั้งแล้ว กรุณารออีก ${Math.ceil(retryAfter / 60)} นาทีแล้วลองใหม่`
			});
		}
		const user = String(data.get('user') ?? '');
		const password = String(data.get('password') ?? '');
		if (!credentialsMatch(user, password)) {
			failures.set(ip, [...times, now]);
			return fail(401, { error: 'เข้าสู่ระบบไม่ได้ ลองตรวจสอบดูอีกทีนะ' });
		}
		failures.delete(ip);
		cookies.set('session', signSession(), sessionCookie(url.protocol));
		redirect(303, '/');
	}
} satisfies Actions;
