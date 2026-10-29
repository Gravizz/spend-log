import { credentialsMatch, sessionCookie, signSession } from '#lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
	default: async ({ request, cookies, url }) => {
		const data = await request.formData();
		const user = String(data.get('user') ?? '');
		const password = String(data.get('password') ?? '');
		if (!credentialsMatch(user, password))
		return fail(401, { error: 'เข้าสู่ระบบไม่ได้ ลองตรวจสอบดูอีกทีนะ' });
		cookies.set('session', signSession(), sessionCookie(url.protocol));
		redirect(303, '/');
	}
};
