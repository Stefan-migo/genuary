// Genuary Day 16: Generative Palette
// Click to generate a new palette and composition.
// Press 'p' to toggle the palette display at the bottom.
// Includes faster 'sparse' grain and random strokes.

let palette = [];
let bgColor;
let numShapes = 50;
let numLayers = 5;
let noiseOffset = 0;

let showPalette = true;

// --- New Parameters ---
let applyGrain = true; // Set to false to disable grain entirely
let grainAmount = 0.2; // Density of sparse grain (0.0 to 1.0+)
let grainIntensity = 0.8; // Max brightness of grain points (0.0 to 1.0)

let strokeProbability = 0.15; // Chance (0.0 to 1.0) for a shape to have a stroke
// --- End New Parameters ---

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 1);
  noStroke(); // Default state is no stroke
  angleMode(DEGREES);
  generateNewArtwork();
}

function draw() {
  // Keep draw empty unless doing continuous animation
}

function mousePressed() {
  let swatchSize = 35;
  let padding = 8;
  let startY = height - swatchSize - padding * 2;
  if (mouseY < startY - padding) {
       generateNewArtwork();
  }
}

function keyPressed() {
  if (key === 'p' || key === 'P') {
    showPalette = !showPalette;
    redrawCurrentArtwork();
  }
  // Optional: Key to toggle grain?
  if (key === 'g' || key === 'G') {
    applyGrain = !applyGrain;
    redrawCurrentArtwork();
  }
}

function generateNewArtwork() {
  palette = generatePalette();
  let baseBgColor = random(palette);
  bgColor = color(hue(baseBgColor), saturation(baseBgColor) * 0.3, brightness(baseBgColor) * 0.2, 1);
  redrawCurrentArtwork();
}

function redrawCurrentArtwork() {
  background(bgColor);
  drawComposition();
  if (applyGrain) {
      addSparseGrain(grainAmount, grainIntensity); // Use the new grain function
  }
  if (showPalette) {
    displayPalette();
  }
}

function generatePalette() {
    // Palette generation logic remains the same...
    let generated = [];
    let baseHue = random(360);
    let baseSat = random(60, 95);
    let baseBri = random(70, 100);
    let strategy = floor(random(3));

    generated.push(color(baseHue, baseSat, baseBri));

    if (strategy === 0) { // Analogous + Complementary
        let analogousAngle = random(20, 40);
        generated.push(color((baseHue + analogousAngle) % 360, constrain(baseSat + random(-15, 15), 40, 100), constrain(baseBri + random(-10, 10), 50, 100)));
        generated.push(color((baseHue - analogousAngle + 360) % 360, constrain(baseSat + random(-15, 15), 40, 100), constrain(baseBri + random(-10, 10), 50, 100)));
        let compHue = (baseHue + 180 + random(-15, 15)) % 360;
        generated.push(color(compHue, constrain(baseSat + random(-10, 10), 50, 100), constrain(baseBri + random(-15, 5), 40, 95)));
        generated.push(color(baseHue, constrain(baseSat * 0.8, 30, 100), constrain(baseBri * 0.7, 30, 90) ));
    } else if (strategy === 1) { // Triadic
        generated.push(color((baseHue + 120) % 360, constrain(baseSat + random(-15, 15), 40, 100), constrain(baseBri + random(-10, 10), 50, 100)));
        generated.push(color((baseHue + 240) % 360, constrain(baseSat + random(-15, 15), 40, 100), constrain(baseBri + random(-10, 10), 50, 100)));
        generated.push(color(baseHue, constrain(baseSat * 0.5, 20, 100), constrain(baseBri * 1.2, 50, 100) ));
        generated.push(color((baseHue + 120) % 360, baseSat, constrain(baseBri * 0.5, 20, 90) ));
    } else { // Split Complementary
        let compHue = (baseHue + 180) % 360;
        let splitAngle = random(25, 45);
        generated.push(color((compHue + splitAngle) % 360, constrain(baseSat + random(-10, 10), 40, 100), constrain(baseBri + random(-10, 10), 50, 100)));
        generated.push(color((compHue - splitAngle + 360) % 360, constrain(baseSat + random(-10, 10), 40, 100), constrain(baseBri + random(-10, 10), 50, 100)));
        generated.push(color(baseHue, constrain(baseSat * 1.1, 40, 100), constrain(baseBri * 0.6, 30, 90) ));
        generated.push(color(baseHue, constrain(baseSat * 0.7, 30, 100), constrain(baseBri * 1.1, 60, 100) ));
    }
    return shuffle(generated);
}


