// Genuary 2024 Day 19: Op Art
// Concept: Interfering Rotating Grids with Mouse Interaction

let angle1 = 0;
let angle2 = 0;
let rotationSpeed1 = 0.0003;
let rotationSpeed2 = -0.0005; // Rotate in opposite direction

let gridSize = 10; // Size of the grid cells
let lineWeight = 1.5; // Stroke weight for the grid lines

// Color Palette (Classic Op Art Black & White)
let bgColor;
let lineCol1;
let lineCol2;

// Mouse influence parameters
let mouseInfluence = 0.1; // How much mouse affects rotation speed
let mouseDamp = 0.005; // Damping factor for smooth mouse follow

// Target mouse influence values (for smoothing)
let targetInfluenceX = 0;
let targetInfluenceY = 0;
let currentInfluenceX = 0;
let currentInfluenceY = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  bgColor = color(255); // White background
  lineCol1 = color(0, 200); // Black with some transparency
  lineCol2 = color(0, 150); // Slightly more transparent black

  // Optional: Set HSB mode if you want to experiment with colors later
  // colorMode(HSB, 360, 100, 100, 100);
  // bgColor = color(0, 0, 100); // White in HSB
  // lineCol1 = color(0, 0, 0, 80); // Blackish in HSB
  // lineCol2 = color(0, 0, 10, 60); // Dark Grayish in HSB
}

function draw() {
  background(bgColor);
  translate(width / 2, height / 2); // Center the coordinate system

  // --- Mouse Interaction ---
  // Map mouse position to a range (-1 to 1) relative to center
  targetInfluenceX = map(mouseX, 0, width, -1, 1);
  targetInfluenceY = map(mouseY, 0, height, -1, 1);

  // Smoothly interpolate current influence towards target
  currentInfluenceX += (targetInfluenceX - currentInfluenceX) * mouseDamp;
  currentInfluenceY += (targetInfluenceY - currentInfluenceY) * mouseDamp;

  // Apply mouse influence to rotation speeds
  let dynamicSpeed1 = rotationSpeed1 + currentInfluenceX * mouseInfluence;
  let dynamicSpeed2 = rotationSpeed2 + currentInfluenceY * mouseInfluence; // Use Y influence for the second grid

  // --- Draw Grid 1 ---
  push(); // Isolate transformations for grid 1
  rotate(angle1);
  stroke(lineCol1);
  strokeWeight(lineWeight);
  drawGrid(max(width, height) * 1.5); // Draw grid larger than canvas to cover corners when rotated
  pop(); // Restore previous transformation state

  // --- Draw Grid 2 ---
  push(); // Isolate transformations for grid 2
  rotate(angle2);
  stroke(lineCol2);
  strokeWeight(lineWeight * 0.8); // Slightly thinner lines for the second grid
  drawGrid(max(width, height) * 1.5);
  pop(); // Restore previous transformation state

  // Update angles for the next frame
  angle1 += dynamicSpeed1;
  angle2 += dynamicSpeed2;
}

// Function to draw a grid centered at (0,0)
function drawGrid(diameter) {
  let maxDist = diameter / 2;

  // Draw vertical lines
  for (let x = -maxDist; x <= maxDist; x += gridSize) {
    // Optional: Modulate stroke weight or alpha based on distance from center?
    let d = abs(x);
    let alpha = map(d, 0, maxDist, 255, 50);
    stroke(red(lineCol1), green(lineCol1), blue(lineCol1), alpha);
    line(x, -maxDist, x, maxDist);
  }

  // Draw horizontal lines
  for (let y = -maxDist; y <= maxDist; y += gridSize) {
    line(-maxDist, y, maxDist, y);
  }
}

// Adjust canvas size when window is resized
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}