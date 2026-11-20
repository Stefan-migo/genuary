// Genuary 2024 - Day 23: Inspired by Brutalism v3
// Concept: Generative concrete slabs, clickable accent for regeneration,
//          AI-generated quotes via backend (Gemini), and call-to-action animation.

let palette = [];
let accentColor;
let shadowOffset;

// --- Data storage for redraw and interaction ---
let baseBlocksData = [];
let detailBlocksData = [];
let accentBlocksData = [];
let lastAccentBlock = null; // Stores { x, y, w, h } of the block to click

// --- Quote Elements ---
// Static quotes used ONLY as a fallback if AI fails
let fallbackQuotes = [
  " béton brut ",
  "Truth to materials.",
  "Structure is the giver of light.",
  "Monumentality is enigmatic.",
  "Order is.",
  "Silence and Light.",
  "Weight and Mass.",
  "Repetition reveals character.",
  "Find the signal in the noise.",
];
let quoteElement;
let currentQuote = ""; // Will hold the AI-generated or fallback quote

// --- Animation Elements ---
let lastRegenTime = 0;
let glowTime = 5000; // 5 seconds in milliseconds
let isGlowing = false;

// --- Setup ---
function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  rectMode(CENTER);
  noStroke();

  palette = [
    color(0, 0, 15), color(0, 0, 25), color(0, 0, 35),
    color(0, 0, 50), color(0, 0, 65),
  ];

  // Pick one accent color
   accentColor = random([
      color(45, 90, 90), // Yellow-Orange
      color(0, 80, 100),  // Red
      color(200, 70, 90) // Blue
  ]);
  // accentColor = null; // Uncomment to disable accent color entirely

  shadowOffset = min(width, height) * 0.01;

  // Create the paragraph element for quotes
  quoteElement = createP('Initializing...');
  quoteElement.style('color', 'rgba(255, 255, 255, 0.8)');
  quoteElement.style('position', 'absolute');
  quoteElement.style('bottom', '20px');
  quoteElement.style('left', '20px');
  quoteElement.style('right', '20px'); // Allow wrapping
  quoteElement.style('font-family', 'monospace');
  quoteElement.style('font-size', '15px');
  quoteElement.style('text-shadow', '1px 1px 2px rgba(0,0,0,0.7)');

  // Initial generation
  regenerate();

  // Ensure the draw loop runs for animation and async updates
  loop();
}

// --- Main Draw Loop ---
function draw() {
  background(0, 0, 5); // Dark background every frame

  // Check for Glow Animation
  if (accentColor && lastAccentBlock && millis() - lastRegenTime > glowTime) {
    isGlowing = true;
  }

  // --- Draw Blocks from Data ---
  // Use standard loops as data arrays are simple
  for (let i = 0; i < baseBlocksData.length; i++) {
    let block = baseBlocksData[i];
    drawBlockWithShadow(block.x, block.y, block.w, block.h, block.col);
  }
  for (let i = 0; i < detailBlocksData.length; i++) {
     let block = detailBlocksData[i];
    drawBlockWithShadow(block.x, block.y, block.w, block.h, block.col);
  }
  for (let i = 0; i < accentBlocksData.length; i++) {
    let block = accentBlocksData[i];
    let drawColor = block.col;

    // Apply glow ONLY to the specific clickable accent block
    if (isGlowing && lastAccentBlock && block.x === lastAccentBlock.x && block.y === lastAccentBlock.y) {
      let pulseSpeed = 0.004;
      let minBright = 70;
      let maxBright = 110;
      let brightnessPulse = map(sin(millis() * pulseSpeed), -1, 1, minBright, maxBright);
      let currentSat = saturation(block.col);
      drawColor = color(hue(block.col), max(currentSat, 50), brightnessPulse, alpha(block.col));
    }
    drawBlockWithShadow(block.x, block.y, block.w, block.h, drawColor);
  }

  // --- Draw Texture ---
  drawTexture();
}

// --- Interaction ---
function mousePressed() {
  // Check if the click is within the bounds of the last stored accent block
  if (lastAccentBlock && accentColor) {
    let { x, y, w, h } = lastAccentBlock;
    if (mouseX > x - w / 2 && mouseX < x + w / 2 &&
        mouseY > y - h / 2 && mouseY < y + h / 2) {
      regenerate(); // Regenerate if accent block is clicked
    }
  }
}

// --- Resize Handling ---
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  shadowOffset = min(width, height) * 0.01;
  // Optional: Regenerate on resize, or just let elements scale/reposition if possible
  regenerate();
}

// --- Regeneration Orchestration ---
function regenerate() {
  console.log("Regenerating structure...");
  clearBlockData();
  generateBlockData();
  updateQuote(); // Fetch new quote from backend

  // Reset animation state
  lastRegenTime = millis();
  isGlowing = false;

  // No redraw() needed here because draw() is looping
}

// --- Data Management ---
function clearBlockData() {
    baseBlocksData = [];
    detailBlocksData = [];
    accentBlocksData = [];
    lastAccentBlock = null;
}

