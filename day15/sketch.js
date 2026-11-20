// Genuary Day 15: Design a Rug - Enhanced Version
// Incorporating: Noise, Recursion, Complex Motifs, Fringes, Irregular Borders, Gradients

let palette = [];
let bgColor;
let borderSize;
let mainGridSize;
let borderGridSize;

// --- Configuration ---
const RUG_ASPECT_RATIO = 1.6; // Width / Height
const BORDER_PROPORTION = 0.15; // How much of the smaller dimension is border
const MAIN_GRID_DENSITY = 12; // Fewer cells for potentially recursive detail
const BORDER_GRID_DENSITY = 5;
const STROKE_WEIGHT = 1.5;

// Enhancement Config
const USE_NOISE = true; // Set to false to revert to pure random()
const NOISE_SCALE_POS = 0.05; // Noise scale for position/rotation/size
const NOISE_SCALE_COL = 0.2;  // Noise scale for color variation
const NOISE_OFFSET = 1000; // Use large offset for different noise values
const JITTER_AMOUNT = 3; // Max random/noise offset for motif elements

const ENABLE_RECURSION = true;
const MAX_RECURSION_DEPTH = 2; // Max depth (0 = no recursion)
const RECURSION_PROBABILITY = 0.1; // Chance a cell will subdivide instead of drawing motif
const MIN_CELL_SIZE_FOR_RECURSION = 15; // Don't recurse if cell gets too small

const ENABLE_FRINGES = true;
const FRINGE_LENGTH = 25;
const FRINGE_DENSITY = 0.7; // Proportion of possible fringe strands to draw
const FRINGE_WOBBLE = 5;   // Positional variation
const FRINGE_THICKNESS = 1.5;

const BORDER_IRREGULARITY = 0.15; // How much border motif position can shift (proportion of cell size)

let noiseSeedValue;

function setup() {
  let canvasW, canvasH;
  if (windowWidth / windowHeight > RUG_ASPECT_RATIO) {
    canvasH = windowHeight * 0.9;
    canvasW = canvasH * RUG_ASPECT_RATIO;
  } else {
    canvasW = windowWidth * 0.9;
    canvasH = canvasW / RUG_ASPECT_RATIO;
  }
  createCanvas(canvasW, canvasH);

  colorMode(HSB, 360, 100, 100, 100);
  angleMode(DEGREES);
  rectMode(CORNER);

  noiseSeedValue = floor(random(10000)); // Consistent noise per rug generation
  generateNewRug();
  noLoop();
}

function draw() {
  noiseSeed(noiseSeedValue); // Use the same noise seed for this draw cycle
  background(bgColor);
  strokeWeight(STROKE_WEIGHT);

  let rugW = width;
  let rugH = height;
  borderSize = min(rugW, rugH) * BORDER_PROPORTION;
  let mainFieldW = rugW - 2 * borderSize;
  let mainFieldH = rugH - 2 * borderSize;

  drawMainField(borderSize, borderSize, mainFieldW, mainFieldH);
  drawBorders(rugW, rugH, borderSize);

  if (ENABLE_FRINGES) {
    drawFringes(rugW, rugH, borderSize);
  }
}

function generateNewRug() {
  noiseSeedValue = floor(random(10000)); // New noise seed for new rug
  noiseSeed(noiseSeedValue);

  // --- Generate Color Palette ---
  palette = [];
  let baseHue = random(360);
  let sat = random(40, 90);
  let br = random(70, 95);

  bgColor = color(baseHue, sat * 0.4, br * 0.2, 100);

  palette.push(color(baseHue, sat, br));
  palette.push(color((baseHue + 30 + random(-15, 15)) % 360, constrain(sat * random(0.8, 1.2), 20, 100), constrain(br * random(0.8, 1.2), 50, 100)));
  palette.push(color((baseHue + 150 + random(-25, 25)) % 360, constrain(sat * random(0.7, 1.1), 20, 100), constrain(br * random(0.7, 1.1), 50, 100)));
  palette.push(color((baseHue + 180 + random(-25, 25)) % 360, constrain(sat * random(0.9, 1.3), 20, 100), constrain(br * random(0.6, 1.0), 40, 100)));
  palette.push(color((baseHue + 210 + random(-15, 15)) % 360, constrain(sat * random(0.6, 1.0), 20, 100), constrain(br * random(0.9, 1.1), 60, 100)));
  // Add a near-black/white for contrast occasionally
   if (random() > 0.5) palette.push(color(baseHue, 5, random(90, 100))); // near white
   else palette.push(color(baseHue, 15, random(10, 25))); // near black


  // Grid sizes
  mainGridSize = (width - 2 * (min(width, height) * BORDER_PROPORTION)) / MAIN_GRID_DENSITY;
  borderGridSize = (min(width, height) * BORDER_PROPORTION) / BORDER_GRID_DENSITY;

  if (typeof redraw === 'function') {
     redraw();
  }
}

