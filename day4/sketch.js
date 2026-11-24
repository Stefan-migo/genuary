// Genuary 2025 · Day 4 — "Black on black"
//
// Ink streaks, a murmuration and a Game of Life field, drawn in near-black on
// black. Every few glitches the piece burns through to a photograph and a line
// of text, inverts some pixels, and sinks back into the dark. Nothing is ever
// displayed directly: it leaks through the failure.

const REVEAL_EVERY = 3;
const STORAGE_KEY = 'genuary-2025-day4';

const STATE = {
	glitchChance: 0.012,
	density: 1,
	text: '',
};

let boids = [];
let ink = [];
let grid = [];
let nextGrid = [];
let gridSize = 0;
let cellW = 1;
let cellH = 1;

let images = [null, null];
let imageIndex = 0;
let glitchIntensity = 0;
let glitchCount = 0;

function preload() {
	// The second file is spelled "imgae.png" in this repository on purpose.
	images[0] = { img: loadImage('image.jpg') };
	images[1] = { img: loadImage('imgae.png') };
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	// The glitch path reads and writes the whole pixel buffer, so the backing
	// store stays at 1x: on a phone that is the difference between 30 and 8 fps.
	pixelDensity(1);
	noStroke();
	textFont('ui-monospace, Menlo, Consolas, monospace');

	loadSettings();
	buildScene();
	wirePanel();
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	buildScene();
}

function draw() {
	background(0, 15); // semi-transparent, so everything leaves a stain

	for (const particle of ink) {
		particle.update();
		particle.display();
	}

	for (const boid of boids) {
		boid.flock(boids);
		boid.update();
		boid.display();
	}

	stepGameOfLife();
	drawGameOfLife();
	runGlitch();
}

// ---------------------------------------------------------------- scene scale

function densityScale() {
	const reference = 900 * 640;
	return constrain(Math.sqrt((width * height) / reference), 0.5, 2) * STATE.density;
}

function buildScene() {
	gridSize = constrain(Math.round((Math.min(width, height) / 4) * STATE.density), 40, 180);
	cellW = width / gridSize;
	cellH = height / gridSize;

	grid = freshGrid();
	nextGrid = freshGrid();
	randomizeGrid(grid);

	const scale = densityScale();

	boids = [];
	for (let i = 0; i < Math.round(70 * scale); i += 1) {
		boids.push(new Boid(random(width), random(height)));
	}

	ink = [];
	for (let i = 0; i < Math.round(200 * scale); i += 1) {
		ink.push(new InkParticle(random(width), random(height)));
	}
}

// ------------------------------------------------------------------ ink

class InkParticle {
	constructor(x, y) {
		this.pos = createVector(x, y);
		this.vel = p5.Vector.random2D().mult(random(-50, 50));
		this.life = 10;
	}

	update() {
		this.pos.add(this.vel);
		this.life -= 1;
		if (this.life <= 0) {
			this.pos.set(random(width), random(height));
			this.life = 255;
		}
	}

	display() {
		fill(0, this.life);
		ellipse(this.pos.x, this.pos.y, 0.75, 50);
	}
}

// ------------------------------------------------------------------ boids

class Boid {
	constructor(x, y) {
		this.pos = createVector(x, y);
		this.vel = p5.Vector.random2D();
		this.acc = createVector();
		this.maxSpeed = 2;
		this.maxForce = 0.09;
		this.wingAngle = random(PI);
	}

	flock(others) {
		this.acc.add(this.align(others));
		this.acc.add(this.cohere(others));
		this.acc.add(this.separate(others));
	}

	align(others) {
		const perception = 30;
		const steering = createVector();
		let total = 0;
		for (const other of others) {
			const d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
			if (d > 0 && d < perception) {
				steering.add(other.vel);
				total += 1;
			}
		}
		if (total > 0) {
			steering.div(total);
			steering.setMag(this.maxSpeed);
			steering.sub(this.vel);
			steering.limit(this.maxForce);
		}
		return steering;
	}

	cohere(others) {
		const perception = 20;
		const steering = createVector();
		let total = 0;
		for (const other of others) {
			const d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
			if (d > 0 && d < perception) {
				steering.add(other.pos);
				total += 1;
			}
		}
		if (total > 0) {
			steering.div(total);
			steering.sub(this.pos);
			steering.setMag(this.maxSpeed);
			steering.sub(this.vel);
			steering.limit(this.maxForce);
		}
		return steering;
	}

