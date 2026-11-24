// Genuary 2025 · Day 5 — "Isometric Art (No vanishing points)" — rebuilt.
//
// The original drew an isometric relief sampled from a photograph, with a
// swarm of boxes drifting around it. The particles now have a destination: they
// start scattered as warm specks and, in a left-to-right wave, assemble into a
// line of text rendered as fat pixels. The phrase is editable (press C).
//
// Flat 2D on purpose: a legible pixel phrase cannot survive a rotating 15° tilt,
// and thousands of WEBGL boxes per frame is not a phone workload.

const STORAGE_KEY = 'genuary-2025-day5';
const MAX_PIXELS = 4200;

// Free chaos before the phrase starts pulling: without it the piece reads as
// text that happens to move, not as order emerging from noise.
const SCATTER_HOLD = 1.5;

const RASTER_MARGIN = 14;

// A landscape raster on a portrait phone would leave the phrase as a thin band
// in the middle: the raster follows the viewport so the phrase wraps into more,
// shorter lines and the pixels come out bigger.
let rasterW = 560;
let rasterH = 320;

const DEFAULT_TEXT = 'las balas que nos tiraron van a volver';

const STATE = {
	text: DEFAULT_TEXT,
	pixelSize: 4,
};

let particles = [];
let cell = 4;
let formationStart = 0;
let glitches = [];
let reformAt = 0;

function setup() {
	createCanvas(windowWidth, windowHeight);
	pixelDensity(1);
	noStroke();
	textFont('ui-monospace, Menlo, Consolas, monospace');
	configureRaster();
	loadSettings();
	rebuild();
	wirePanel();
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	configureRaster();
	rebuild();
}

function configureRaster() {
	const portrait = height > width * 1.05;
	rasterW = portrait ? 360 : 560;
	rasterH = portrait ? 620 : 320;
}

function draw() {
	background(12, 12, 16);

	const elapsed = (millis() - formationStart) / 1000;

	maybeGlitch();

	for (const particle of particles) {
		particle.update(elapsed);
		particle.display();
	}

	drawGlitches();
}

// ---------------------------------------------------------------- the phrase

function wrapLines(graphics, value, maxWidth) {
	const lines = [];

	for (const paragraph of value.split('\n')) {
		const words = paragraph.split(/\s+/).filter(Boolean);
		if (words.length === 0) {
			lines.push('');
			continue;
		}

		let line = '';
		for (const word of words) {
			const candidate = line ? `${line} ${word}` : word;
			if (line && graphics.textWidth(candidate) > maxWidth) {
				lines.push(line);
				line = word;
			} else {
				line = candidate;
			}
		}
		if (line) lines.push(line);
	}

	return lines;
}

/** Largest font size whose wrapped lines fit inside the raster. */
function fitToRaster(graphics, value) {
	const maxWidth = rasterW - RASTER_MARGIN * 2;
	const maxHeight = rasterH - RASTER_MARGIN * 2;

	for (let size = 96; size >= 9; size -= 2) {
		graphics.textSize(size);
		graphics.textLeading(size * 1.12);
		const lines = wrapLines(graphics, value, maxWidth);
		const widest = lines.reduce((max, line) => Math.max(max, graphics.textWidth(line)), 0);
		if (lines.length * size * 1.12 <= maxHeight && widest <= maxWidth) {
			return { size, lines };
		}
	}

	graphics.textSize(9);
	graphics.textLeading(10);
	return { size: 9, lines: wrapLines(graphics, value, maxWidth) };
}

/**
 * Renders the phrase once into an offscreen raster and reads back the pixels,
 * so the phrase becomes a set of cells that particles can fly to.
 */
