// Genuary 2025 · Day 5 — "Isometric Art (No vanishing points)"
//
// Two layers with different rules in the same WEBGL scene:
//   1. the anonymous face, sampled from mask.jpg and rebuilt as an isometric
//      pixel relief that tilts, breathes and rotates;
//   2. the swarm, which starts as scattered specks and assembles into a phrase
//      made of pixels, on a plane that faces the camera so the text stays read.
// The phrase is editable (press C).

const STORAGE_KEY = 'genuary-2025-day5';
const MAX_PIXELS = 2600;

// Free chaos before the phrase starts pulling: without it the piece reads as
// text that happens to move, not as order emerging from noise.
const SCATTER_HOLD = 2.6;

// Seconds each particle takes to travel to its cell once its turn comes. With
// the wave this puts the full phrase on screen around 9 seconds in.
const FORM_SECONDS = 6.5;

// The phrase is a cloud, not a plane: every pixel keeps its (x, y) cell and
// scatters in z, so it reads from the front and dissolves as you orbit.
const TEXT_DEPTH = 120;

const RASTER_MARGIN = 14;
const DEFAULT_TEXT = 'las balas que nos tiraron van a volver';

// A landscape raster on a portrait phone would leave the phrase as a thin band
// in the middle: the raster follows the viewport so the phrase wraps into more,
// shorter lines and the pixels come out bigger.
let rasterW = 560;
let rasterH = 320;

const STATE = {
	text: DEFAULT_TEXT,
	pixelSize: 4,
};

let faceImg;
let faceGrid = [];
let faceHeight = [];
let faceCell = 16;
let faceSizeW = 0;
let faceSizeH = 0;

let particles = [];
let cell = 4;
let formationStart = 0;
let glitches = [];
let reformAt = 0;
let warm;
let cool;

// front, top and right of every pixel-cube, each with its own shade. Drawn every
// frame from the same camera side, which is enough for the +/-8 degree sway.
const FACES = [
	{
		fill: [12, 120, 255, 128],
		draw: (x, y, z, h, d) => {
			vertex(x - h, y - h, z + d);
			vertex(x + h, y - h, z + d);
			vertex(x + h, y + h, z + d);
			vertex(x - h, y + h, z + d);
		},
	},
	{
		fill: [10, 92, 210, 104],
		draw: (x, y, z, h, d) => {
			vertex(x - h, y - h, z + d);
			vertex(x + h, y - h, z + d);
			vertex(x + h, y - h, z - d);
			vertex(x - h, y - h, z - d);
		},
	},
	{
		fill: [6, 64, 170, 96],
		draw: (x, y, z, h, d) => {
			vertex(x + h, y - h, z + d);
			vertex(x + h, y + h, z + d);
			vertex(x + h, y + h, z - d);
			vertex(x + h, y - h, z - d);
		},
	},
];

function preload() {
	faceImg = loadImage('mask.jpg');
}

function setup() {
	createCanvas(windowWidth, windowHeight, WEBGL);
	pixelDensity(1);
	angleMode(DEGREES);
	noStroke();
	// Measured: 60 raises the desktop from 23 to 27 fps and the phone from 30 to 43.
	frameRate(60);
	textFont('ui-monospace, Menlo, Consolas, monospace');

	warm = color(255, 158, 82);
	cool = color(168, 226, 255);

	configureRaster();
	buildFaceGrid();
	loadSettings();
	rebuild();
	wirePanel();
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	configureRaster();
	buildFaceGrid();
	rebuild();
}

function configureRaster() {
	const portrait = height > width * 1.05;
	rasterW = portrait ? 360 : 560;
	rasterH = portrait ? 620 : 320;
}

function draw() {
	background(35);

	// Orthographic on purpose: under perspective, a pixel at depth z lands off
	// its cell (that is what f / (f - z) means), so the phrase would shred. With
	// no perspective, depth costs nothing in screen position: the phrase reads
	// head-on and still falls apart the moment you orbit the scene.
	ortho();

	const elapsed = (millis() - formationStart) / 1000;

	orbitControl();

	// --- layer 1: the face, in its own tilted space
	push();
	rotateX(15);
	rotateY(sin(frameCount * 0.6) * 8);
	// Pushed back: the phrase, not the relief, owns the camera reference plane.
	const span = Math.min(width, height);
	translate(0, 0, -span * 0.42 + sin(frameCount * 0.8) * span * 0.04);
	drawFace();
	pop();

	if (frameCount % 10 === 0) addGlitchArtifact();

	// --- layer 2: the phrase, on a plane facing the camera
	for (const particle of particles) particle.update(elapsed);

	// Kept at z = 0, the plane the projection was measured on: moving it toward
	// the camera scales the phrase up and pushes it out of frame.
	drawParticles();
}