	separate(others) {
		const perception = 25;
		const steering = createVector();
		let total = 0;
		for (const other of others) {
			const d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
			if (d > 0 && d < perception) {
				const diff = p5.Vector.sub(this.pos, other.pos);
				diff.div(d);
				steering.add(diff);
				total += 1;
			}
		}
		if (total > 0) {
			steering.div(total);
			steering.setMag(this.maxSpeed);
			steering.sub(this.vel);
			steering.limit(this.maxForce);
		}
		return steering;
	}

	update() {
		this.pos.add(this.vel);
		this.vel.add(this.acc);
		this.vel.limit(this.maxSpeed);
		this.acc.mult(0);
		this.edges();
		this.wingAngle += 0.1;
	}

	display() {
		push();
		translate(this.pos.x, this.pos.y);
		rotate(this.vel.heading() + HALF_PI * 2);

		fill(255, 150);
		ellipse(0, 0, 30, 2);

		const wingOffset = sin(this.wingAngle) * 10;
		triangle(-7, 0, 0, -10 + wingOffset, 14, 0);
		pop();
	}

	edges() {
		if (this.pos.x > width) this.pos.x = 0;
		if (this.pos.x < 0) this.pos.x = width;
		if (this.pos.y > height) this.pos.y = 0;
		if (this.pos.y < 0) this.pos.y = height;
	}
}

// ------------------------------------------------------- game of life field

function freshGrid() {
	return Array.from({ length: gridSize }, () => new Array(gridSize).fill(0));
}

function randomizeGrid(target) {
	for (let i = 0; i < gridSize; i += 1) {
		for (let j = 0; j < gridSize; j += 1) {
			target[i][j] = floor(random(2));
		}
	}
}

// Two buffers, swapped every generation: the original allocated a fresh 180x180
// array on every frame, which is most of the garbage on a phone.
function stepGameOfLife() {
	for (let i = 0; i < gridSize; i += 1) {
		for (let j = 0; j < gridSize; j += 1) {
			const state = grid[i][j];
			const neighbours = countNeighbours(grid, i, j);
			nextGrid[i][j] = state === 1
				? (neighbours < 2 || neighbours > 3 ? 0 : 1)
				: (neighbours === 3 ? 1 : 0);
		}
	}

	const previous = grid;
	grid = nextGrid;
	nextGrid = previous;
}

function countNeighbours(source, x, y) {
	let sum = 0;
	for (let i = -1; i <= 1; i += 1) {
		for (let j = -1; j <= 1; j += 1) {
			const col = (x + i + gridSize) % gridSize;
			const row = (y + j + gridSize) % gridSize;
			sum += source[col][row];
		}
	}
	return sum - source[x][y];
}

function drawGameOfLife() {
	fill(0, 20);
	for (let i = 0; i < gridSize; i += 1) {
		for (let j = 0; j < gridSize; j += 1) {
			if (grid[i][j] === 1) {
				rect(i * cellW, j * cellH, cellW, cellH);
			}
		}
	}
}

// ------------------------------------------------------------------ glitch

function runGlitch() {
	if (random(1) < STATE.glitchChance) {
		glitchIntensity = random(0.9, 2.4);
		glitchCount += 1;

		// Each reveal is one glitch in REVEAL_EVERY, and it swaps the photograph.
		if (glitchCount >= REVEAL_EVERY) {
			glitchCount = 0;
			imageIndex = 1 - imageIndex;
		}
	}

	if (glitchIntensity <= 0) return;

	if (glitchCount === 0) {
		drawReveal();
		invertPixels();
	}

	glitchIntensity -= 1;
}

function drawReveal() {
	const picture = images[imageIndex]?.img;

	if (picture) {
		drawCover(picture);
	} else {
		background(12);
	}

	if (STATE.text.trim()) drawRevealedText();
}

/** Paints the image over the whole viewport without distorting it. */
function drawCover(picture) {
	const scale = Math.max(width / picture.width, height / picture.height);
	const w = picture.width * scale;
	const h = picture.height * scale;
	image(picture, (width - w) / 2, (height - h) / 2, w, h);
}