// --- Drawing Functions ---

function drawMainField(x, y, w, h) {
  push();
  translate(x + w / 2, y + h / 2);

  let cellW = w / MAIN_GRID_DENSITY;
  // Keep cells roughly square-ish based on field aspect ratio
  let numCellsH = floor(h / cellW);
  let cellH = h / numCellsH;

  // Adjust quadrant dimensions slightly if needed due to flooring
  let quadW = (MAIN_GRID_DENSITY / 2) * cellW;
  let quadH = (numCellsH / 2) * cellH;

  // Top-Right Quadrant (origin at center)
  push();
  drawQuadrant(quadW, quadH, cellW, cellH, 0, 0); // Start grid indices at 0,0 for this quad
  pop();

  // Top-Left Quadrant
  push();
  scale(-1, 1);
  drawQuadrant(quadW, quadH, cellW, cellH, MAIN_GRID_DENSITY / 2, 0); // Adjust grid indices
  pop();

  // Bottom-Left Quadrant
  push();
  scale(-1, -1);
  drawQuadrant(quadW, quadH, cellW, cellH, MAIN_GRID_DENSITY / 2, numCellsH / 2);
  pop();

  // Bottom-Right Quadrant
  push();
  scale(1, -1);
  drawQuadrant(quadW, quadH, cellW, cellH, 0, numCellsH / 2);
  pop();

  pop(); // Return to original origin
}

function drawQuadrant(quadW, quadH, cellW, cellH, gridOffsetX, gridOffsetY) {
    // Iterate relative to the center of the rug field
    // Drawing from (0,0) up to (quadW, -quadH) for the top-right view
    let numCellsW = floor(quadW / cellW);
    let numCellsH = floor(quadH / cellH);

    for (let i = 0; i < numCellsW; i++) {
        for (let j = 0; j < numCellsH; j++) {
            let cx = i * cellW;
            let cy = -j * cellH; // Y grows downwards on screen, draw from center up/left

            // Skip probability
            let skipNoise = noise(cx * NOISE_SCALE_POS + NOISE_OFFSET * 3, cy * NOISE_SCALE_POS + NOISE_OFFSET * 3);
            if (USE_NOISE && skipNoise < 0.3) continue;
            if (!USE_NOISE && random() < 0.05) continue;

            push();
            translate(cx, cy); // Move to top-left of cell (drawing relative to center)
            // Pass GLOBAL grid indices for consistent noise
            drawMotif(cellW, cellH, false, 0, gridOffsetX + i, gridOffsetY + j);
            pop();
        }
    }
}


