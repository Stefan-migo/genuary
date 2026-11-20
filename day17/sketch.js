// Genuary Day 17: What happens if pi = 4? - Enhanced Version
// Interactive Morphing: Circles <-> Squares
// - Easing function for smoother morphing.
// - MouseX controls morphing (Circle <-> Square).
// - MouseY controls rotation speed factor.
// - Dynamic Perlin noise background.
// - Variable fill based on morph state.
// - Smoother trails using createGraphics buffer.

let lerpAmount = 0.5; // 0 = Circle, 1 = Square
let rotationFactor = 1.0; // Controlled by mouseY

const numRings = 6;
const shapesPerRing = 15;
const maxRadius = 300; // Increased max radius
const shapeDetail = 60;
const baseShapeRadius = 35;

// Noise parameters for background
let noiseScale = 0.005;
let noiseTime = 0;

// Graphics buffer for trails
let trailsBuffer;

// --- Easing Function (Quadratic In/Out) ---
function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - pow(-2 * t + 2, 2) / 2;
}
// ---------------------------------------

// --- "Pi=4" Trigonometry (Same as before) ---
function getPi4Coords(pseudoAngle, radius) {
    pseudoAngle = pseudoAngle % 8;
    let x, y;
    let r = radius; // Use alias for clarity

    // Map angle to perimeter distance (0 to 8*r)
    let perimeterPos = pseudoAngle * r;

    if (pseudoAngle >= 0 && pseudoAngle < 2) { // Right side: starts at (r, -r), moves to (r, r)
        x = r;
        y = map(pseudoAngle, 0, 2, -r, r);
    } else if (pseudoAngle >= 2 && pseudoAngle < 4) { // Top side: starts at (r, r), moves to (-r, r)
        y = r;
        x = map(pseudoAngle, 2, 4, r, -r);
    } else if (pseudoAngle >= 4 && pseudoAngle < 6) { // Left side: starts at (-r, r), moves to (-r, -r)
        x = -r;
        y = map(pseudoAngle, 4, 6, r, -r);
    } else { // Bottom side: starts at (-r, -r), moves to (r, -r)
        y = -r;
        x = map(pseudoAngle, 6, 8, -r, r);
    }
    return createVector(x, y);
}
// ------------------------------------------

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  angleMode(RADIANS);
  strokeWeight(1.5);
  // Create the buffer for trails
  trailsBuffer = createGraphics(windowWidth, windowHeight);
  trailsBuffer.colorMode(HSB, 360, 100, 100, 100);
  trailsBuffer.background(0); // Initial black background for buffer
}

