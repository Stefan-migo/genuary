import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromeBinary } from './static-server.mjs';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Thumbnails are the artwork itself: the canvas is cropped out of the page so
 * fixed-size sketches do not bring their white margins or GUI panels along.
 * Falls back to the whole viewport when there is nothing worth cropping.
 */
function clipFor(rect, viewport) {
	if (!rect) return null;
	const x = Math.max(0, Math.round(rect.x));
	const y = Math.max(0, Math.round(rect.y));
	const right = Math.min(viewport.width, Math.round(rect.x + rect.width));
	const bottom = Math.min(viewport.height, Math.round(rect.y + rect.height));
	const width = right - x;
	const height = bottom - y;
	if (width < 120 || height < 120) return null;
	return { x, y, width, height, scale: 1 };
}

function waitForDevtools(child, timeoutMs = 30_000) {
	return new Promise((resolve, reject) => {
		let buffer = '';
		const timer = setTimeout(() => reject(new Error('Chrome did not expose a DevTools endpoint')), timeoutMs);

		child.stderr.on('data', (chunk) => {
			buffer += chunk.toString();
			const match = buffer.match(/DevTools listening on (ws:\/\/\S+)/);
			if (match) {
				clearTimeout(timer);
				resolve(match[1]);
			}
		});

		child.once('exit', (code) => {
			clearTimeout(timer);
			reject(new Error(`Chrome exited early with code ${code}`));
		});
	});
}

/**
 * Minimal CDP driver. `--virtual-time-budget` cannot settle pages that decode
 * audio, so the thumbnails are captured on a real timeline instead.
 */
export async function launchChrome({ width = 1200, height = 750 } = {}) {
	const profile = await mkdtemp(join(tmpdir(), 'genuary-cdp-'));
	const child = spawn(
		chromeBinary(),
		[
			'--headless=new',
			'--disable-gpu',
			'--no-sandbox',
			'--hide-scrollbars',
			'--mute-audio',
			'--disable-background-timer-throttling',
			'--disable-renderer-backgrounding',
			'--autoplay-policy=no-user-gesture-required',
			'--use-fake-device-for-media-stream',
			'--use-fake-ui-for-media-stream',
			'--remote-debugging-port=0',
			`--user-data-dir=${profile}`,
			`--window-size=${width},${height}`,
			'about:blank',
		],
		{ stdio: ['ignore', 'ignore', 'pipe'] },
	);

	const url = await waitForDevtools(child);
	const socket = new WebSocket(url);
	await new Promise((resolve, reject) => {
		socket.addEventListener('open', resolve, { once: true });
		socket.addEventListener('error', reject, { once: true });
	});

	let nextId = 0;
	const pending = new Map();
	const listeners = new Map();

	socket.addEventListener('message', (event) => {
		const message = JSON.parse(event.data);
		if (message.id && pending.has(message.id)) {
			const { resolve, reject } = pending.get(message.id);
			pending.delete(message.id);
			if (message.error) {
				reject(new Error(`${message.error.message}${message.error.data ? `: ${message.error.data}` : ''}`));
			} else {
				resolve(message.result);
			}
			return;
		}
		if (message.method && listeners.has(message.method)) {
			for (const listener of listeners.get(message.method)) listener(message.params);
		}
	});

	function send(method, params = {}, sessionId) {
		const id = ++nextId;
		const payload = { id, method, params };
		if (sessionId) payload.sessionId = sessionId;
		socket.send(JSON.stringify(payload));
		return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
	}

	function once(method, timeoutMs = 30_000) {
		return new Promise((resolve, reject) => {
			const timer = setTimeout(() => {
				listeners.get(method)?.delete(handler);
				reject(new Error(`Timed out waiting for ${method}`));
			}, timeoutMs);
			const handler = (params) => {
				clearTimeout(timer);
				listeners.get(method)?.delete(handler);
				resolve(params);
			};
			if (!listeners.has(method)) listeners.set(method, new Set());
			listeners.get(method).add(handler);
		});
	}

	async function canvasRect(sessionId) {
		const { result } = await send('Runtime.evaluate', {
			expression: `(() => {
				const canvas = document.querySelector('canvas');
				if (!canvas) return null;
				canvas.scrollIntoView({ block: 'center', inline: 'center' });
				const rect = canvas.getBoundingClientRect();
				return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
			})()`,
			returnByValue: true,
		}, sessionId);
		return result?.value ?? null;
	}

	async function renderPage(pageUrl, { settleMs, format = 'png', quality, act }) {
		const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
		const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });

		try {
			await send('Page.enable', {}, sessionId);
			await send('Emulation.setDeviceMetricsOverride', {
				width,
				height,
				deviceScaleFactor: 1,
				mobile: false,
			}, sessionId);

			const loaded = once('Page.loadEventFired');
			await send('Page.navigate', { url: pageUrl }, sessionId);
			await loaded.catch(() => undefined);

			if (act) {
				await send('Runtime.evaluate', { expression: act, awaitPromise: true }, sessionId);
			}

			await sleep(settleMs);

			const rect = await canvasRect(sessionId);
			const clip = clipFor(rect, { width, height });
			const shot = { format };
			if (quality !== undefined) shot.quality = quality;
			if (clip) shot.clip = clip;
			const { data } = await send('Page.captureScreenshot', shot, sessionId);
			return Buffer.from(data, 'base64');
		} finally {
			await send('Target.closeTarget', { targetId }).catch(() => undefined);
		}
	}

	async function close() {
		socket.close();
		child.kill('SIGTERM');
		await rm(profile, { recursive: true, force: true }).catch(() => undefined);
	}

	return { renderPage, close };
}
