let palette = ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51'];
let counter = 0;
let fibonacci = [1, 1];

function setup() {
  createCanvas(800, 800);
  background(20);
  noLoop();
  
  // Precompute fibonacci sequence
  for (let i = 2; i < 20; i++) {
    fibonacci[i] = fibonacci[i-1] + fibonacci[i-2];
  }
}

function draw() {
  background(20);
  noStroke();
  
  // Create grid
  translate(width/2, height/2);
  
  // Draw main pattern using L-systems inspired approach
  drawFractalShape(0, 0, 300, 6);
}

function drawFractalShape(x, y, size, depth) {
  if (depth <= 0 || size < 2) return;
  
  counter = (counter + 1) % palette.length;
  fill(palette[counter]);
  
  // Calculate Fibonacci scaling
  let scaleFactor = fibonacci[depth % fibonacci.length] / fibonacci[(depth + 2) % fibonacci.length];
  
  // Draw main shape
  rectMode(CENTER);
  rect(x, y, size, size);
  
  // Draw recursive branches in a square formation
  let newSize = size * scaleFactor;
  let offset = size / 2;
  
  // Top
  drawFractalShape(x, y - offset, newSize, depth - 1);
  
  // Right
  drawFractalShape(x + offset, y, newSize, depth - 1);
  
  // Bottom
  drawFractalShape(x, y + offset, newSize, depth - 1);
  
  // Left
  drawFractalShape(x - offset, y, newSize, depth - 1);
  
  // Diagonal connections with golden ratio
  let goldenRatio = 1.618;
  let diagonalOffset = offset / goldenRatio;
  
  // Top-Right
  drawFractalShape(x + diagonalOffset, y - diagonalOffset, newSize / goldenRatio, depth - 1);
  
  // Bottom-Right
  drawFractalShape(x + diagonalOffset, y + diagonalOffset, newSize / goldenRatio, depth - 1);
  
  // Bottom-Left
  drawFractalShape(x - diagonalOffset, y + diagonalOffset, newSize / goldenRatio, depth - 1);
  
  // Top-Left
  drawFractalShape(x - diagonalOffset, y - diagonalOffset, newSize / goldenRatio, depth - 1);
  
  // Center overlay with different color
  if (depth > 2) {
    counter = (counter + 2) % palette.length;
    fill(palette[counter]);
    let centerSize = size / (fibonacci[depth % fibonacci.length] / fibonacci[(depth-1) % fibonacci.length]);
    rect(x, y, centerSize, centerSize);
  }
}

function mousePressed() {
  // Change color palette on click
  palette = [
    color(90 + (counter * 40) % 150, 40 + (counter * 30) % 100, 100 + (counter * 20) % 150),
    color(140 + (counter * 30) % 100, 90 + (counter * 40) % 150, 40 + (counter * 20) % 150),
    color(40 + (counter * 20) % 150, 90 + (counter * 30) % 100, 140 + (counter * 40) % 150),
    color(180 + (counter * 40) % 70, 100 + (counter * 30) % 150, 50 + (counter * 20) % 150),
    color(70 + (counter * 20) % 150, 180 + (counter * 40) % 70, 120 + (counter * 30) % 150)
  ];
  counter = 0;
  redraw();
}