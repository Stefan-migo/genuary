#!/usr/bin/env node
// Verifies the gallery is consistent with what is on disk and in git.
//
//   node tools/check-gallery.mjs
//
// Exits 0 when everything holds, 1 with a list of failures on stderr otherwise.

import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { chromeBinary, startStaticServer } from './lib/static-server.mjs';

const run = promisify(execFile);
const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const failures = [];
const checks = [];

function check(name, condition, detail = '') {
	checks.push({ name, ok: Boolean(condition), detail });
	if (!condition) failures.push(detail ? `${name}: ${detail}` : name);
}

async function fileSize(path) {
	const info = await stat(path).catch(() => null);
	return info?.isFile() ? info.size : 0;
}

async function httpStatus(url) {
	try {
		const response = await fetch(url);
		return response.status;
	} catch (error) {
		return `unreachable (${error.message})`;
	}
}

async function main() {
	const data = JSON.parse(await readFile(join(root, 'gallery', 'projects.json'), 'utf8'));
	const projects = data.projects;

	check('projects.json lists projects', projects.length > 0, `${projects.length} entries`);

	const slugs = new Set();
	for (const project of projects) {
		const where = project.slug ?? '(missing slug)';

		check(`entry ${where} has a slug`, Boolean(project.slug));
		check(`entry ${where} slug is unique`, !slugs.has(project.slug), where);
		slugs.add(project.slug);

		check(`entry ${where} has a numeric day`, Number.isInteger(project.day), String(project.day));
		check(`entry ${where} has a prompt`, Boolean(project.prompt?.trim()));
		check(`entry ${where} has a credit`, Boolean(project.credit?.trim()));
		check(
			`entry ${where} points at an index.html`,
			/\/index\.html$/.test(project.path ?? ''),
			String(project.path),
		);

		const pageSize = await fileSize(join(root, project.path ?? ''));
		check(`entry ${where} page exists on disk`, pageSize > 0, project.path);

		const sourceSize = await fileSize(join(root, project.source ?? ''));
		check(`entry ${where} source exists on disk`, sourceSize > 0, project.source);

		const thumbSize = await fileSize(join(root, 'gallery', 'thumbs', `${project.slug}.jpg`));
		check(`entry ${where} thumbnail exists`, thumbSize > 0, `${thumbSize} bytes`);
		check(`entry ${where} thumbnail is not blank`, thumbSize > 1000, `${thumbSize} bytes`);
	}

	const tracked = (await run('git', ['ls-files', '-z'], { cwd: root, maxBuffer: 32 * 1024 * 1024 })).stdout
		.split('\0')
		.filter(Boolean);

	check(
		'no .env file is tracked',
		!tracked.some((path) => /(^|\/)\.env$/.test(path)),
		tracked.filter((path) => /(^|\/)\.env$/.test(path)).join(', '),
	);
	check(
		'no node_modules is tracked',
		!tracked.some((path) => path.includes('node_modules/')),
	);

	const server = await startStaticServer(root);
	try {
		check('gallery data loads over HTTP', (await httpStatus(`${server.origin}/gallery/projects.json`)) === 200);

		for (const project of projects) {
			const status = await httpStatus(`${server.origin}/${project.path}`);
			check(`entry ${project.slug} serves 200`, status === 200, String(status));
		}

		const profile = await mkdtemp(join(tmpdir(), 'genuary-check-'));
		try {
			const { stdout } = await run(
				chromeBinary(),
				[
					'--headless=new',
					'--disable-gpu',
					'--no-sandbox',
					'--mute-audio',
					`--user-data-dir=${profile}`,
					'--virtual-time-budget=12000',
					'--dump-dom',
					`${server.origin}/index.html`,
				],
				{ timeout: 90_000, maxBuffer: 32 * 1024 * 1024 },
			);
			const rendered = stdout.match(/data-slug="/g)?.length ?? 0;
			check(
				'rendered gallery shows one card per project',
				rendered === projects.length,
				`${rendered} cards for ${projects.length} projects`,
			);
		} finally {
			await rm(profile, { recursive: true, force: true });
		}
	} finally {
		await server.close();
	}

	const failed = checks.filter((entry) => !entry.ok);
	for (const entry of failed) console.error(`FAIL ${entry.detail ? `${entry.name} — ${entry.detail}` : entry.name}`);
	console.log(`${checks.length - failed.length}/${checks.length} checks passed`);
	process.exit(failed.length === 0 ? 0 : 1);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