// --------------------------------------------------------------- the face

/**
 * Bounding box of what is actually drawn in the source image. mask.jpg ships
 * with black margins; sampling the whole file would leave the face as a small
 * blob in the middle of the frame.
 */
function faceBounds() {
	faceImg.loadPixels();
	const step = 3;
	let minX = faceImg.width;
	let maxX = 0;
	let minY = faceImg.height;
	let maxY = 0;

	for (let y = 0; y < faceImg.height; y += step) {
		for (let x = 0; x < faceImg.width; x += step) {
			if (faceImg.pixels[(y * faceImg.width + x) * 4] > 24) {
				minX = Math.min(minX, x);
				maxX = Math.max(maxX, x);
				minY = Math.min(minY, y);
				maxY = Math.max(maxY, y);
			}
		}
	}

	if (maxX <= minX || maxY <= minY) {
		return { x: 0, y: 0, w: faceImg.width, h: faceImg.height };
	}

	return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

function buildFaceGrid() {
	const compact = Math.min(width, height) < 600;

	const bounds = faceBounds();
	const aspect = bounds.w / bounds.h;

	let faceW = Math.min(width * 0.92, height * 0.92 * aspect);
	let faceH = faceW / aspect;
	if (faceH > height * 0.92) {
		faceH = height * 0.92;
		faceW = faceH * aspect;
	}
	faceSizeW = faceW;
	faceSizeH = faceH;

	// Target a cell count rather than a cell size: a phone gets a coarser grid so
	// the relief stays interactive, a desktop gets a denser one. This has to run
	// after the face size is known, or it reads the previous resize.
	const targetCells = compact ? 900 : 2400;
	faceCell = constrain(Math.round(Math.sqrt((faceW * faceH) / targetCells)), compact ? 10 : 8, 30);

	const cols = Math.max(1, Math.round(faceW / faceCell));
	const rows = Math.max(1, Math.round(faceH / faceCell));

	faceGrid = [];

	for (let i = 0; i < cols; i += 1) {
		const row = [];
		for (let j = 0; j < rows; j += 1) {
			const imgX = Math.floor(map(i, 0, cols - 1, bounds.x, bounds.x + bounds.w - 1));
			const imgY = Math.floor(map(j, 0, rows - 1, bounds.y, bounds.y + bounds.h - 1));
			row.push(red(faceImg.get(imgX, imgY)));
		}
		faceGrid.push(row);
	}

	faceHeight = buildHeightField(faceGrid);
}

/**
 * mask.jpg is a flat graphic: white mask, black ground. Reading depth from
 * brightness gives a flat sheet, so the volume comes from a distance field —
 * blur the coverage a few times and the shape inflates towards its centre,
 * like a face pressing through the plane.
 */
function buildHeightField(source) {
	const cols = source.length;
	const rows = source[0].length;
	let field = source.map((row) => row.map((brightness) => (brightness >= 10 ? 1 : 0)));

	for (let pass = 0; pass < 6; pass += 1) {
		const next = field.map((row) => row.slice());
		for (let i = 0; i < cols; i += 1) {
			for (let j = 0; j < rows; j += 1) {
				let sum = 0;
				let count = 0;
				for (let di = -1; di <= 1; di += 1) {
					for (let dj = -1; dj <= 1; dj += 1) {
						const ii = i + di;
						const jj = j + dj;
						if (ii < 0 || jj < 0 || ii >= cols || jj >= rows) continue;
						sum += field[ii][jj];
						count += 1;
					}
				}
				next[i][j] = sum / count;
			}
		}
		field = next;
	}

	// Normalise: the blur leaves the centre below 1, and the rim above 0.
	let peak = 0;
	for (const row of field) for (const value of row) peak = Math.max(peak, value);
	if (peak <= 0) return field;
	return field.map((row) => row.map((value) => value / peak));
}

function drawFace() {
	const cols = faceGrid.length;
	const rows = faceGrid[0].length;
	const stepX = faceSizeW / cols;
	const stepY = faceSizeH / rows;
	const half = Math.min(stepX, stepY) * 0.36;
	// Deeper than wide, so the top and side faces actually read as volume.
	const depth = half * 2.1;
	const relief = Math.min(width, height) * 0.3;

	// Three shaded faces instead of a call to box() per cell: box() pushes a
	// matrix, changes fill and allocates geometry every time, which cost 22 fps
	// on desktop and 12 on a phone for the same picture.
	for (const face of FACES) {
		fill(face.fill);

		beginShape(QUADS);
		for (let i = 0; i < cols; i += 1) {
			for (let j = 0; j < rows; j += 1) {
				const brightness = faceGrid[i][j];
				if (brightness < 10) continue;

				const x = (i + 0.5) * stepX - faceSizeW / 2;
				const y = (j + 0.5) * stepY - faceSizeH / 2;
				const z = faceHeight[i][j] * relief;

				face.draw(x, y, z, half, depth);
			}
		}
		endShape();
	}
}

function addGlitchArtifact() {
	push();
	translate(random(-width / 2, width / 2), random(-height / 2, height / 2), random(-60, 120));
	fill(255, 60, 70, 110);
	cone(faceCell * -6);
	pop();
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

	// A cell counts as ink when any pixel inside its block is bright enough, so
	// thin strokes do not disappear at large pixel sizes.
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
	if (!clean) return { targets: [], cell: STATE.pixelSize, step: STATE.pixelSize };

	let step = STATE.pixelSize;
	let raster = rasterizePhrase(clean, step);

	// A long phrase at a small step would mean tens of thousands of vertices per
	// frame: grow the pixel until the count is workable, and say so in the panel.
	while (raster.points.length > MAX_PIXELS && step < 14) {
		step += 1;
		raster = rasterizePhrase(clean, step);
	}

	if (raster.points.length === 0) return { targets: [], cell: step, step };

	const spanW = raster.maxX - raster.minX + step;
	const spanH = raster.maxY - raster.minY + step;
	const scale = Math.min(
		(width * 0.82) / spanW,
		(height * 0.5) / spanH,
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
		this.home = createVector(target.x, target.y);
		this.pos = createVector(
			random(-width * 0.4, width * 1.4),
			random(-height * 0.4, height * 1.4),
		);
		this.vel = p5.Vector.random2D().mult(random(3, 13));
		this.cell = size;
		this.seed = random(1000);
		this.ease = 0;
		this.z = random(-TEXT_DEPTH, TEXT_DEPTH);

		// A wave from left to right, smeared by randomness, so the phrase does
		// not appear all at once.
		this.delay = SCATTER_HOLD + ((target.x / width) + 0.5) * 1.3 + random(0, 2.4);
	}

	update(elapsed) {
		const t = constrain((elapsed - this.delay) / FORM_SECONDS, 0, 1);
		this.ease = t * t * (3 - 2 * t);

		// The spring gets stiffer as the particle approaches its place.
		const pull = 0.008 + 0.06 * this.ease;
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

	/** Slow drift in depth keeps the cloud alive without breaking the reading. */
	depth() {
		return this.z + sin(frameCount * 0.02 + this.seed) * 7;
	}

	/**
	 * Settled pixels grow slightly past their cell so letters read as solid.
	 * No size variation by depth or by per-particle breathing: both punch holes
	 * in the letterforms, and the depth is already carried by the z positions
	 * themselves plus the occlusion between them.
	 */
	size() {
		return this.cell * (0.45 + 0.7 * this.ease);
	}
}

/**
 * All particles go into one QUADS shape per colour band: thousands of `box()`
 * calls would allocate geometry every frame, one immediate shape does not.
 */
function drawParticles() {
	const bands = 8;
	const groups = Array.from({ length: bands }, () => []);

	for (const particle of particles) {
		const band = Math.min(bands - 1, Math.floor(particle.ease * bands));
		groups[band].push(particle);
	}

	for (let band = 0; band < bands; band += 1) {
		if (groups[band].length === 0) continue;

		fill(lerpColor(warm, cool, (band + 0.5) / bands));
		beginShape(QUADS);

		for (const particle of groups[band]) {
			const half = particle.size() / 2;
			const { x, y } = particle.pos;
			const z = particle.depth();

			vertex(x - half, y - half, z);
			vertex(x + half, y - half, z);
			vertex(x + half, y + half, z);
			vertex(x - half, y + half, z);
		}

		endShape();
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