function drawRevealedText() {
	const shortest = Math.min(width, height);
	const size = constrain(shortest * 0.075, 15, 68);
	const margin = shortest * 0.1;

	textSize(size);
	textLeading(size * 1.28);
	textAlign(CENTER, CENTER);

	const lines = wrapText(STATE.text.trim(), width - margin * 2);

	// The text lands on an arbitrary photograph, so white-on-white is a real
	// risk. Subtracting instead of painting guarantees contrast: the letters
	// invert whatever they sit on, which also reads as a burn on the frame.
	push();
	blendMode(DIFFERENCE);
	fill(255);
	text(lines.join('\n'), width / 2, height / 2);
	pop();
}

function wrapText(value, maxWidth) {
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
			if (line && textWidth(candidate) > maxWidth) {
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

function invertPixels() {
	loadPixels();
	for (let i = 0; i < pixels.length; i += 16) {
		if (random(1) < 0.1) {
			pixels[i] = 255 - pixels[i];
			pixels[i + 1] = 255 - pixels[i + 2];
			pixels[i + 2] = 255 - pixels[i + 2];
		}
	}
	updatePixels();
}

// ------------------------------------------------------------------- panel

function loadSettings() {
	try {
		const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
		if (!saved) return;
		if (Number.isFinite(saved.glitchChance)) STATE.glitchChance = saved.glitchChance;
		if (Number.isFinite(saved.density)) STATE.density = saved.density;
		if (typeof saved.text === 'string') STATE.text = saved.text;
	} catch {
		// Private mode or a corrupted value: defaults are fine.
	}
}

function saveSettings() {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE));
	} catch {
		// Nothing to do: the piece works without persistence.
	}
}

function bindRange(id, outputId, initial, apply, label) {
	const input = document.getElementById(id);
	const output = document.getElementById(outputId);

	input.value = String(initial);
	output.textContent = label(initial);

	input.addEventListener('input', () => {
		const value = Number(input.value);
		apply(value);
		output.textContent = label(value);
		saveSettings();
	});
}

function wirePanel() {
	const panel = document.getElementById('panel');

	// No visible control: the panel belongs to the piece, not to the picture. It
	// opens with C, and on a touch screen with a long press, since there is no
	// keyboard there.
	const setOpen = (open) => {
		panel.hidden = !open;
	};

	document.getElementById('close').addEventListener('click', () => setOpen(false));

	window.addEventListener('keydown', (event) => {
		const typing = event.target instanceof HTMLElement
			&& event.target.matches('input, textarea');
		if (typing) return;
		if (event.key === 'c' || event.key === 'C') setOpen(panel.hidden);
		if (event.key === 'Escape') setOpen(false);
	});

	let pressTimer = null;
	const startPress = () => {
		clearTimeout(pressTimer);
		pressTimer = setTimeout(() => setOpen(panel.hidden), 550);
	};
	const cancelPress = () => clearTimeout(pressTimer);

	for (const type of ['pointerdown']) {
		window.addEventListener(type, startPress, { passive: true });
	}
	for (const type of ['pointerup', 'pointercancel', 'pointermove']) {
		window.addEventListener(type, cancelPress, { passive: true });
	}

	for (const [index, id] of [[0, 'imageA'], [1, 'imageB']]) {
		document.getElementById(id).addEventListener('change', (event) => {
			const file = event.target.files?.[0];
			if (!file) return;

			const url = URL.createObjectURL(file);
			loadImage(
				url,
				(loaded) => {
					images[index] = { img: loaded };
					URL.revokeObjectURL(url);
				},
				() => URL.revokeObjectURL(url),
			);
		});
	}

	const textInput = document.getElementById('textInput');
	textInput.value = STATE.text;
	textInput.addEventListener('input', () => {
		STATE.text = textInput.value;
		saveSettings();
	});

	bindRange('chance', 'chanceOut', Math.round(STATE.glitchChance * 1000), (value) => {
		STATE.glitchChance = value / 1000;
	}, (value) => `${(value / 10).toFixed(1)}%`);

	bindRange('density', 'densityOut', Math.round(STATE.density * 100), (value) => {
		STATE.density = value / 100;
		buildScene();
	}, (value) => `${value}%`);
}
