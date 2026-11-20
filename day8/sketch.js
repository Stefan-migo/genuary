let points = [];
let t = 0; // Time variable for animation

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  colorMode(HSB, 360, 100, 100, 100);
  noStroke();
  noLoop(); // We will manually refresh frames
}

function draw() {
  background(0);
  loadPixels();
  
  let goldenAngle = radians(137.5) + sin(t) * 0.1; // Slight rotation over time
  let c = 2.5 + sin(t * 0.5) * 0.5; // Breathing effect in radius

  points = []; // Clear and recalculate points each frame
  for (let i = 0; i < 100000; i++) {
    let angle = i % 2 === 0 ? i * goldenAngle : i * (goldenAngle + radians(10));
    let noiseFactor = map(noise(i * 0.001, t * 0.01), 0, 1, 0.8, 1.2); // Dynamic noise
    let r = c * sqrt(i) * noiseFactor;
    let x = width / 2 + r * cos(angle);
    let y = height / 2 + r * sin(angle);
    let hueVal = (degrees(angle) + t * 5) % 360; // Color shift
    let col = color(hueVal, 80, 100, 100);
    points.push({ x, y, col });
  }

  for (let i = 0; i < points.length; i++) {
    let x = floor(points[i].x);
    let y = floor(points[i].y);
    if (x < 0 || x >= width || y < 0 || y >= height) continue;

    let index = 4 * (x + y * width);
    let col = points[i].col;
    pixels[index] = red(col);
    pixels[index + 1] = green(col);
    pixels[index + 2] = blue(col);
    pixels[index + 3] = alpha(col);
  }

  updatePixels();
  t += 0.001; // Increment time variable
  requestAnimationFrame(draw); // Keep animating
}
