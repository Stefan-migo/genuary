let boids = [];
let gameOfLifeGrid;
let gridSize = 150;
let glitchIntensity = 0.03;
let inkParticles = [];
let bgImage1, bgImage2; // Variables to store the background images
let currentImageIndex = 0; // Track which image to display
let glitchCounter = 0; // Track how many glitches have occurred

function preload() {
  // Load the background images (replace 'image.jpg' and 'imgae.png' with your image files)
  bgImage1 = loadImage('image.jpg');
  bgImage2 = loadImage('imgae.png');
}

function setup() {
  createCanvas(600, 600);
  background(0);
  noStroke();

  // Initialize Boids (more for murmuration effect)
  for (let i = 0; i < 70; i++) { // Increased number of boids
    boids.push(new Boid(random(width), random(height)));
  }

  // Initialize Game of Life Grid
  gameOfLifeGrid = createGrid(gridSize);
  randomizeGrid(gameOfLifeGrid);

  // Initialize Ink Particles
  for (let i = 0; i < 200; i++) {
    inkParticles.push(new InkParticle(random(width), random(height)));
  }
}

function draw() {
  background(0, 15); // Semi-transparent background for "ink bleed" effect

  // Update and display ink particles
  for (let ink of inkParticles) {
    ink.update();
    ink.display();
  }

  // Update and display Boids
  for (let boid of boids) {
    boid.flock(boids);
    boid.update();
    boid.display();
  }

  // Update and display Game of Life
  updateGameOfLife();
  displayGameOfLife();

  // Add glitch effect
  applyGlitch();
}

// Ink Particle Class
class InkParticle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(50, -50));
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

// Boid Class (Murmuration Behavior)
class Boid {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D();
    this.acc = createVector();
    this.maxSpeed = 2; // Slower speed for smoother movement
    this.maxForce = 0.09; // Smoother steering
    this.wingAngle = random(PI); // For flapping effect
  }

  flock(boids) {
    let alignment = this.align(boids);
    let cohesion = this.cohere(boids);
    let separation = this.separate(boids);

    // Apply forces
    this.acc.add(alignment);
    this.acc.add(cohesion);
    this.acc.add(separation);
  }

  align(boids) {
    let perception = 30; // Larger perception for smoother group movement
    let steering = createVector();
    let total = 0;
    for (let other of boids) {
      let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
      if (d > 0 && d < perception) {
        steering.add(other.vel);
        total++;
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

  cohere(boids) {
    let perception = 20; // Larger perception for cohesive groups
    let steering = createVector();
    let total = 0;
    for (let other of boids) {
      let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
      if (d > 0 && d < perception) {
        steering.add(other.pos);
        total++;
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

  separate(boids) {
    let perception = 25; // Smaller perception for avoiding collisions
    let steering = createVector();
    let total = 0;
    for (let other of boids) {
      let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
      if (d > 0 && d < perception) {
        let diff = p5.Vector.sub(this.pos, other.pos);
        diff.div(d);
        steering.add(diff);
        total++;
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

    // Simulate flapping wings
    this.wingAngle += 0.1;
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading() + HALF_PI * 2); // Orient the boid in the direction of movement

    // Draw bird-like shape with flapping wings
    fill(255, 150);
    noStroke();
    ellipse(0, 0, 30, 2); // Body
    let wingOffset = sin(this.wingAngle) * 10; // Flapping effect
    triangle(-7, 0, 0, -10 + wingOffset, 14, 0); // Wings
    pop();
  }

  edges() {
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.y > height) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = height;
  }
}

// Game of Life Functions
function createGrid(size) {
  let grid = new Array(size);
  for (let i = 0; i < size; i++) {
    grid[i] = new Array(size);
  }
  return grid;
}

function randomizeGrid(grid) {
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      grid[i][j] = floor(random(2));
    }
  }
}

function updateGameOfLife() {
  let nextGrid = createGrid(gridSize);
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      let state = gameOfLifeGrid[i][j];
      let neighbors = countNeighbors(gameOfLifeGrid, i, j);
      if (state == 0 && neighbors == 3) {
        nextGrid[i][j] = 1;
      } else if (state == 1 && (neighbors < 2 || neighbors > 3)) {
        nextGrid[i][j] = 0;
      } else {
        nextGrid[i][j] = state;
      }
    }
  }
  gameOfLifeGrid = nextGrid;
}

function countNeighbors(grid, x, y) {
  let sum = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      let col = (x + i + gridSize) % gridSize;
      let row = (y + j + gridSize) % gridSize;
      sum += grid[col][row];
    }
  }
  sum -= grid[x][y];
  return sum;
}

function displayGameOfLife() {
  let cellSize = width / gridSize;
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (gameOfLifeGrid[i][j] == 1) {
        fill(0, 20);
        rect(i * cellSize, j * cellSize, cellSize, cellSize);
      }
    }
  }
}

// Glitch Effect
function applyGlitch() {
  if (random(1) < 0.01) {
    glitchIntensity = random(2, 0.9);

    // Increment glitch counter
    glitchCounter++;

    // On the 4th glitch, display an image and reset the counter
    if (glitchCounter >= 3) {
      glitchCounter = 0; // Reset the counter
      currentImageIndex = 1 - currentImageIndex; // Toggle between 0 and 1
    }
  }

  if (glitchIntensity > 0) {
    // Display the active image only on the 4th glitch
    if (glitchCounter === 0) {
      if (currentImageIndex === 0) {
        image(bgImage1, 0, 0, width, height);
      } else {
        image(bgImage2, 0, 0, width, height);
      }
    }

    // Apply pixel glitch effect
    loadPixels();
    for (let i = 0; i < pixels.length; i += 16) {
      if (random(1) < 0.1) {
        pixels[i] = 255 - pixels[i]; // Red channel
        pixels[i + 1] = 255 - pixels[i + 2]; // Green channel
        pixels[i + 2] = 255 - pixels[i + 2]; // Blue channel
      }
    }
    updatePixels();
    glitchIntensity--;
  }
}