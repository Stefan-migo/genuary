#!/usr/bin/env node
// Captures one static PNG per gallery entry with headless Chrome over CDP.
//
//   node tools/capture-thumbnails.mjs            # every project
//   node tools/capture-thumbnails.mjs day8 day12 # only these slugs
//
// Override the browser with CHROME=/path/to/chrome and the settling time with
// RENDER_MS (real milliseconds given to a sketch after its load event).

import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchChrome } from './lib/cdp.mjs';
import { startStaticServer } from './lib/static-server.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const thumbRoot = join(root, 'gallery', 'thumbs');
const THUMB_EXT = 'jpg';
const THUMB_QUALITY = 86;

const SETTLE_MS = Number(process.env.RENDER_MS ?? 5000);
const WIDTH = 960;
const HEIGHT = 640;

async function main() {
	const data = JSON.parse(await readFile(join(root, 'gallery', 'projects.json'), 'utf8'));
	const wanted = new Set(process.argv.slice(2));
	const projects = wanted.size
		? data.projects.filter((project) => wanted.has(project.slug))
		: data.projects;

	if (projects.length === 0) {
		console.error(`No project matches: ${[...wanted].join(', ')}`);
		process.exit(2);
	}

	await mkdir(thumbRoot, { recursive: true });
	const server = await startStaticServer(root);
	const browser = await launchChrome({ width: WIDTH, height: HEIGHT });
	const failures = [];

	try {
		for (const project of projects) {
			const output = join(thumbRoot, `${project.slug}.${THUMB_EXT}`);
			let lastError = null;

			for (let attempt = 1; attempt <= 2; attempt += 1) {
				try {
					const png = await browser.renderPage(`${server.origin}/${project.path}`, {
						settleMs: SETTLE_MS,
						format: THUMB_EXT === 'jpg' ? 'jpeg' : THUMB_EXT,
						quality: THUMB_QUALITY,
					});
					if (png.length < 1000) throw new Error(`screenshot too small (${png.length} bytes)`);
					await writeFile(output, png);
					lastError = null;
					break;
				} catch (error) {
					lastError = error.message.split('\n')[0];
				}
			}

			if (lastError) {
				failures.push(`${project.slug}: ${lastError}`);
				console.error(`fail ${project.slug} — ${lastError}`);
			} else {
				const { size } = await stat(output);
				console.log(`ok   ${project.slug} (${Math.round(size / 1024)} KB)`);
			}
		}
	} finally {
		await browser.close();
		await server.close();
	}

	if (failures.length > 0) {
		console.error(`\n${failures.length} thumbnail(s) failed:`);
		for (const failure of failures) console.error(`  - ${failure}`);
		process.exit(1);
	}

	console.log(`\n${projects.length} thumbnail(s) written to ${relative(root, thumbRoot)}/`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