function rasterizePhrase(value, step) {
	const graphics = createGraphics(rasterW, rasterH);
	graphics.pixelDensity(1);
	graphics.background(0);
	graphics.fill(255);
	graphics.textAlign(CENTER, CENTER);
	graphics.textFont('ui-monospace, Menlo, Consolas, monospace');

	const { size, lines } = fitToRaster(graphics, value);
	graphics.textSize(size);
	graphics.textLeading(size * 1.12);
	graphics.text(lines.join('\n'), rasterW / 2, rasterH / 2);

	graphics.loadPixels();

	const points = [];
	let minX = Infinity;
	let maxX = -Infinity;
	let minY = Infinity;
	let maxY = -Infinity;

	// A cell counts as ink when any pixel inside its block is bright enough,
	// so thin strokes do not disappear at large pixel sizes.
	for (let y = 0; y < rasterH; y += step) {
		for (let x = 0; x < rasterW; x += step) {
			let ink = 0;
			for (let sy = y; sy < Math.min(y + step, rasterH) && !ink; sy += 1) {
				for (let sx = x; sx < Math.min(x + step, rasterW); sx += 1) {
					if (graphics.pixels[(sy * rasterW + sx) * 4] > 110) {
						ink = 1;
						break;
					}
				}
			}

			if (!ink) continue;

			points.push({ x: x + step / 2, y: y + step / 2 });
			minX = Math.min(minX, x);
			maxX = Math.max(maxX, x);
			minY = Math.min(minY, y);
			maxY = Math.max(maxY, y);
		}
	}

	graphics.remove();

	return { points, minX, maxX, minY, maxY };
}

function buildTargets(value) {
	const clean = value.trim();
	if (!clean) return { targets: [], cell: STATE.pixelSize };

	let step = STATE.pixelSize;
	let raster = rasterizePhrase(clean, step);

	// A long phrase at a small step would mean tens of thousands of rects per
	// frame: grow the pixel until the count is workable, and say so in the panel.
	while (raster.points.length > MAX_PIXELS && step < 14) {
		step += 1;
		raster = rasterizePhrase(clean, step);
	}

	if (raster.points.length === 0) return { targets: [], cell: step };

	const spanW = raster.maxX - raster.minX + step;
	const spanH = raster.maxY - raster.minY + step;
	const scale = Math.min(
		(width * 0.86) / spanW,
		(height * 0.58) / spanH,
	);

	const centerX = raster.minX + spanW / 2;
	const centerY = raster.minY + spanH / 2;

	const targets = raster.points.map((point) => ({
		x: (point.x - centerX) * scale,
		y: (point.y - centerY) * scale,
	}));

	return { targets, cell: step * scale, step };
}

// ---------------------------------------------------------------- particles

class Pixel {
	constructor(target, size) {
		this.home = createVector(target.x + width / 2, target.y + height / 2);
		this.pos = createVector(
			random(-width * 0.4, width * 1.4),
			random(-height * 0.4, height * 1.4),
		);
		this.vel = p5.Vector.random2D().mult(random(3, 13));
		this.cell = size;
		this.seed = random(1000);
		this.ease = 0;
		this.warm = color(255, random(120, 195), random(55, 105));
		this.cool = color(random(140, 200), random(205, 240), 255);

		// A wave from left to right, smeared by randomness, so the phrase does
		// not appear all at once.
		this.delay = SCATTER_HOLD + ((target.x / width) + 0.5) * 0.55 + random(0, 0.95);
	}

	update(elapsed) {
		const t = constrain((elapsed - this.delay) / 2.4, 0, 1);
		this.ease = t * t * (3 - 2 * t);

		// The spring gets stiffer as the particle approaches its place.
		const pull = 0.012 + 0.075 * this.ease;
		this.vel.x += (this.home.x - this.pos.x) * pull;
		this.vel.y += (this.home.y - this.pos.y) * pull;

		const chaos = (1 - this.ease) * 2.4;
		if (chaos > 0.02) {
			this.vel.x += (noise(this.seed, frameCount * 0.008) - 0.5) * chaos;
			this.vel.y += (noise(this.seed + 63, frameCount * 0.008) - 0.5) * chaos;
		}

		this.vel.mult(0.9);
		this.pos.add(this.vel);
	}

