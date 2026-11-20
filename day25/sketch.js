// Genuary Day 25: One line that may or may not intersect itself
// Concept: A noise-guided line that grows, wraps around edges,
//          and dynamically changes color and thickness.

let points = []; // Array to store points of the line
let currentPos; // Current position vector {x, y}
let noiseTimeAngle = 0; // Noise offset for angle
let noiseTimeThickness = 1000; // Noise offset for thickness (start different from angle)
let noiseTimeHue = 2000; // Noise offset for hue shift (start different again)

// --- Parameters to Tune ---
let speed = 10; // How many pixels the line moves per frame
let noiseScaleAngle = 0.35; // How quickly the angle noise changes
let noiseScaleThickness = 0.0002; // How quickly the thickness noise changes
let noiseScaleHue = 0.05; // How quickly the base hue changes
let minThickness = 3; // Minimum line thickness
let maxThickness = 16; // Maximum line thickness
let maxPoints = 4000; // Max number of segments before stopping growth
let baseSaturation = 60; // HSB Saturation (0-100)
let baseBrightness = 100; // HSB Brightness (0-100)
let baseAlpha = 80; // HSB Alpha (0-100) - slight transparency
let backgroundCol = 15; // Dark background HSB Brightness

let currentHue; // Store the hue for smooth transition

// --- Setup ---
function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100); // Hue, Saturation, Brightness, Alpha
  background(0, 0, backgroundCol); // Dark background
  strokeCap(ROUND); // Nicer line endings

  initializeLine(); // Set up the starting point and parameters
}

// --- Initialize or Reset the Line ---
function initializeLine() {
  noiseSeed(millis() + random(10000)); // New random seed each time

  // Start near the center, but with some randomness
  currentPos = {
    x: width / 2 + random(-width * 0.1, width * 0.1),
    y: height / 2 + random(-height * 0.1, height * 0.1)
  };

  points = []; // Clear previous points
  points.push({ ...currentPos }); // Add starting point (create copy)

  // Reset noise time offsets slightly differently each time
  noiseTimeAngle = random(1000);
  noiseTimeThickness = random(1000, 2000);
  noiseTimeHue = random(2000, 3000);

  // Set a random starting hue
  currentHue = random(360);

  background(0, 0, backgroundCol); // Clear canvas for the new line
}

// --- Draw Loop ---
function draw() {
  // --- Update and Add New Point (if maxPoints not reached) ---
  if (points.length < maxPoints) {
    // Calculate angle based on noise
    // Adding currentPos influence makes path slightly position-dependent
    let angleNoise = noise(noiseTimeAngle, currentPos.x * 0.001, currentPos.y * 0.001);
    let angle = map(angleNoise, 0, 1, -TWO_PI, TWO_PI); // Map noise to a full angle range (more chaotic potential)

    // Calculate velocity components
    let vx = cos(angle) * speed;
    let vy = sin(angle) * speed;

    // Update current position
    currentPos.x += vx;
    currentPos.y += vy;

    // --- Boundary Check (Wrap Around) ---
    if (currentPos.x < 0) currentPos.x = width;
    if (currentPos.x > width) currentPos.x = 0;
    if (currentPos.y < 0) currentPos.y = height;
    if (currentPos.y > height) currentPos.y = 0;

    // Add the new point to the array (create a copy)
    points.push({ ...currentPos });

    // Increment noise time offsets
    noiseTimeAngle += noiseScaleAngle;
  } else if (points.length === maxPoints) {
      console.log("Line growth complete.");
      // Optional: could fade out, stop loop, etc.
      // noLoop(); // Uncomment to stop drawing completely once finished
      points.push(null); // Add a marker to prevent this message repeating
  }


  // --- Draw the Line ---
  if (points.length > 1) {
    // We draw the *last* segment added in this frame for efficiency
    // No need to redraw the entire line every frame unless using trails
    let p2 = points[points.length - 1];
    let p1 = points[points.length - 2];

    if (p1 && p2) { // Ensure both points exist (handles start and wrap-around potentially)
      // Calculate dynamic thickness based on noise
      let thicknessNoise = noise(noiseTimeThickness);
      let thickness = map(thicknessNoise, 0, 1, minThickness, maxThickness);
      strokeWeight(thickness);
      noiseTimeThickness += noiseScaleThickness; // Increment thickness noise time

      // Calculate dynamic color (Hue cycles, Sat/Bri/Alpha are fixed)
      // We make the hue shift slowly over the line's length
      let hueNoise = noise(noiseTimeHue);
      // Add a slight shift based on noise for variation, and increment base hue
      currentHue = (currentHue + 0.1 + map(hueNoise, 0, 1, -0.5, 0.5)) % 360;
       if (currentHue < 0) currentHue += 360; // Keep hue positive

      stroke(currentHue, baseSaturation, baseBrightness, baseAlpha);
      noiseTimeHue += noiseScaleHue; // Increment hue noise time


      // Draw the line segment
      // Check for large jumps caused by wrap-around, don't draw across the screen
      let distanceSq = (p1.x - p2.x)**2 + (p1.y - p2.y)**2;
      let maxDistSq = (max(width, height) * 0.5)**2; // Don't draw if jump is too big (half screen width)

      if (distanceSq < maxDistSq) {
          line(p1.x, p1.y, p2.x, p2.y);
      }
    }
  }
}

// --- User Interaction ---
function mousePressed() {
  console.log("Generating new line...");
  initializeLine(); // Reset and draw a new line on mouse click
}

// --- Resize Handling ---
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0, 0, backgroundCol); // Clear background
  // Optional: Could try to rescale points, but easier to just restart
  console.log("Window resized, generating new line...");
  initializeLine();
}

// --- Key Press Handling ---
function keyPressed() {
  if (key === 'r' || key === 'R') {
    console.log("Resetting line...");
    initializeLine(); // Reset and draw a new line on 'R' key press
  }
  if (key === 's' || key === 'S') {
    saveCanvas('line_art', 'png'); // Save the current canvas as a PNG
    console.log("Saved line art as line_art.png");
  }
}