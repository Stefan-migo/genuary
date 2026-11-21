// POST /api/generate-phrase -> { phrase }
// The API key lives in the project environment variables, never in the browser.
//
// Two callers, one contract:
// - Vercel invokes files under api/ Node-style: handler(request, response).
// - The local dev server (tools/serve.mjs) dispatches a Web Request and expects
//   a Response back. Returning a Response to Vercel would leave the request
//   open until the function times out, so both signatures are handled here.
const { generatePhrase, PhraseError } = require('../lib/deepseek.js');

const CORS = {
	'access-control-allow-origin': '*',
	'access-control-allow-methods': 'POST, OPTIONS',
	'access-control-allow-headers': 'content-type',
};

async function evaluate(method) {
	if (method === 'OPTIONS') {
		return { status: 204, body: null };
	}

	if (method !== 'POST') {
		return { status: 405, body: { error: 'Method not allowed, use POST' } };
	}

	try {
		return { status: 200, body: { phrase: await generatePhrase() } };
	} catch (error) {
		const status = error instanceof PhraseError ? error.status : 500;
		console.error('generate-phrase failed:', error.message);
		return { status, body: { error: error.message } };
	}
}

function headersFor(result) {
	return result.body === null
		? CORS
		: { ...CORS, 'content-type': 'application/json; charset=utf-8' };
}

async function handler(request, response) {
	const result = await evaluate(request?.method ?? 'GET');

	// Web Request (fetch/undici) has json(); Node's IncomingMessage does not.
	if (typeof request?.json === 'function' || response === undefined) {
		const payload = result.body === null ? null : JSON.stringify(result.body);
		return new Response(payload, { status: result.status, headers: headersFor(result) });
	}

	for (const [name, value] of Object.entries(headersFor(result))) {
		response.setHeader(name, value);
	}
	response.statusCode = result.status;
	response.end(result.body === null ? undefined : JSON.stringify(result.body));
	return undefined;
}

module.exports = handler;
module.exports.handler = handler;
module.exports.evaluate = evaluate;