function draw() {
  // --- Update Parameters ---
  let targetLerpAmount = constrain(map(mouseX, 0, width, 0, 1), 0, 1);
  // Smoothly approach the target lerp amount (optional, adds slight delay)
  lerpAmount = lerp(lerpAmount, targetLerpAmount, 0.1);

  // Use the easing function on the lerpAmount for interpolation
  let easedLerp = easeInOutQuad(lerpAmount);

  // Control rotation speed factor with mouseY (more speed towards the bottom)
  rotationFactor = map(mouseY, 0, height, 0.2, 2.5);

  // --- Draw Dynamic Background (on main canvas) ---
  background(0); // Clear main canvas
  drawNoiseBackground();

  // --- Update and Draw Trails Buffer ---
  // Draw a semi-transparent overlay on the buffer to fade previous frames
  trailsBuffer.background(0, 0, 0, 5); // Black with low alpha

  // --- Draw the morphing shapes (onto the buffer) ---
  trailsBuffer.push(); // Use buffer's coordinate system
  trailsBuffer.translate(width / 2, height / 2);
  trailsBuffer.rotate(frameCount * 0.002 * rotationFactor); // Use rotationFactor

  for (let r = 1; r <= numRings; r++) {
    let ringRadius = map(r, 1, numRings, maxRadius / numRings, maxRadius);
    // Slightly vary shape size with noise for more organic look
    let noiseSizeFactor = map(noise(r * 10, noiseTime * 0.5), 0, 1, 0.8, 1.2);
    let currentShapeRadius = baseShapeRadius * (1.6 - r / numRings) * noiseSizeFactor;

    for (let i = 0; i < shapesPerRing; i++) {
      let angle = map(i, 0, shapesPerRing, 0, TWO_PI);

      let centerX = ringRadius * cos(angle);
      let centerY = ringRadius * sin(angle);

      trailsBuffer.push(); // Isolate transformations for each shape
      trailsBuffer.translate(centerX, centerY);
      // Use rotationFactor for individual shape rotation too
      trailsBuffer.rotate(angle + frameCount * 0.005 * (r % 2 === 0 ? 1 : -1) * rotationFactor);

      // Color and Fill
      let hue = (map(angle, 0, TWO_PI, 0, 360) + frameCount * 0.5) % 360;
      let saturation = 60 + r * 6;
      let brightness = 75 + sin(frameCount * 0.01 + r * 0.5) * 15;
      let strokeAlpha = 90;
      // Fill alpha increases as it becomes more square (easedLerp -> 1)
      let fillAlpha = map(easedLerp, 0, 1, 0, 20);

      trailsBuffer.stroke(hue, saturation, brightness, strokeAlpha);
      trailsBuffer.fill(hue, saturation, brightness, fillAlpha);

      trailsBuffer.beginShape();
      for (let v = 0; v < shapeDetail; v++) {
        let vertexAngle = map(v, 0, shapeDetail, 0, TWO_PI);

        let circleX = currentShapeRadius * cos(vertexAngle);
        let circleY = currentShapeRadius * sin(vertexAngle);

        let pseudoAngle = map(vertexAngle, 0, TWO_PI, 0, 8);
        let pi4Coords = getPi4Coords(pseudoAngle, currentShapeRadius);
        let squareX = pi4Coords.x;
        let squareY = pi4Coords.y;

        // Interpolate using the EASED lerp amount
        let finalX = lerp(circleX, squareX, easedLerp);
        let finalY = lerp(circleY, squareY, easedLerp);

        trailsBuffer.vertex(finalX, finalY);
      }
      trailsBuffer.endShape(CLOSE);

      trailsBuffer.pop(); // Restore previous transformation state
    }
  }
  trailsBuffer.pop(); // Restore buffer's global transformations

  // --- Draw the trails buffer onto the main canvas ---
  image(trailsBuffer, 0, 0);

  // --- Display Info (on main canvas) ---
  fill(255);
  noStroke();
  textSize(16);
  textAlign(CENTER, BOTTOM);
  text(`Genuary 17: PI = 4 Universe | Morph: ${nf(easedLerp, 1, 2)} | RotFactor: ${nf(rotationFactor, 1, 1)}`, width / 2, height - 20);
  textAlign(LEFT, BOTTOM);
  text("MouseX: Circle <-> Square", 20, height - 20);
  textAlign(RIGHT, BOTTOM);
  text("MouseY: Rotation Speed", width - 20, height - 20);

  // Increment noise time for background animation
  noiseTime += 0.005;
}

// --- Helper function for dynamic background ---
function drawNoiseBackground() {
  push();
  noStroke();
  // Draw a grid of rectangles with brightness based on noise
  let step = 20;
  for (let x = 0; x < width; x += step) {
    for (let y = 0; y < height; y += step) {
      let noiseVal = noise(x * noiseScale, y * noiseScale, noiseTime);
      // Map noise to a subtle brightness range (e.g., dark grays)
      let brightness = map(noiseVal, 0, 1, 0, 15);
      // Maybe add a slight hue shift based on noise too
      let hue = map(noiseVal, 0, 1, 200, 260); // Blues/Purples
      fill(hue, 50, brightness, 100); // HSB mode
      rect(x, y, step, step);
    }
  }
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Resize the graphics buffer as well
  trailsBuffer = createGraphics(windowWidth, windowHeight);
  trailsBuffer.colorMode(HSB, 360, 100, 100, 100);
  trailsBuffer.background(0); // Reset buffer background
}