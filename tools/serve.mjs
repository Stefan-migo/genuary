#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { startStaticServer } from './lib/static-server.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

try {
	const env = await readFile(join(root, '.env'), 'utf8');
	for (const line of env.split(/\r?\n/)) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;
		const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
		if (!match || process.env[match[1]] !== undefined) continue;
		let value = match[2].trim();
		if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
			value = value.slice(1, -1);
		}
		process.env[match[1]] = value;
	}
} catch (error) {
	if (error.code !== 'ENOENT') throw error;
}

const { default: handler } = await import(pathToFileURL(join(root, 'api', 'generate-phrase.js')).href);
const server = await startStaticServer(root, {
	port: Number(process.env.PORT) || 3000,
	routes: { 'POST /api/generate-phrase': handler },
});

console.log(`Gallery: ${server.origin}/`);
console.log(`Day 23 sketch: ${server.origin}/day23/version%20google/index.html`);
console.log(`DEEPSEEK_API_KEY: ${process.env.DEEPSEEK_API_KEY ? 'set' : 'missing'}`);