function generateBlockData() {
  let numBaseBlocks = int(random(5, 15));
  let numDetailBlocks = int(random(20, 50));
  let numAccents = accentColor ? max(1, int(random(1, 4))) : 0;

  // Generate Base Blocks Data
  for (let i = 0; i < numBaseBlocks; i++) {
    baseBlocksData.push({
      x: random(width), y: random(height * 0.3, height * 0.95),
      w: random(width * 0.15, width * 0.7), h: random(height * 0.1, height * 0.6),
      col: random(palette)
    });
  }

  // Generate Detail Blocks Data
  for (let i = 0; i < numDetailBlocks; i++) {
     let w = random(width * 0.02, width * 0.2);
     let h = random(height * 0.02, height * 0.25);
     if (random() < 0.3) { (random() < 0.5) ? w = random(width * 0.005, width * 0.015) : h = random(height* 0.005, height* 0.015); }
     let col = random(palette);
     if (random() < 0.2) col = lerpColor(col, color(0, 0, 100), random(0.1, 0.3));
     else if (random() < 0.1) col = lerpColor(col, color(0, 0, 0), random(0.1, 0.3));
     detailBlocksData.push({ x: random(width), y: random(height), w: w, h: h, col: col });
  }

   // Generate Accent Blocks Data
  if (accentColor && numAccents > 0) {
      // Find position for the *last* accent block first, which will be clickable
      let lastX = random(width);
      let lastY = random(height);
      let lastW = random(width * 0.01, width * 0.05);
      let lastH = random(height* 0.01, height* 0.05);

      // Store its details for click detection and glow target
      lastAccentBlock = { x: lastX, y: lastY, w: lastW, h: lastH };

      // Add it to the drawing data
       accentBlocksData.push({ ...lastAccentBlock, col: accentColor });


      // Add any additional accent blocks (these won't be clickable/glow)
      for (let i = 0; i < numAccents - 1; i++) {
            let w = random(width * 0.01, width * 0.1);
            let h = random(height * 0.01, height * 0.1);
             if (random() < 0.5) {
                 w = random(width * 0.01, width * 0.05);
                 h = random(height* 0.01, height* 0.05);
             }
           accentBlocksData.push({
               x: random(width), y: random(height), w: w, h: h, col: accentColor
           });
       }
       // Shuffle accent blocks slightly so the clickable one isn't always last visually if needed
       shuffle(accentBlocksData, true); // p5's shuffle function
  }
}


// --- Drawing Helpers ---

// Draws a block with shadow
function drawBlockWithShadow(x, y, w, h, col) {
  push();
  // Shadow
  fill(0, 0, 0, 30); // Black shadow with transparency
  rect(x + shadowOffset, y + shadowOffset, w, h);
  // Main Block
  fill(col);
  rect(x, y, w, h);
  pop();
}

// Draws the noise texture overlay
function drawTexture() {
  // Adjust density based on canvas size, prevents overly dense/sparse texture
  let textureDensity = map(width * height, 300000, 2000000, 8000, 35000, true); // true clamps value
  textureDensity = constrain(textureDensity, 5000, 40000); // Min/max density

  strokeWeight(random(1, 2.5));
  for (let i = 0; i < textureDensity; i++) {
    let tx = random(width);
    let ty = random(height);
    let grainColor = color(0, 0, random(40, 90), random(2, 10)); // Slightly brighter range
    stroke(grainColor);
    point(tx, ty);
  }
  noStroke(); // Reset stroke
}


// --- AI Quote Fetching ---
async function updateQuote() {
  quoteElement.html("Generating thought..."); // Loading indicator
  console.log("Fetching AI phrase from backend...");

  try {
    // Make a POST request to your backend endpoint
    // Ensure your backend server is running and accessible at this path
    const response = await fetch('http://localhost:3000/api/generate-phrase', {
      method: 'POST', // Or GET if your backend uses GET
      headers: {
        // Content-Type might not be strictly necessary if not sending a body,
        // but often good practice for POST
        'Content-Type': 'application/json',
      },
      // body: JSON.stringify({ optional_data: 'if needed' }) // Only if your backend expects data
    });

    if (!response.ok) {
      // Handles HTTP errors like 404, 500
      throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`);
    }

    const data = await response.json(); // Parse the JSON response from backend

    if (data && data.phrase) {
      currentQuote = data.phrase.replace(/["“”]/g, ''); // Remove quotes from AI response if any
      quoteElement.html(currentQuote);
      console.log("AI phrase updated:", currentQuote);
    } else {
      // If the backend responded successfully but didn't provide a phrase
      throw new Error("Invalid response structure from backend.");
    }

  } catch (error) {
    // Handles network errors or errors thrown above
    console.error("Error fetching or processing AI phrase:", error);
    // Fallback to a random static quote
    currentQuote = random(fallbackQuotes);
    quoteElement.html(currentQuote + " <span style='opacity: 0.6'>(AI unavailable)</span>"); // Show fallback + indicator
  }
}