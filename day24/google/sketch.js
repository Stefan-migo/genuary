// Genuary Day 24: Geometric Art - Rectangles Only
// Concept: Recursive Fragmentation

// --- Declare variables in the global scope ---
let palette;
let minSize = 10;
let maxDepth = 8;
let strokeColor;
let initialStrokeWeight = 2;
let fillProbability = 0.95;
let innerRectProbability = 0.15;
let baseHue;

// --- Function to initialize/reset the color scheme ---
function initializeColorScheme() {
  baseHue = random(360); // Generate a NEW base hue

  palette = [ // Generate a NEW palette based on the new hue
    color((baseHue + 0) % 360, random(60, 90), random(70, 100)),
    color((baseHue + 30) % 360, random(50, 80), random(60, 90)),
    color((baseHue + 180) % 360, random(70, 95), random(50, 85)), // Complementary accent
    color((baseHue + 210) % 360, random(40, 70), random(80, 100)),
    color((baseHue + random(-20, 20)) % 360, random(10, 30), random(90, 100)), // Low saturation / bright
    color((baseHue + random(-20, 20)) % 360, random(80, 100), random(10, 40)), // High saturation / dark
  ];

  strokeColor = color(baseHue, 10, 20, 80); // Generate a NEW stroke color
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  rectMode(CORNER);

  initializeColorScheme(); // Call the color setup function

  // Initial drawing happens once after setup because of noLoop()
  noLoop();
}

// Draw function is called once after setup (due to noLoop),
// and also by redraw() when window is resized or R is pressed.
function draw() {
  // Set background using the current baseHue
  background(baseHue, 5, 95);
  strokeWeight(initialStrokeWeight);
  recursiveRect(0, 0, width, height, 0); // Draw the structure
}

function recursiveRect(x, y, w, h, depth) {
  // Base Case: Stop if too small, too deep, or randomly decide not to split
  let stopRecursion = (
    w < minSize ||
    h < minSize ||
    depth >= maxDepth ||
    (w < width * 0.1 && h < height * 0.1 && random() > 0.8)
  );

  if (stopRecursion) {
    // --- Draw the final rectangle ---
    let chosenColor = random(palette);
    let alpha = random(70, 100);
    let drawFill = random() < fillProbability;

    stroke(strokeColor);
    strokeWeight(map(depth, 0, maxDepth, initialStrokeWeight, 0.5));

    if (drawFill) {
      fill(hue(chosenColor), saturation(chosenColor), brightness(chosenColor), alpha);
    } else {
      noFill();
    }

    let offsetX = random(-0.5, 0.5);
    let offsetY = random(-0.5, 0.5);
    rect(x + offsetX, y + offsetY, w, h);

    // --- Inner rectangle twist ---
    if (drawFill && w > 5 && h > 5 && random() < innerRectProbability) {
        let innerMargin = min(w, h) * random(0.1, 0.25);
        let innerColor = random(palette);
        fill(hue(innerColor), saturation(innerColor), brightness(innerColor), random(80, 100));
        noStroke();
        rect(x + innerMargin + offsetX, y + innerMargin + offsetY, w - 2 * innerMargin, h - 2 * innerMargin);
    }

  } else {
    // --- Recursive Step: Split the rectangle ---
    depth++;
    let splitVertical = (w > h);
    if (w === h || random() < 0.5) {
        splitVertical = random() < 0.5;
    }

    if (splitVertical) {
      let splitX = w * random(0.3, 0.7);
      recursiveRect(x, y, splitX, h, depth);
      recursiveRect(x + splitX, y, w - splitX, h, depth);
    } else {
      // Corrected the typo here from 0.03 to 0.3 (assuming 0.03 was a typo)
      let splitY = h * random(0.3, 0.7);
      recursiveRect(x, y, w, splitY, depth);
      recursiveRect(x, y + splitY, w, h - splitY, depth);
    }
  }
}

// Redraw on resize
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // redraw() will call draw(), which uses the *current* colors
  // but applies the structure to the new canvas size.
  redraw();
}

// Handle key presses
function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('recursive_rectangles_' + floor(random(1000)), 'png'); // Added random number to filename
  }

  if (key === 'r' || key === 'R') {
    reGenerate(); // Call the regeneration function
  }
}

// Function to regenerate the entire artwork with new colors
function reGenerate() {
    initializeColorScheme(); // Generate NEW colors first
    redraw(); // Then trigger draw() to render with the new colors and structure
}