function drawBorders(rugW, rugH, borderW) {
  let cellS = borderGridSize;
  let ns = NOISE_SCALE_POS * 0.5; // Noise scale for border irregularity

  // Top Border
  for (let x = 0; x < rugW; x += cellS) {
    for (let y = 0; y < borderW; y += cellS) {
      let gridI = floor(x / cellS);
      let gridJ = floor(y / cellS);
      let irregularOffset = USE_NOISE ? (noise(x * ns, y * ns + NOISE_OFFSET) - 0.5) * 2 * cellS * BORDER_IRREGULARITY : 0;
      push();
      translate(x + irregularOffset, y + irregularOffset);
      drawMotif(cellS, cellS, true, 0, gridI, gridJ); // isBorder=true
      pop();
    }
  }
  // Bottom Border
   for (let x = 0; x < rugW; x += cellS) {
    for (let y = rugH - borderW; y < rugH; y += cellS) {
       let gridI = floor(x / cellS);
       let gridJ = floor(y / cellS);
       let irregularOffset = USE_NOISE ? (noise(x * ns + 50, y * ns + NOISE_OFFSET + 50) - 0.5) * 2 * cellS * BORDER_IRREGULARITY : 0;
      push();
      translate(x + irregularOffset, y + irregularOffset);
      drawMotif(cellS, cellS, true, 0, gridI, gridJ);
      pop();
    }
  }
   // Left Border
   for (let x = 0; x < borderW; x += cellS) {
    for (let y = borderW; y < rugH - borderW; y += cellS) {
       let gridI = floor(x / cellS);
       let gridJ = floor(y / cellS);
       let irregularOffset = USE_NOISE ? (noise(x * ns + 100, y * ns + NOISE_OFFSET + 100) - 0.5) * 2 * cellS * BORDER_IRREGULARITY : 0;
      push();
      translate(x + irregularOffset, y + irregularOffset);
      drawMotif(cellS, cellS, true, 0, gridI, gridJ);
      pop();
    }
  }
   // Right Border
   for (let x = rugW - borderW; x < rugW; x += cellS) {
    for (let y = borderW; y < rugH - borderW; y += cellS) {
       let gridI = floor(x / cellS);
       let gridJ = floor(y / cellS);
       let irregularOffset = USE_NOISE ? (noise(x * ns + 150, y * ns + NOISE_OFFSET + 150) - 0.5) * 2 * cellS * BORDER_IRREGULARITY : 0;
      push();
      translate(x + irregularOffset, y + irregularOffset);
      drawMotif(cellS, cellS, true, 0, gridI, gridJ);
      pop();
    }
  }
}

function drawFringes(rugW, rugH, borderW) {
  let fringeStartY = rugH - borderW / 2; // Start fringes near the bottom border edge
  let fringeTopY = borderW / 2;        // Top edge fringes

  strokeWeight(FRINGE_THICKNESS);
  let ns = NOISE_SCALE_POS * 2; // Different noise for fringes

  // Bottom Fringes
  for (let x = borderW; x < rugW - borderW; x += FRINGE_THICKNESS * (1.5 + random(0.8))) {
    if (random() > FRINGE_DENSITY) continue; // Skip some for density

    let noiseVal = USE_NOISE ? noise(x * ns, fringeStartY * ns) : 0.5;
    let currentLength = FRINGE_LENGTH * (0.8 + noiseVal * 0.4);
    let currentWobble = (random() - 0.5) * 2 * FRINGE_WOBBLE;
    let angleWobble = (random() - 0.5) * 5; // Slight angle variation
    let c = random(palette);
    let alphaVal = random(70, 100);
    stroke(hue(c), saturation(c), brightness(c), alphaVal);

    push();
    translate(x + currentWobble, fringeStartY);
    rotate(angleWobble);
    line(0, 0, 0, currentLength); // Draw fringe downwards
    pop();
  }

  // Top Fringes (similar logic, draw upwards)
   for (let x = borderW; x < rugW - borderW; x += FRINGE_THICKNESS * (1.5 + random(0.8))) {
    if (random() > FRINGE_DENSITY) continue;

    let noiseVal = USE_NOISE ? noise(x * ns + 200, fringeTopY * ns + 200) : 0.5;
    let currentLength = FRINGE_LENGTH * (0.8 + noiseVal * 0.4);
    let currentWobble = (random() - 0.5) * 2 * FRINGE_WOBBLE;
    let angleWobble = (random() - 0.5) * 5;
    let c = random(palette);
    let alphaVal = random(70, 100);
     stroke(hue(c), saturation(c), brightness(c), alphaVal);

    push();
    translate(x + currentWobble, fringeTopY);
    rotate(angleWobble);
    line(0, 0, 0, -currentLength); // Draw fringe upwards
    pop();
  }
  noStroke(); // Reset stroke
}


// --- Motif Drawing ---