	display() {
		// Settled pixels grow to fill their cell so letters read as solid, and
		// keep a slow breath so the phrase is never dead.
		const breath = this.ease > 0.97
			? sin(frameCount * 0.05 + this.seed) * 0.1
			: 0;
		const size = this.cell * (0.4 + 0.72 * this.ease + breath);

		fill(lerpColor(this.warm, this.cool, this.ease));
		rect(this.pos.x - size / 2, this.pos.y - size / 2, size, size);
	}
}

function rebuild() {
	const { targets, cell: worldCell, step } = buildTargets(STATE.text);

	cell = worldCell ?? STATE.pixelSize;
	particles = targets.map((target) => new Pixel(target, cell));
	formationStart = millis();
	glitches = [];

	const count = document.getElementById('count');
	if (count) {
		const grown = step && step > STATE.pixelSize ? ` (pixel grown to ${step} for length)` : '';
		count.textContent = particles.length === 0
			? 'No text to assemble.'
			: `${particles.length} pixels assembled${grown}`;
	}
}

// ------------------------------------------------------------------ glitches

function maybeGlitch() {
	if (random(1) < 0.02) {
		glitches.push({
			x: random(-width * 0.1, width * 0.3),
			y: random(height),
			w: random(width * 0.25, width * 0.9),
			h: random(1.5, 5),
			life: 3 + Math.floor(random(4)),
			warm: random(1) < 0.5,
		});
	}

	glitches = glitches.filter((glitch) => glitch.life > 0);
}

function drawGlitches() {
	for (const glitch of glitches) {
		glitch.life -= 1;
		fill(glitch.warm ? color(255, 58, 72, 190) : color(120, 220, 255, 170));
		rect(glitch.x, glitch.y, glitch.w, glitch.h);
	}
}

// -------------------------------------------------------------------- panel

function loadSettings() {
	try {
		const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
		if (!saved) return;
		if (typeof saved.text === 'string' && saved.text.trim()) STATE.text = saved.text;
		if (Number.isFinite(saved.pixelSize)) STATE.pixelSize = saved.pixelSize;
	} catch {
		// Private mode or a broken value: defaults are fine.
	}
}

function saveSettings() {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE));
	} catch {
		// The piece works without persistence.
	}
}

function wirePanel() {
	const panel = document.getElementById('panel');
	const toggle = document.getElementById('toggle');
	const textInput = document.getElementById('textInput');
	const pixelInput = document.getElementById('pixelSize');
	const pixelOut = document.getElementById('pixelOut');

	const setOpen = (open) => {
		panel.hidden = !open;
		toggle.setAttribute('aria-expanded', String(open));
	};

	toggle.addEventListener('click', () => setOpen(panel.hidden));
	document.getElementById('close').addEventListener('click', () => setOpen(false));

	window.addEventListener('keydown', (event) => {
		const typing = event.target instanceof HTMLElement
			&& event.target.matches('input, textarea');
		if (typing) return;
		if (event.key === 'c' || event.key === 'C') setOpen(panel.hidden);
		if (event.key === 'r' || event.key === 'R') rebuild();
	});

	textInput.value = STATE.text;

	// Rebuild once the typing pauses, so the phrase does not thrash per key.
	textInput.addEventListener('input', () => {
		STATE.text = textInput.value;
		saveSettings();
		clearTimeout(reformAt);
		reformAt = setTimeout(rebuild, 320);
	});

	pixelInput.value = String(STATE.pixelSize);
	pixelOut.textContent = `${STATE.pixelSize}px`;
	pixelInput.addEventListener('input', () => {
		STATE.pixelSize = Number(pixelInput.value);
		pixelOut.textContent = `${STATE.pixelSize}px`;
		saveSettings();
		rebuild();
	});

	document.getElementById('reform').addEventListener('click', () => rebuild());
}
