import { expect, test } from 'bun:test';
import { isRedirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit/hooks';

test('HTTPS enforcement redirects before login and preserves path and query', async () => {
	const previous = process.env.REQUIRE_HTTPS;
	const keys = ['AUTH_USER', 'AUTH_PASSWORD', 'SESSION_SECRET'] as const;
	const original = keys.map((key) => process.env[key]);
	for (const key of keys) process.env[key] = 'test-only';
	try {
		const { handle } = await import('../src/hooks.server.ts');
		const event = {
			url: new URL('http://spend.gravizz.com/login?next=%2Fsummary'),
			route: { id: '/login' },
			cookies: { get: () => undefined },
			locals: {}
		} as unknown as Parameters<Handle>[0]['event'];
		const resolve = async () => new Response('login');
		process.env.REQUIRE_HTTPS = 'true';
		try {
			await handle({ event, resolve });
			throw new Error('Expected HTTPS redirect');
		} catch (error) {
			if (!isRedirect(error)) throw error;
			expect(error.status).toBe(308);
			expect(error.location).toBe('https://spend.gravizz.com/login?next=%2Fsummary');
		}
		event.url.protocol = 'https:';
		expect((await handle({ event, resolve })).status).toBe(200);
		event.url.protocol = 'http:';
		delete process.env.REQUIRE_HTTPS;
		expect((await handle({ event, resolve })).status).toBe(200);
	} finally {
		if (previous === undefined) delete process.env.REQUIRE_HTTPS;
		else process.env.REQUIRE_HTTPS = previous;
		keys.forEach((key, index) => {
			if (original[index] === undefined) delete process.env[key];
			else process.env[key] = original[index];
		});
	}
});
