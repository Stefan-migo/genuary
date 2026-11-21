// Vercel Function: POST /api/generate-phrase -> { phrase }
// Web Handler signature (Request in, Response out). The API key lives in the
// project environment variables, never in the browser.
const { generatePhrase, PhraseError } = require('../lib/deepseek.js');

const CORS = {
	'access-control-allow-origin': '*',
	'access-control-allow-methods': 'POST, OPTIONS',
	'access-control-allow-headers': 'content-type',
};

function json(body, status) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { ...CORS, 'content-type': 'application/json; charset=utf-8' },
	});
}

module.exports = async function handler(request) {
	const method = request.method ?? 'GET';

	if (method === 'OPTIONS') {
		return new Response(null, { status: 204, headers: CORS });
	}

	if (method !== 'POST') {
		return json({ error: 'Method not allowed, use POST' }, 405);
	}

	try {
		return json({ phrase: await generatePhrase() }, 200);
	} catch (error) {
		const status = error instanceof PhraseError ? error.status : 500;
		console.error('generate-phrase failed:', error.message);
		return json({ error: error.message }, status);
	}
};
