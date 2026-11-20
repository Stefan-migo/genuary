// Genuary Day 13: Triangles and nothing else
// Concept: Animated Recursive Triangle Subdivision with Perturbation

let maxDepth = 6; // Recursion depth - careful, exponential growth!
let perturbationAmount = 0.2; // How much subdivision points can move (relative to edge length)
let animationSpeed = 0.005; // How fast the perturbation animates
let baseHue = 0; // Starting hue for colors

let palette = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100); // Hue, Saturation, Brightness, Alpha
  noStroke();
  // frameRate(30); // Optional: cap frame rate if needed

  // Generate a simple analogous color palette
  baseHue = random(360);
  for (let i = 0; i < 5; i++) {
    palette.push((baseHue + i * 15) % 360);
  }

  // Add instructions element
  let instructions = createP('Move mouse to change perturbation amount');
  instructions.style('color', 'white');
  instructions.style('position', 'absolute');
  instructions.style('bottom', '10px');
  instructions.style('left', '10px');
  instructions.style('font-family', 'sans-serif');
  instructions.style('font-size', '14px');
}

function draw() {
  background(0, 0, 10); // Dark background

  // Adjust perturbation based on mouseX
  perturbationAmount = map(mouseX, 0, width, 0.01, 0.45, true);

  // Define the vertices of the initial large triangle(s)
  // Let's start with one large one fitting the screen nicely
  let margin = 50;
  let topY = margin;
  let bottomY = height - margin;
  let topX = width / 2;
  let leftX = margin;
  let rightX = width - margin;

  // Add another mirrored one for more complexity
  let midY = height / 2;
  let midX = width / 2;

  // Calculate a time-based offset for coherent noise/perturbation
  let time = millis() * animationSpeed;

  // Start the recursive subdivision for the first triangle
  subdivideTriangle(
    leftX, bottomY,
    topX, topY,
    rightX, bottomY,
    0, // current depth
    time
  );

   // Maybe add a second inverted one? Or leave it simpler? Let's start with one.
   // subdivideTriangle(
   //   leftX, topY,
   //   midX, bottomY,
   //   rightX, topY,
   //   0, time + 100 // Offset time slightly for variation
   // );

}

function subdivideTriangle(x1, y1, x2, y2, x3, y3, depth, time) {
  // Base Case: Stop recursion if max depth is reached
  if (depth >= maxDepth) {
    // Draw the final triangle
    // Color based on depth and maybe position/angle?
    let hueIndex = depth % palette.length;
    let triCenterX = (x1 + x2 + x3) / 3;
    let triCenterY = (y1 + y2 + y3) / 3;

    // Use palette hue, vary saturation/brightness slightly based on position/time
    let h = palette[hueIndex];
    let s = map(triCenterY, 0, height, 60, 100); // Saturation based on Y
    let b = map(triCenterX, 0, width, 70, 100); // Brightness based on X
    let a = 90; // Slightly transparent

    fill(h, s, b, a);
    triangle(x1, y1, x2, y2, x3, y3);
    return;
  }

  // --- Recursive Step ---

  // Calculate edge midpoints
  let m12x = (x1 + x2) / 2;
  let m12y = (y1 + y2) / 2;
  let m23x = (x2 + x3) / 2;
  let m23y = (y2 + y3) / 2;
  let m31x = (x3 + x1) / 2;
  let m31y = (y3 + y1) / 2;

  // Calculate edge lengths (or squared lengths for efficiency)
  let len12 = dist(x1, y1, x2, y2);
  let len23 = dist(x2, y2, x3, y3);
  let len31 = dist(x3, y3, x1, y1);

  // Add perturbation, scaled by edge length and noise
  // Use noise for smoother, more organic movement
  // Use different noise coordinates for each midpoint and axis
  let pAmount = perturbationAmount;
  let noiseFactor = 0.5; // Noise contributes this much to the offset direction

  m12x += map(noise(time + depth * 10, 10), 0, 1, -1, 1) * len12 * pAmount * noiseFactor;
  m12y += map(noise(time + depth * 10, 20), 0, 1, -1, 1) * len12 * pAmount * noiseFactor;

  m23x += map(noise(time + depth * 10, 30), 0, 1, -1, 1) * len23 * pAmount * noiseFactor;
  m23y += map(noise(time + depth * 10, 40), 0, 1, -1, 1) * len23 * pAmount * noiseFactor;

  m31x += map(noise(time + depth * 10, 50), 0, 1, -1, 1) * len31 * pAmount * noiseFactor;
  m31y += map(noise(time + depth * 10, 60), 0, 1, -1, 1) * len31 * pAmount * noiseFactor;

  // Recursively call subdivide for the 4 new triangles
  // (Similar to Sierpinski, but we draw all 4, not omitting the middle one)
  let nextDepth = depth + 1;
  subdivideTriangle(x1, y1, m12x, m12y, m31x, m31y, nextDepth, time); // Top/Left
  subdivideTriangle(m12x, m12y, x2, y2, m23x, m23y, nextDepth, time); // Right
  subdivideTriangle(m31x, m31y, m23x, m23y, x3, y3, nextDepth, time); // Bottom
  subdivideTriangle(m12x, m12y, m23x, m23y, m31x, m31y, nextDepth, time); // Middle
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // You might want to recalculate initial triangle vertices here if needed
}

// Optional: Press 's' to save a high-res frame
function keyPressed() {
  if (key === 's' || key === 'S') {
    // Temporarily increase resolution for saving
    let scaleFactor = 2; // Adjust for desired resolution
    let highResCanvas = createGraphics(width * scaleFactor, height * scaleFactor);
    highResCanvas.colorMode(HSB, 360, 100, 100, 100);
    highResCanvas.noStroke();
    highResCanvas.background(0, 0, 10);

    // Redraw on the high-res canvas (need to scale vertices)
    let margin = 50 * scaleFactor;
    let topY = margin;
    let bottomY = highResCanvas.height - margin;
    let topX = highResCanvas.width / 2;
    let leftX = margin;
    let rightX = highResCanvas.width - margin;
    let time = millis() * animationSpeed; // Use same time

    // Need a separate function or modify subdivideTriangle to draw on a specific graphics buffer
    // For simplicity here, let's just save the current low-res frame
    saveCanvas('genuary13_triangles_snapshot.png');
    // To properly save high-res, you'd need to refactor drawing logic slightly
    // to accept a graphics object (highResCanvas) and scale all coordinates.
  }
}