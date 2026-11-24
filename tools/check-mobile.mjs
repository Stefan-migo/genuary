#!/usr/bin/env node
// Renders every gallery entry in a phone viewport and asserts that it fits.
//
//   node tools/check-mobile.mjs                 # every entry
//   node tools/check-mobile.mjs day4 day26      # only these slugs
//   PHONE=430x932 node tools/check-mobile.mjs   # a different phone
//
// What "correct on mobile" means here, and nothing more:
//   1. the page declares a viewport meta, so the phone does not fall back to a
//      ~980px virtual width and shrink everything;
//   2. nothing overflows horizontally;
//   3. the canvas, when there is one, fits inside the viewport both ways.
//
// A piece may still be ugly on a phone; this refuses to call it broken layout.

import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchChrome } from './lib/cdp.mjs';
import { startStaticServer } from './lib/static-server.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const [phoneWidth, phoneHeight] = (process.env.PHONE ?? '390x844')
	.toLowerCase()
	.split('x')
	.map(Number);

const MEASURE = `(async () => {
	for (let i = 0; i < 160 && !document.querySelector('canvas'); i += 1) {
		await new Promise((done) => setTimeout(done, 50));
	}
	const meta = document.querySelector('meta[name="viewport"]');
	const canvas = document.querySelector('canvas');
	const rect = canvas ? canvas.getBoundingClientRect() : null;
	return JSON.stringify({
		viewportMeta: meta ? meta.getAttribute('content') : null,
		clientWidth: document.documentElement.clientWidth,
		scrollWidth: document.documentElement.scrollWidth,
		innerWidth: window.innerWidth,
		innerHeight: window.innerHeight,
		canvas: rect ? {
			x: Math.round(rect.x), y: Math.round(rect.y),
			width: Math.round(rect.width), height: Math.round(rect.height),
			right: Math.round(rect.right), bottom: Math.round(rect.bottom),
		} : null,
	});
})()`;

async function main() {
	const data = JSON.parse(await readFile(join(root, 'gallery', 'projects.json'), 'utf8'));
	const wanted = new Set(process.argv.slice(2));
	const projects = wanted.size
		? data.projects.filter((project) => wanted.has(project.slug))
		: data.projects;

	const server = await startStaticServer(root);
	const browser = await launchChrome({ width: phoneWidth, height: phoneHeight });
	const failures = [];

	try {
		for (const project of projects) {
			let metrics;
			let reason = null;

			try {
				const png = await browser.renderPage(`${server.origin}/${project.path}`, {
					settleMs: 900,
					mobile: true,
					act: MEASURE,
				});
				metrics = JSON.parse(png.actValue);
			} catch (error) {
				reason = `page did not render (${error.message.split('\n')[0]})`;
			}

			if (!reason && metrics) {
				const problems = [];

				if (!metrics.viewportMeta) {
					problems.push('no viewport meta');
				}
				if (metrics.clientWidth > phoneWidth * 1.2) {
					problems.push(`layout width ${metrics.clientWidth} (expected ~${phoneWidth})`);
				}
				if (metrics.scrollWidth > metrics.clientWidth + 1) {
					problems.push(`horizontal overflow ${metrics.scrollWidth} > ${metrics.clientWidth}`);
				}
				if (!metrics.canvas) {
					problems.push('no canvas found');
				} else {
					const { canvas } = metrics;
					if (canvas.width < 120 || canvas.height < 120) {
						problems.push(`canvas too small ${canvas.width}x${canvas.height}`);
					}
					if (canvas.x < -1 || canvas.y < -1) {
						problems.push(`canvas starts off-screen at ${canvas.x},${canvas.y}`);
					}
					if (canvas.right > phoneWidth + 1 || canvas.bottom > phoneHeight + 1) {
						problems.push(
							`canvas ${canvas.width}x${canvas.height} at ${canvas.x},${canvas.y} exceeds ${phoneWidth}x${phoneHeight}`,
						);
					}
				}

				if (problems.length > 0) reason = problems.join(' · ');
			}

			if (reason) {
				failures.push(`${project.slug}: ${reason}`);
				console.error(`fail ${project.slug} — ${reason}`);
			} else {
				const { canvas } = metrics;
				console.log(
					`ok   ${project.slug} (canvas ${canvas.width}x${canvas.height} at ${canvas.x},${canvas.y})`,
				);
			}
		}
	} finally {
		await browser.close();
		await server.close();
	}

	console.log(`\n${projects.length - failures.length}/${projects.length} entries fit a ${phoneWidth}x${phoneHeight} phone`);
	process.exit(failures.length === 0 ? 0 : 1);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
