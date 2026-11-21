import { createReadStream } from 'node:fs';
import { Readable } from 'node:stream';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, resolve, sep } from 'node:path';

const CONTENT_TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.mjs': 'text/javascript; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.svg': 'image/svg+xml',
	'.mp3': 'audio/mpeg',
	'.wav': 'audio/wav',
	'.csv': 'text/csv; charset=utf-8',
	'.md': 'text/markdown; charset=utf-8',
	'.frag': 'text/plain; charset=utf-8',
	'.vert': 'text/plain; charset=utf-8',
};

/**
 * Serves `root` on an ephemeral loopback port. Mirrors what a plain
 * `python3 -m http.server` does so headless Chrome can load the sketches
 * without CORS surprises.
 */
export async function startStaticServer(root, { routes = {}, port = 0 } = {}) {
	const base = resolve(root);

	// Method-specific keys win; any other method on the same path still reaches
	// the handler, which is what Vercel does with a function route.
	const byPath = new Map();
	for (const [key, fn] of Object.entries(routes)) {
		byPath.set(key.slice(key.indexOf(' ') + 1), fn);
	}

	const server = createServer(async (request, response) => {
		try {
			const url = new URL(request.url ?? '/', 'http://127.0.0.1');
			const routeKey = `${request.method} ${url.pathname}`;
			const handler = routes[routeKey] ?? byPath.get(url.pathname);

			if (handler) {
				const body = request.method === 'GET' || request.method === 'HEAD'
					? undefined
					: Readable.toWeb(request);
				const webRequest = new Request(`http://127.0.0.1:${server.address().port}${request.url}`, {
					method: request.method,
					headers: request.headers,
					...(body ? { body, duplex: 'half' } : {}),
				});
				const webResponse = await handler(webRequest);
				response.writeHead(webResponse.status, Object.fromEntries(webResponse.headers));
				response.end(Buffer.from(await webResponse.arrayBuffer()));
				return;
			}

			const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '');
			let target = resolve(join(base, relative || 'index.html'));

			if (target !== base && !target.startsWith(base + sep)) {
				response.writeHead(403, { 'content-type': 'text/plain' });
				response.end('forbidden');
				return;
			}

			let info = await stat(target).catch(() => null);
			if (info?.isDirectory()) {
				target = join(target, 'index.html');
				info = await stat(target).catch(() => null);
			}

			if (!info?.isFile()) {
				response.writeHead(404, { 'content-type': 'text/plain' });
				response.end('not found');
				return;
			}

			response.writeHead(200, {
				'content-type': CONTENT_TYPES[extname(target).toLowerCase()] ?? 'application/octet-stream',
				'cache-control': 'no-store',
			});
			createReadStream(target).pipe(response);
		} catch (error) {
			response.writeHead(500, { 'content-type': 'text/plain' });
			response.end(String(error));
		}
	});

	await new Promise((ok, fail) => {
		server.once('error', fail);
		server.listen(port, '127.0.0.1', ok);
	});

	const actualPort = server.address().port;

	return {
		origin: `http://127.0.0.1:${actualPort}`,
		close: () => new Promise((ok) => server.close(ok)),
	};
}

export function chromeBinary() {
	return process.env.CHROME ?? 'google-chrome';
}
