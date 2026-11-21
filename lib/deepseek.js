// Shared core of the day 23 phrase generator.
// Called both by the Vercel function (api/generate-phrase.js) and by the local
// dev server (tools/serve.mjs), so the deployment path and the local path run
// the exact same code.
const PROMPT =
	'Generate a single, short, poetic or philosophical phrase (under 20 words) ' +
	'inspired by brutalism architecture, in a charles bukowsky style . No quotation marks.';

const DEFAULT_ENDPOINT = 'https://api.deepseek.com';

class PhraseError extends Error {
	constructor(message, status) {
		super(message);
		this.name = 'PhraseError';
		this.status = status;
	}
}

function config() {
	return {
		endpoint: (process.env.DEEPSEEK_BASE_URL || DEFAULT_ENDPOINT).replace(/\/+$/, ''),
		model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
		apiKey: process.env.DEEPSEEK_API_KEY,
	};
}

async function generatePhrase() {
	const { endpoint, model, apiKey } = config();

	if (!apiKey) {
		throw new PhraseError('DEEPSEEK_API_KEY is not set on the server', 503);
	}

	let response;
	try {
		response = await fetch(`${endpoint}/chat/completions`, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify({
				model,
				messages: [{ role: 'user', content: PROMPT }],
				temperature: 1.3,
				max_tokens: 60,
				stream: false,
			}),
		});
	} catch (error) {
		throw new PhraseError(`Could not reach DeepSeek: ${error.message}`, 502);
	}

	if (!response.ok) {
		// The provider body can mention key prefixes or quota details: log it,
		// never forward it to the browser.
		const detail = await response.text().catch(() => '');
		console.error(`DeepSeek responded ${response.status}: ${detail.slice(0, 300)}`);
		throw new PhraseError(`DeepSeek responded ${response.status}`, 502);
	}

	const data = await response.json().catch(() => null);
	const phrase = (data?.choices?.[0]?.message?.content ?? '')
		.replace(/["“”]/g, '')
		.trim();

	if (!phrase) {
		throw new PhraseError('DeepSeek returned an empty phrase', 502);
	}

	return phrase;
}

module.exports = { generatePhrase, PhraseError, PROMPT };
