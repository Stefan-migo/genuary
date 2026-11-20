const DATA_URL = 'gallery/projects.json';
const THUMB_DIR = 'gallery/thumbs/';

const grid = document.getElementById('grid');
const statusEl = document.getElementById('status');
const statsEl = document.getElementById('stats');
const viewer = document.getElementById('viewer');
const viewerStage = document.getElementById('viewerStage');
const viewerDay = document.getElementById('viewerDay');
const viewerPrompt = document.getElementById('viewerPrompt');
const viewerOpen = document.getElementById('viewerOpen');
const viewerSource = document.getElementById('viewerSource');
const viewerClose = document.getElementById('viewerClose');

/** Stable, pleasant accent per prompt day. */
function hueFor(day) {
	return (day * 47) % 360;
}

function labelFor(project) {
	const day = String(project.day).padStart(2, '0');
	return project.variant ? `Day ${day} · ${project.variant}` : `Day ${day}`;
}

function buildCard(project) {
	const card = document.createElement('article');
	card.className = 'card';
	card.dataset.slug = project.slug;
	card.style.setProperty('--hue', String(hueFor(project.day)));

	const media = document.createElement('button');
	media.type = 'button';
	media.className = 'card__media';
	media.setAttribute('aria-label', `Run sketch: ${project.prompt}`);

	const img = document.createElement('img');
	img.src = `${THUMB_DIR}${project.slug}.jpg`;
	img.alt = `Preview of the day ${project.day} sketch`;
	img.loading = 'lazy';
	img.decoding = 'async';
	media.append(img);

	const dayBadge = document.createElement('span');
	dayBadge.className = 'card__day';
	dayBadge.textContent = labelFor(project);
	media.append(dayBadge);

	media.addEventListener('click', () => openViewer(project));

	const body = document.createElement('div');
	body.className = 'card__body';

	const prompt = document.createElement('p');
	prompt.className = 'card__prompt';
	prompt.textContent = project.prompt;
	body.append(prompt);

	const credit = document.createElement('p');
	credit.className = 'card__credit';
	credit.textContent = `Prompt by ${project.credit}`;
	body.append(credit);

	if (project.note) {
		const note = document.createElement('p');
		note.className = 'card__note';
		note.textContent = project.note;
		body.append(note);
	}

	if (project.tags?.length) {
		const tags = document.createElement('ul');
		tags.className = 'tags';
		for (const tag of project.tags) {
			const item = document.createElement('li');
			item.textContent = tag;
			tags.append(item);
		}
		body.append(tags);
	}

	const actions = document.createElement('div');
	actions.className = 'card__actions';

	const run = document.createElement('button');
	run.type = 'button';
	run.className = 'btn btn--primary';
	run.textContent = 'Run';
	run.addEventListener('click', () => openViewer(project));

	const source = document.createElement('a');
	source.className = 'btn';
	source.href = project.source;
	source.target = '_blank';
	source.rel = 'noopener';
	source.textContent = 'Source';

	actions.append(run, source);
	body.append(actions);

	card.append(media, body);
	return card;
}

function openViewer(project) {
	viewerDay.textContent = labelFor(project);
	viewerPrompt.textContent = project.prompt;
	viewerOpen.href = project.path;
	viewerSource.href = project.source;

	const frame = document.createElement('iframe');
	frame.src = project.path;
	frame.title = `Day ${project.day}: ${project.prompt}`;
	frame.allow = 'microphone; autoplay; fullscreen; clipboard-write; xr-spatial-tracking';

	viewerStage.replaceChildren(frame);
	viewer.hidden = false;
	document.body.classList.add('is-locked');
	viewerClose.focus();
}

function closeViewer() {
	viewer.hidden = true;
	viewerStage.replaceChildren();
	document.body.classList.remove('is-locked');
}

viewerClose.addEventListener('click', closeViewer);

document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape' && !viewer.hidden) {
		closeViewer();
	}
});

function renderStats(projects) {
	const days = new Set(projects.map((project) => project.day));
	const alternates = projects.filter((project) => project.variant).length;
	const stats = document.createElement('span');
	stats.innerHTML =
		`<strong>${projects.length}</strong> sketches · ` +
		`<strong>${days.size}</strong> prompts · ` +
		`<strong>${alternates}</strong> alternate takes`;
	statsEl.replaceWith(stats);
	stats.id = 'stats';
}

async function main() {
	let data;
	try {
		const response = await fetch(DATA_URL);
		if (!response.ok) {
			throw new Error(`${response.status} ${response.statusText}`);
		}
		data = await response.json();
	} catch (error) {
		statusEl.textContent =
			`Could not load ${DATA_URL} (${error.message}). ` +
			'Serve the folder over HTTP, for example: python3 -m http.server 8000';
		statusEl.dataset.tone = 'error';
		statsEl.textContent = 'Collection unavailable';
		return;
	}

	const projects = [...data.projects].sort(
		(a, b) => a.day - b.day || String(a.variant ?? '').localeCompare(String(b.variant ?? '')),
	);

	const fragment = document.createDocumentFragment();
	for (const project of projects) {
		fragment.append(buildCard(project));
	}

	grid.append(fragment);
	statusEl.remove();
	renderStats(projects);
}

main();
