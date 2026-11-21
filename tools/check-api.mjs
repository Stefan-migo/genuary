#!/usr/bin/env node
// Contract check for api/generate-phrase.js.
//
// The Vercel runtime calls an api/ file Node-style, while the local dev server
// dispatches a Web Request. Both must answer the same thing, and a provider
// failure must never leak the provider body to the browser.
//
//   node tools/check-api.mjs

import { createServer } from 'node:http';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const failures = [];
let passed = 0;

function check(name, condition, detail = '') {
	if (condition) {
		passed += 1;
		return;
	}
	failures.push(detail ? `${name} — ${detail}` : name);
}

/** Stands in for the provider so the check never touches the network. */
async function startProvider(payload, status = 200) {
	const server = createServer((request, response) => {
		request.resume();
		response.writeHead(status, { 'content-type': 'application/json' });
		response.end(JSON.stringify(payload));
	});
	await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
	return {
		origin: `http://127.0.0.1:${server.address().port}`,
		close: () => new Promise((ok) => server.close(ok)),
	};
}

/** Minimal Node-style response recorder, shaped like http.ServerResponse. */
function nodeResponse() {
	return {
		statusCode: 0,
		headers: {},
		body: '',
		setHeader(name, value) {
			this.headers[name.toLowerCase()] = value;
		},
		end(chunk) {
			this.body += chunk ?? '';
		},
	};
}

async function callWeb(handler, method) {
	const response = await handler(new Request('https://example.test/api/generate-phrase', { method }));
	const text = await response.text();
	return {
		status: response.status,
		headers: Object.fromEntries(response.headers),
		text,
		json: text ? JSON.parse(text) : null,
	};
}

async function callNode(handler, method) {
	const response = nodeResponse();
	await handler({ method, headers: {} }, response);
	return {
		status: response.statusCode,
		headers: response.headers,
		text: response.body,
		json: response.body ? JSON.parse(response.body) : null,
	};
}

async function main() {
	const { default: handler } = await import(
		pathToFileURL(join(root, 'api', 'generate-phrase.js')).href
	);

	for (const [label, call] of [['web', callWeb], ['node', callNode]]) {
		delete process.env.DEEPSEEK_API_KEY;

		const missing = await call(handler, 'POST');
		check(`${label}: POST without a key is 503`, missing.status === 503, String(missing.status));
		check(
			`${label}: the 503 names the variable`,
			String(missing.json?.error ?? '').includes('DEEPSEEK_API_KEY'),
			missing.text.slice(0, 120),
		);
		check(
			`${label}: CORS header is present`,
			missing.headers['access-control-allow-origin'] === '*',
		);

		const options = await call(handler, 'OPTIONS');
		check(`${label}: OPTIONS is 204`, options.status === 204, String(options.status));
		check(`${label}: OPTIONS has no body`, options.text === '', options.text);

		const wrong = await call(handler, 'GET');
		check(`${label}: GET is 405`, wrong.status === 405, String(wrong.status));

		const provider = await startProvider({
			choices: [{ message: { content: '"Concrete remembers every hand."' } }],
		});
		process.env.DEEPSEEK_API_KEY = 'test-key';
		process.env.DEEPSEEK_BASE_URL = provider.origin;
		try {
			const ok = await call(handler, 'POST');
			check(`${label}: POST is 200 with a key`, ok.status === 200, String(ok.status));
			check(
				`${label}: quotes are stripped from the phrase`,
				ok.json?.phrase === 'Concrete remembers every hand.',
				JSON.stringify(ok.json),
			);
		} finally {
			await provider.close();
		}

		const broken = await startProvider({ error: 'secret-provider-detail' }, 500);
		process.env.DEEPSEEK_BASE_URL = broken.origin;
		try {
			const failed = await call(handler, 'POST');
			check(`${label}: provider 500 becomes 502`, failed.status === 502, String(failed.status));
			check(
				`${label}: provider body is not forwarded`,
				!failed.text.includes('secret-provider-detail'),
				failed.text.slice(0, 120),
			);
		} finally {
			await broken.close();
		}
	}

	delete process.env.DEEPSEEK_API_KEY;
	delete process.env.DEEPSEEK_BASE_URL;

	for (const failure of failures) console.error(`FAIL ${failure}`);
	console.log(`${passed}/${passed + failures.length} checks passed`);
	process.exit(failures.length === 0 ? 0 : 1);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
