let agents = [];
let gridSize = 10;
let cellSize = 9;
let noiseOffset = 0;
let fractalDepth = 0.0004;
let faceImg;
let brightnessGrid = [];

// Animation variables
let gridRotationSpeed = 1; // Speed of grid rotation oscillation
let gridRotationRange = 45; // Range of grid rotation (in degrees)
let gridMoveSpeed = 10; // Speed of grid movement (front and back)
let gridMoveRange = 100; // Range of grid movement

function preload() {
  faceImg = loadImage('mask.jpg');
}

function setup() {
  createCanvas(600, 600, WEBGL);
  angleMode(DEGREES);
  noStroke();
  frameRate(30);

  // Precompute brightness values
  faceImg.loadPixels();
  for (let x = -width / 2; x < width / 2; x += cellSize) {
    let row = [];
    for (let y = -height / 2; y < height / 2; y += cellSize) {
      let imgX = map(x, -width / 2, width / 2, 0, faceImg.width);
      let imgY = map(y, -height / 2, height / 2, 0, faceImg.height);
      let brightness = faceImg.get(imgX, imgY)[0];
      row.push(brightness);
    }
    brightnessGrid.push(row);
  }

  // Initialize agents with swarm behavior
  for (let i = 0; i < 60; i++) {
    agents.push(new Agent(random(-width / 2, width / 2), random(-height / 2, height / 2)));
  }
}

function draw() {
  background(35);
  orbitControl(); // Allow camera movement
  rotateX(15); // Isometric view

  // Oscillate grid rotation
  let gridRotation = sin(frameCount * gridRotationSpeed) * gridRotationRange;
  rotateY(gridRotation);

  // Animate grid movement (front and back)
  let gridZ = sin(frameCount * gridMoveSpeed * 0.1) * gridMoveRange*0.8;
  translate(0, 0, gridZ);

  // Draw isometric grid
  drawIsometricGrid();

  // Update and display agents
  for (let agent of agents) {
    agent.update();
    agent.display();
  }

  // Add glitch artifacts
  if (frameCount % 10 === 0) {
    addGlitchArtifact();
  }
}

function drawIsometricGrid() {
  push();
  for (let i = 0; i < brightnessGrid.length; i++) {
    for (let j = 0; j < brightnessGrid[i].length; j++) {
      let x = map(i, 0, brightnessGrid.length, -width / 4, width / 4);
      let y = map(j, 0, brightnessGrid[i].length, -height / 4, height / 4);
      let z = map(brightnessGrid[i][j], 0, 255, -150, 50);
      push();
      translate(x, y, z);
      fill(10, 110, 255, 120);
      box(cellSize * 0.19); // Use box instead of sphere
      pop();
    }
  }
  pop();
}

function addGlitchArtifact() {
  let x = random(-width / 2, width / 2);
  let y = random(-height / 2, height / 2);
  let z = random(-100, 100);
  push();
  translate(x, y, z);
  fill(255, 0, 0, 100);
  cone(cellSize * -8);
  pop();
}

class Agent {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(20);
    this.acc = createVector();
    this.size = 5;
    this.color = color(random(200, 255), random(100, 200), random(50, 150));
  }

  update() {
    // Swarm intelligence: follow the grid's noise field
    let angle = noise(this.pos.x * 0.001, this.pos.y * 0.01) * 360;
    this.acc = p5.Vector.fromAngle(radians(angle)).mult(0.1);

    // Apply motion damping
    this.vel.add(this.acc).mult(0.9);
    this.pos.add(this.vel);

    // Wrap edges
    if (this.pos.x < -width / 2) this.pos.x = width / 2;
    if (this.pos.x > width / 2) this.pos.x = -width / 2;
    if (this.pos.y < -height / 2) this.pos.y = height / 2;
    if (this.pos.y > height / 2) this.pos.y = -height / 2;
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y, 0);
    fill(this.color);
    box(this.size);
    pop();
  }
}