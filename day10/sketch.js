// Genuary 2024 - Day 10: TAU Only (Option 2)
// Concept: TAU-Driven Noise Field Particles

// Strictly use TAU. Derive all other numbers.
// Assume p5.js variables (width, height, frameCount) and functions are allowed.

let zero, one, two, half, quarter, medium, large;
let particles = [];
let numParticles;
let gridResolution;
let noiseScale;
let timeIncrement;
let stepSize;

function setup() {
  createCanvas(windowWidth, windowHeight);

  // --- Derive necessary values from TAU ---
  zero = TAU - TAU;                       // 0
  one = TAU / TAU;                        // 1
  two = one + one;                        // 2
  half = one / two;                       // 0.5
  quarter = one / (two + two);            // 0.25
  let eight = (two + two) + (two + two);  // 8
  medium = TAU * TAU;                     // ~39.47
  large = medium * TAU;                   // ~248.05

  // --- Sketch-specific TAU derivations ---
  numParticles = floor(large * large/20);                    // Number of particles ~248
  gridResolution = floor(TAU);              // Implicit grid divisions ~12x12
  noiseScale = one / medium * 4;                      // Scale for noise input coordinates (~1/39)
  timeIncrement = one / large / two / 4;             // Slow time progression (~1/496)
  stepSize = one + one;                           // How far particles move each frame (2 pixels)

  // --- Set Color Mode using TAU derivations ---
  // HSB: Hue max=large, Sat max=medium, Bri max=medium, Alpha max=one
  colorMode(HSB, large, medium, medium, one);

  // --- Initialize Particles ---
  for (let i = zero; i < numParticles; i = i + one) {
    particles.push({
      x: random(width),  // random() is a p5 function
      y: random(height),
      px: random(width), // Previous position (start same as current)
      py: random(height)
    });
  }

  // --- Initial Drawing Setup ---
  background(zero, zero, zero); // Black background
  strokeWeight(one); // Thin strokes
  // noFill(); // Not strictly needed as we only use stroke
}

function draw() {
  // --- Re-derive numbers (optional, but ensures strictness if globals changed) ---
  zero = TAU - TAU;
  one = TAU / TAU;
  two = one + one;
  half = one / two;
  quarter = one / (two+two);
  medium = TAU * TAU;
  large = medium * TAU;
  stepSize = one + one;
  noiseScale = one / medium;
  timeIncrement = one / large / two;

  // --- Semi-transparent background for trails ---
  fill(zero, zero, zero, one / (TAU + two)); // Low alpha overlay (~1/8 = 0.125)
  noStroke();
  rect(zero, zero, width, height);

  // --- Update and Draw Particles ---
  let time = frameCount * timeIncrement; // Global time for noise z-offset

  for (let i = zero; i < numParticles; i = i + one) {
    let p = particles[floor(i)]; // Access particle (floor needed if i isn't integer, though loop ensures it)

    // Store previous position
    p.px = p.x;
    p.py = p.y;

    // Calculate noise coordinates based on position and scale
    let noiseX = p.x * noiseScale;
    let noiseY = p.y * noiseScale;

    // Get noise value (0 to 1)
    let noiseValue = noise(noiseX, noiseY, time); // noise() is p5 function

    // Map noise value to an angle (0 to TAU)
    let angle = noiseValue * TAU;

    // Calculate movement vector
    let vx = cos(angle * 5); // cos() is p5 function
    let vy = sin(angle / 5); // sin() is p5 function

    // Update position
    p.x = p.x + vx * stepSize;
    p.y = p.y + vy * stepSize;

    // --- Handle Particle Wrapping ---
    if (p.x < zero) p.x = width;
    if (p.x > width) p.x = zero;
    if (p.y < zero) p.y = height;
    if (p.y > height) p.y = zero;

    // --- Determine Color based on Angle ---
    // Hue mapped from angle (0-TAU maps to 0-large)
    let hue = angle / TAU * large;
    // Fixed high saturation and medium brightness
    let saturation = medium * (one - quarter); // 3/4 of max saturation
    let brightness = medium * half;            // 1/2 of max brightness
    // Low alpha for ethereal look
    let alpha = one * half;                     // 0.5 alpha

    // --- Draw Particle Trail Segment ---
    stroke(hue, saturation, brightness, alpha);
    line(p.px, p.py, p.x, p.y); // line() is p5 function

  } // end particle loop
}

// Make canvas responsive
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Reset background
  zero = TAU - TAU;
  background(zero, zero, zero);
  // Optional: Re-randomize particles on resize?
  // Or just let them continue from their current positions.
  // Re-randomizing might be jarring but ensures coverage of new space.
  // Let's keep it simple and not re-randomize for now.
}