function drawMotif(w, h, isBorder = false, depth = 0, gridI = 0, gridJ = 0) {

  // --- Recursive Subdivision ---
  if (
    ENABLE_RECURSION &&
    depth < MAX_RECURSION_DEPTH &&
    !isBorder && // Avoid recursing in borders for now (can get too messy)
    min(w, h) > MIN_CELL_SIZE_FOR_RECURSION &&
    random() < RECURSION_PROBABILITY
  ) {
    // Subdivide into 4 quadrants
    let w2 = w / 2;
    let h2 = h / 2;
    // Top-Left
    push();
    translate(0, 0);
    drawMotif(w2, h2, false, depth + 1, gridI * 2, gridJ * 2);
    pop();
    // Top-Right
    push();
    translate(w2, 0);
    drawMotif(w2, h2, false, depth + 1, gridI * 2 + 1, gridJ * 2);
    pop();
    // Bottom-Left
    push();
    translate(0, h2);
    drawMotif(w2, h2, false, depth + 1, gridI * 2, gridJ * 2 + 1);
    pop();
    // Bottom-Right
    push();
    translate(w2, h2);
    drawMotif(w2, h2, false, depth + 1, gridI * 2 + 1, gridJ * 2 + 1);
    pop();
    return; // Stop after subdividing
  }


  // --- Base Motif Drawing ---
  let motifType = random(1);

  // Use noise for slight color variations based on global position
  let noiseX = gridI * NOISE_SCALE_COL;
  let noiseY = gridJ * NOISE_SCALE_COL;
  let hueShift = USE_NOISE ? (noise(noiseX, noiseY) - 0.5) * 20 : random(-5, 5);
  let satShift = USE_NOISE ? 1.0 + (noise(noiseX + 10, noiseY + 10) - 0.5) * 0.3 : random(0.9, 1.1);
  let briShift = USE_NOISE ? 1.0 + (noise(noiseX + 20, noiseY + 20) - 0.5) * 0.2 : random(0.9, 1.1);

  let c1_base = random(palette);
  let c2_base = random(palette);
  while (c1_base === c2_base && palette.length > 1) {
    c2_base = random(palette);
  }

  // Apply noise/random shifts
  let c1 = color(
      (hue(c1_base) + hueShift) % 360,
      constrain(saturation(c1_base) * satShift, 0, 100),
      constrain(brightness(c1_base) * briShift, 0, 100),
      alpha(c1_base)
  );
   let c2 = color(
      (hue(c2_base) + hueShift + random(-3,3)) % 360, // Add tiny extra random variation to c2
      constrain(saturation(c2_base) * satShift, 0, 100),
      constrain(brightness(c2_base) * briShift, 0, 100),
      alpha(c2_base)
  );


  // Noise for position and rotation
  let posNoiseX = USE_NOISE ? (noise(noiseX + 30, noiseY + 30) - 0.5) * 2 * JITTER_AMOUNT : random(-JITTER_AMOUNT, JITTER_AMOUNT);
  let posNoiseY = USE_NOISE ? (noise(noiseX + 40, noiseY + 40) - 0.5) * 2 * JITTER_AMOUNT : random(-JITTER_AMOUNT, JITTER_AMOUNT);
  let rotNoise = USE_NOISE ? noise(noiseX + 50, noiseY + 50) * 360 : random([0, 45, 90, 135, 180, 225, 270, 315]);

  push();
  translate(w / 2 + posNoiseX, h / 2 + posNoiseY); // Center motif drawing operations
  rotate(rotNoise);

  noStroke();
  rectMode(CENTER); // Many motifs are easier centered

  // --- Motif Definitions ---

  if (motifType < 0.12) { // Concentric Rects with Gradient
    let steps = 5;
    for(let i = steps; i > 0; i--) {
      let t = i / steps;
      let gradColor = lerpColor(c1, c2, t * t); // Non-linear interpolation
      fill(gradColor);
      rect(0, 0, w * 0.8 * t, h * 0.8 * t, w * 0.1 * t); // Added slight rounding
    }

  } else if (motifType < 0.24) { // Cross / Plus
    fill(c1);
    rect(0, 0, w * 0.8, h * 0.2);
    rect(0, 0, w * 0.2, h * 0.8);
     if (random() > 0.5) { // Center dot
         fill(c2);
         ellipse(0,0, w*0.15, h*0.15);
     }

  } else if (motifType < 0.36) { // Diagonal Lines
    stroke(c1);
    strokeWeight(STROKE_WEIGHT * (USE_NOISE ? (0.5 + noise(noiseX+60, noiseY+60)*1.5) : random(0.8, 1.5)) );
    let numLines = floor(random(3, 7));
    for (let i = 0; i < numLines; i++) {
      let offset = (i / (numLines - 1) - 0.5) * max(w, h) * 0.7;
      line(-w / 2 + offset, -h / 2, w / 2 + offset, h / 2);
       if(random() > 0.8) { // Chance for crossing lines
          stroke(c2);
           line(-w/2 - offset, h/2, w/2 - offset, -h/2);
           stroke(c1); // Switch back
       }
    }
    noStroke();

  } else if (motifType < 0.48) { // Diamond / Lozenge with outline
    fill(c1);
    stroke(c2);
    strokeWeight(STROKE_WEIGHT * 0.7);
    quad(-w * 0.4, 0, 0, -h * 0.4, w * 0.4, 0, 0, h * 0.4);
    noStroke();
     if (random() > 0.6) {
        fill(c2); // Inner detail
        ellipse(0, 0, w*0.2, h*0.2);
     }

  } else if (motifType < 0.60) { // Bezier Curve Motif
      stroke(c1);
      strokeWeight(STROKE_WEIGHT * 1.2);
      noFill();
      let x1 = -w*0.4; let y1 = -h*0.4 + random(-h*0.1, h*0.1);
      let x2 = w*0.4;  let y2 = -h*0.4 + random(-h*0.1, h*0.1);
      let cx1 = 0 + random(-w*0.3, w*0.3); let cy1 = 0 + random(-h*0.4, h*0.4);
      let cx2 = 0 + random(-w*0.3, w*0.3); let cy2 = h*0.4 + random(-h*0.1, h*0.1); // control point near bottom
      bezier(x1,y1, cx1,cy1, cx2,cy2, x2,y2);
      // Maybe a second curve
      if(random() > 0.6) {
          stroke(c2);
          bezier(-w*0.4, h*0.4, cx1,cy1, cx2, cy2, w*0.4, h*0.4); // Mirror y
      }
      noStroke();

  } else if (motifType < 0.72) { // Star Polygon
    fill(c1);
    noStroke();
    let radius1 = w * 0.2;
    let radius2 = w * 0.4;
    let npoints = floor(random(4, 7));
    beginShape();
    for (let a = 0; a < 360; a += 360 / (npoints * 2)) {
      let r = (a / (360 / (npoints*2))) % 2 === 0 ? radius1 : radius2;
      let sx = cos(a) * r;
      let sy = sin(a) * r;
      vertex(sx, sy);
    }
    endShape(CLOSE);

  } else if (motifType < 0.84) { // Simple Weaving Approx
      let weaveDensity = 8;
      strokeWeight(max(w / weaveDensity, 1));
      // Horizontal threads
      stroke(c1);
      for(let i = 0; i < weaveDensity; i+=2) {
          let ypos = map(i, -1, weaveDensity, -h/2, h/2);
          line(-w/2, ypos, w/2, ypos);
      }
      // Vertical threads (drawn over)
      stroke(c2);
       for(let i = 1; i < weaveDensity; i+=2) {
          let xpos = map(i, -1, weaveDensity, -w/2, w/2);
          line(xpos, -h/2, xpos, h/2);
      }
      noStroke();

  } else if (motifType < 0.92 || isBorder) { // Simple Lines (more common in borders)
    stroke(c1);
    strokeWeight(STROKE_WEIGHT * (USE_NOISE ? (0.3 + noise(noiseX+70, noiseY+70)*1.2) : random(0.5, 1.2)) );
     let isHorizontal = random() > 0.5;
     if (isHorizontal) {
        line(-w/2, 0, w/2, 0);
     } else {
        line(0, -h/2, 0, h/2);
     }
     if (random() > 0.5) {
       stroke(c2);
       let offset = (random() - 0.5) * h * 0.4;
       if (isHorizontal) line(-w/2, offset, w/2, offset);
       else line(offset, -h/2, offset, h/2);
     }
    noStroke();

  } else { // Empty / Background Emphasis
    // Do nothing
  }

  rectMode(CORNER); // Reset rectMode just in case
  pop(); // Restore position and rotation
}

// --- Interaction ---

function mousePressed() {
  console.log("Generating new rug...");
  generateNewRug();
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('genuary_15_rug_enhanced_' + noiseSeedValue, 'png');
    console.log("Saved!");
  }
}