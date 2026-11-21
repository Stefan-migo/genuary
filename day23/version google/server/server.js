// Legacy local runner for the day 23 sketch: express + the copy in public/.
// The deployment path is the serverless function in api/generate-phrase.js;
// both share the same provider code in lib/deepseek.js.
require('dotenv').config();
const express = require('express');
const { generatePhrase, PhraseError } = require('../../../lib/deepseek.js');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));

app.post('/api/generate-phrase', async (request, response) => {
	try {
		response.json({ phrase: await generatePhrase() });
	} catch (error) {
		const status = error instanceof PhraseError ? error.status : 500;
		console.error('generate-phrase failed:', error.message);
		response.status(status).json({ error: error.message });
	}
});

app.listen(port, () => {
	console.log(`Server listening at http://localhost:${port}`);
	console.log('Serving the p5 sketch from the public/ directory.');
});
