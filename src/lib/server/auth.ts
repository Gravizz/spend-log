import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

function required(name: string): string {
	const value = process.env[name];
	if (!value) throw new Error(`ต้องตั้ง ${name} ใน environment`);
	return value;
}

export function authConfig() {
	return {
		user: required('AUTH_USER'),
		password: required('AUTH_PASSWORD'),
		secret: required('SESSION_SECRET')
	};
}

function digest(value: string) {
	return createHash('sha256').update(value).digest();
}

export function credentialsMatch(user: string, password: string): boolean {
	const cfg = authConfig();
	return (
		timingSafeEqual(digest(user), digest(cfg.user)) &&
		timingSafeEqual(digest(password), digest(cfg.password))
	);
}

export function signSession(now = Date.now()): string {
	const exp = String(now + SESSION_MAX_AGE * 1000);
	const sig = createHmac('sha256', authConfig().secret).update(exp).digest('base64url');
	return `${exp}.${sig}`;
}

export function sessionValid(token: string | undefined, now = Date.now()): boolean {
	if (!token) return false;
	const dot = token.indexOf('.');
	if (dot <= 0) return false;
	const exp = token.slice(0, dot);
	const sig = token.slice(dot + 1);
	const expected = createHmac('sha256', authConfig().secret).update(exp).digest('base64url');
	const actual = Buffer.from(sig);
	const wanted = Buffer.from(expected);
	if (actual.length !== wanted.length || !timingSafeEqual(actual, wanted)) return false;
	const expiresAt = Number(exp);
	return Number.isSafeInteger(expiresAt) && expiresAt > now;
}

export function sessionCookie(protocol: string) {
	return {
		path: '/',
		httpOnly: true,
		sameSite: 'lax' as const,
		secure: protocol === 'https:',
		maxAge: SESSION_MAX_AGE
	};
}
