import { authConfig, sessionValid } from '#lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit/hooks';

authConfig();

export const handle: Handle = async ({ event, resolve }) => {
	const authed = sessionValid(event.cookies.get('session'));
	event.locals.authed = authed;
	if (event.route.id === '/login') {
		if (authed) redirect(303, '/');
		return resolve(event);
	}
	if (event.route.id && !authed) redirect(303, '/login');
	return resolve(event);
};