function drawComposition() {
  blendMode(BLEND);

  for (let layer = 0; layer < numLayers; layer++) {
    let layerAlpha = map(layer, 0, numLayers, 0.1, 0.5);

    for (let i = 0; i < numShapes; i++) {
      let x = random(width);
      let y = random(height);
      let size = random(width * 0.05, width * 0.3);
      let rotation = random(360);

      let noiseFactor = noise(x * 0.01, y * 0.01, layer * 0.1 + noiseOffset);
      x += map(noiseFactor, 0, 1, -width * 0.1, width * 0.1);
      y += map(noiseFactor, 0, 1, -height * 0.1, height * 0.1);
      size *= map(noise(i * 0.1, layer * 0.2 + noiseOffset), 0, 1, 0.5, 1.5);
      rotation += map(noise(i * 0.2, layer * 0.1 + noiseOffset + 100), 0, 1, -90, 90);

      let col = palette[ (i + layer) % palette.length];
      let shapeColor = color(hue(col), saturation(col), brightness(col), layerAlpha * random(0.7, 1.3) );

      push(); // Isolate transformations and styles for this shape
      translate(x, y);
      rotate(rotation);

      fill(shapeColor);

      // --- Add Random Stroke ---
      if (random() < strokeProbability) {
          // Derive stroke color: e.g., slightly darker/brighter, less transparent
          let strHue = hue(col);
          let strSat = saturation(col) * 1.1; // Slightly more saturated
          let strBri = brightness(col) * (random() > 0.5 ? 1.2 : 0.7); // Randomly brighter or darker
          let strAlpha = constrain(layerAlpha * 2.0, 0.2, 0.9); // More opaque than fill
          stroke(strHue, strSat, strBri, strAlpha);
          strokeWeight(random(0.5, 2.5)); // Random thin to medium weight
      } else {
          noStroke(); // Ensure no stroke if condition isn't met
      }
      // --- End Random Stroke ---

      ellipse(0, 0, size, size * random(0.7, 1.3));

      pop(); // Restore previous state (including potentially noStroke)
    }
  }
   // Important: Reset stroke to default after drawing all shapes if necessary
   noStroke();
}

// --- New Faster Grain Function ---
function addSparseGrain(amount = 50, intensity = 1.0) {
  push(); // Isolate grain drawing style
  strokeWeight(1);
  let numGrains = floor(width * height * amount * 0.65); // Adjust multiplier for density
  let maxBrightness = 100 * intensity; // HSB brightness range 0-100
  let grainAlpha = 0.25; // Adjust alpha for subtlety

  for (let i = 0; i < numGrains; i++) {
    let x = random(width);
    let y = random(height);
    // Draw grayscale points (adjust saturation if you want colored grain)
    let grainBri = random(maxBrightness);
    stroke(0, 0, grainBri, grainAlpha); // Hue 0, Sat 0 = grayscale
    point(x, y);
  }
  pop(); // Restore previous style
  noStroke(); // Ensure stroke is off again after grain
}

// Function to display the current palette at the bottom (same as before)
function displayPalette() {
    let swatchSize = 35;
    let padding = 8;
    let totalWidth = (swatchSize + padding) * palette.length - padding;
    let startX = width / 2 - totalWidth / 2;
    let startY = height - swatchSize - padding * 6;

    push();
    fill(0, 0, 5, 0.7); // HSB: Dark, semi-transparent background
    noStroke();
    rect(startX - padding, startY - padding, totalWidth + 2 * padding, swatchSize + 2 * padding, 8);

    for (let i = 0; i < palette.length; i++) {
        // HSB fill with full alpha (1)
        fill(hue(palette[i]), saturation(palette[i]), brightness(palette[i]), 1);
        rect(startX + i * (swatchSize + padding), startY, swatchSize, swatchSize, 5);
    }
    pop();
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = floor(random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redrawCurrentArtwork();
}
