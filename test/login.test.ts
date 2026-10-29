import { afterAll, afterEach, beforeAll, expect, spyOn, test } from 'bun:test';
import { isRedirect } from '@sveltejs/kit';
import { actions } from '../src/routes/login/+page.server.ts';

const original = {
	AUTH_USER: process.env.AUTH_USER,
	AUTH_PASSWORD: process.env.AUTH_PASSWORD,
	SESSION_SECRET: process.env.SESSION_SECRET
};
let now = 1_800_000_000_000;
let clock: ReturnType<typeof spyOn>;

beforeAll(() => {
	process.env.AUTH_USER = 'test-user';
	process.env.AUTH_PASSWORD = 'test-password';
	process.env.SESSION_SECRET = 'test-only-session-secret';
});
afterEach(() => clock?.mockRestore());
afterAll(() => {
	for (const [key, value] of Object.entries(original)) {
		if (value === undefined) delete process.env[key];
		else process.env[key] = value;
	}
});

function attempt(ip: string, password = 'wrong', user = 'test-user') {
	const headers = new Headers();
	const cookies = new Map<string, string>();
	const event = {
		request: new Request('https://example.test/login', {
			method: 'POST',
			headers: { 'x-forwarded-for': crypto.randomUUID() },
			body: new URLSearchParams({ user, password })
		}),
		url: new URL('https://example.test/login'),
		getClientAddress: () => ip,
		setHeaders: (values: Record<string, string>) => {
			for (const [name, value] of Object.entries(values)) headers.set(name, value);
		},
		cookies: { set: (name: string, value: string) => cookies.set(name, value) }
	} as unknown as Parameters<typeof actions.default>[0];
	return { result: actions.default(event), headers, cookies };
}

test('five failures block even correct credentials and username/header changes, per IP', async () => {
	clock = spyOn(Date, 'now').mockImplementation(() => now);
	for (let i = 0; i < 5; i++) {
		expect((await attempt('192.0.2.1').result)?.status).toBe(401);
	}
	const blocked = attempt('192.0.2.1', 'test-password', 'different-user');
	expect((await blocked.result)?.status).toBe(429);
	expect(blocked.headers.get('Retry-After')).toBe('900');
	expect(blocked.cookies.size).toBe(0);
	expect((await attempt('192.0.2.1', 'test-password').result)?.status).toBe(429);
	expect((await attempt('192.0.2.2').result)?.status).toBe(401);
});

test('rolling window expires each failure and blocked requests do not extend it', async () => {
	now = 1_800_001_000_000;
	clock = spyOn(Date, 'now').mockImplementation(() => now);
	await attempt('192.0.2.3').result;
	now += 60_000;
	for (let i = 0; i < 4; i++) await attempt('192.0.2.3').result;
	const blocked = attempt('192.0.2.3');
	expect((await blocked.result)?.status).toBe(429);
	expect(blocked.headers.get('Retry-After')).toBe('840');
	now += 839_999;
	const lastSecond = attempt('192.0.2.3');
	expect((await lastSecond.result)?.status).toBe(429);
	expect(lastSecond.headers.get('Retry-After')).toBe('1');
	now += 1;
	expect((await attempt('192.0.2.3').result)?.status).toBe(401);
	expect((await attempt('192.0.2.3').result)?.status).toBe(429);
	now += 900_000;
	expect((await attempt('192.0.2.3').result)?.status).toBe(401);
});

test('successful login clears failures and still issues a session', async () => {
	for (let i = 0; i < 4; i++) await attempt('192.0.2.4').result;
	const login = attempt('192.0.2.4', 'test-password');
	try {
		await login.result;
		throw new Error('Expected redirect');
	} catch (error) {
		expect(isRedirect(error)).toBe(true);
	}
	expect(login.cookies.has('session')).toBe(true);
	for (let i = 0; i < 5; i++) {
		expect((await attempt('192.0.2.4').result)?.status).toBe(401);
	}
	expect((await attempt('192.0.2.4').result)?.status).toBe(429);
});

test('concurrent requests cannot pass the fifth failed login', async () => {
	const results = await Promise.all(
		Array.from({ length: 10 }, () => attempt('192.0.2.5').result)
	);
	expect(results.filter((result) => result?.status === 401)).toHaveLength(5);
	expect(results.filter((result) => result?.status === 429)).toHaveLength(5);
});
