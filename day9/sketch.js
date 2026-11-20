// Genuary Day 9: Public Transport Seat Textiles
// Mockup version: Applying the pattern to a seat shape.

let palette;
let tileSize = 60; // Adjusted tile size for potentially finer pattern on seat
let textureGraphics; // Offscreen buffer for texture
let patternBuffer;   // Offscreen buffer for the generated pattern
let seatMaskBuffer; // Offscreen buffer for the seat mask

function setup() {
  createCanvas(800, 800);
  pixelDensity(2);
  noLoop();

  // --- Palette Definition --- (Same as before)
  palette = [
    color(40, 50, 60),    // Dark Grey-Blue
    color(0, 80, 100),    // Muted Dark Blue
    color(190, 70, 85),   // Teal-ish Blue
    color(250, 90, 70),    // Burnt Orange / Reddish (adjusted slightly brighter)
    color(60, 10, 95),    // Light Grey / Beige (adjusted slightly darker)
    // color(280, 30, 50) // Optional weird purple/mauve
  ];
  // colorMode(HSB, 360, 100, 100, 100); // Use if you uncomment HSB palette below
  // palette = [
  //   color(210, 30, 25),  // Dark Grey-Blue
  //   color(200, 100, 40), // Muted Dark Blue
  //   color(185, 35, 85),  // Teal-ish Blue
  //   color(15, 70, 98),   // Burnt Orange
  //   color(45, 5, 98),    // Light Grey / Beige
  // ];

  // --- Create Buffers ---
  patternBuffer = createGraphics(width, height);
  seatMaskBuffer = createGraphics(width, height);
  textureGraphics = createGraphics(width, height);

  // Generate the texture (same as before)
  generateTexture();

  // Generate the pattern onto its buffer
  generatePatternOnBuffer(patternBuffer);

  // Create the seat mask shape
  createSeatMask(seatMaskBuffer);
}

function draw() {
  // --- Draw Mockup Background ---
  // Simple gradient or color suggesting interior
  drawBackgroundGradient();

  // --- Draw Seat Structure (Optional) ---
  // e.g., a subtle frame or darker shapes behind the pattern area
  drawSeatStructure();

  // --- Apply Mask and Draw Patterned Seat ---
  let patternImage = patternBuffer.get(); // Get the pattern as an image
  let maskImage = seatMaskBuffer.get();   // Get the mask as an image
  patternImage.mask(maskImage);          // Apply the mask to the pattern image

  image(patternImage, 0, 0); // Draw the masked pattern (now looks like a seat)

  // --- Add Texture Overlay ---
  // Apply texture over everything, including the seat
  blendMode(OVERLAY);
  image(textureGraphics, 0, 0);
  blendMode(BLEND); // Reset blend mode
}

// --- Helper Functions ---

function generateTexture() {
  // (Same texture generation code as before)
  textureGraphics.loadPixels();
  let d = pixelDensity();
  let noiseIntensity = 60; // Slightly reduced intensity might look better on mockup
  for (let x = 0; x < textureGraphics.width * d; x++) {
    for (let y = 0; y < textureGraphics.height * d; y++) {
      let index = (x + y * textureGraphics.width * d) * 4;
      let noiseVal = (random(255) - 127) * noiseIntensity / 255;
      textureGraphics.pixels[index] = 127 + noiseVal;     // R
      textureGraphics.pixels[index + 1] = 127 + noiseVal; // G
      textureGraphics.pixels[index + 2] = 127 + noiseVal; // B
      textureGraphics.pixels[index + 3] = 25;             // Alpha (subtle)
    }
  }
  textureGraphics.updatePixels();
}

function generatePatternOnBuffer(buffer) {
  // --- Draw the pattern onto the provided buffer ---
  buffer.background(palette[0]); // Base color for the pattern area

  let gridCols = ceil(buffer.width / tileSize);
  let gridRows = ceil(buffer.height / tileSize);
  let startOffsetX = random(-tileSize * 0.2, tileSize * 0.2);
  let startOffsetY = random(-tileSize * 0.2, tileSize * 0.2);

  for (let y = -1; y <= gridRows; y++) {
    for (let x = -1; x <= gridCols; x++) {
      let xPos = x * tileSize + startOffsetX;
      let yPos = y * tileSize + startOffsetY;
      let jitterX = random(-tileSize * 0.03, tileSize * 0.03);
      let jitterY = random(-tileSize * 0.03, tileSize * 0.03);

      buffer.push();
      buffer.translate(xPos + jitterX, yPos + jitterY);
      // buffer.rotate(random(-0.02, 0.02)); // Optional rotation
      drawTransportMotif(buffer, tileSize); // Pass buffer to drawing function
      buffer.pop();
    }
  }
}

function createSeatMask(buffer) {
  // --- Draw the white seat shape onto the mask buffer ---
  buffer.background(0); // Mask background is black (transparent area)
  buffer.fill(255);     // Mask shape is white (opaque area)
  buffer.noStroke();
  buffer.rectMode(CENTER);

  // Define seat dimensions (adjust these values to change the seat shape)
  let seatCenterX = width / 2;
  let backrestTopY = height * 0.15;
  let backrestBottomY = height * 0.55;
  let backrestWidth = width * 0.45;
  let backrestHeight = backrestBottomY - backrestTopY;

  let seatBaseTopY = backrestBottomY;
  let seatBaseBottomY = height * 0.85;
  let seatBaseWidth = width * 0.55; // Slightly wider base
  let seatBaseHeight = seatBaseBottomY - seatBaseTopY;

  let cornerRadius = 40;

  // Draw Backrest shape
  buffer.rect(seatCenterX, backrestTopY + backrestHeight / 2, backrestWidth, backrestHeight, cornerRadius, cornerRadius, cornerRadius * 0.5, cornerRadius * 0.5);

  // Draw Seat Base shape
  buffer.rect(seatCenterX, seatBaseTopY + seatBaseHeight / 2, seatBaseWidth, seatBaseHeight, cornerRadius * 0.5, cornerRadius * 0.5, cornerRadius, cornerRadius);

  buffer.rectMode(CORNER); // Reset rectMode
}

function drawSeatStructure() {
  // --- Draw subtle elements suggesting the seat frame/structure ---
  // Drawn on the main canvas
  rectMode(CENTER);
  noFill();
  stroke(20, 20, 25, 150); // Dark semi-transparent color
  strokeWeight(15); // Thickish line for frame effect

  // Replicate seat dimensions from createSeatMask
  let seatCenterX = width / 2;
  let backrestTopY = height * 0.15;
  let backrestBottomY = height * 0.55;
  let backrestWidth = width * 0.45;
  let backrestHeight = backrestBottomY - backrestTopY;

  let seatBaseTopY = backrestBottomY;
  let seatBaseBottomY = height * 0.85;
  let seatBaseWidth = width * 0.55;
  let seatBaseHeight = seatBaseBottomY - seatBaseTopY;
  let cornerRadius = 40;

  // Slightly offset or larger rects for the frame effect
  let offset = 8;
  strokeWeight(15);
  stroke(20, 20, 25, 100);
  rect(seatCenterX, backrestTopY + backrestHeight / 2 + offset, backrestWidth + offset, backrestHeight + offset, cornerRadius, cornerRadius, cornerRadius * 0.5, cornerRadius * 0.5);
  rect(seatCenterX, seatBaseTopY + seatBaseHeight / 2 + offset, seatBaseWidth + offset, seatBaseHeight + offset, cornerRadius * 0.5, cornerRadius * 0.5, cornerRadius, cornerRadius);

  // You could add lines for legs, etc., if desired
  // stroke(50, 50, 55);
  // strokeWeight(10);
  // line(seatCenterX - seatBaseWidth * 0.4, seatBaseBottomY, seatCenterX - seatBaseWidth * 0.4, height - 20);
  // line(seatCenterX + seatBaseWidth * 0.4, seatBaseBottomY, seatCenterX + seatBaseWidth * 0.4, height - 20);

  rectMode(CORNER); // Reset rectMode
  noStroke(); // Reset stroke
}

function drawBackgroundGradient() {
    // --- Simple background gradient ---
    let topColor = color(230, 235, 240); // Light grey/blue
    let bottomColor = color(180, 190, 200); // Darker grey/blue
    for(let y=0; y<height; y++){
        let inter = map(y, 0, height, 0, 1);
        let c = lerpColor(topColor, bottomColor, inter);
        stroke(c);
        line(0, y, width, y);
    }
    noStroke(); // Reset stroke
}


// --- PATTERN DRAWING FUNCTION (Modified) ---
// Now accepts a 'buffer' argument to draw onto
function drawTransportMotif(buffer, size) {
  // Use buffer.fill, buffer.stroke, buffer.rect etc.
  let strokeWeightBase = size * 0.05;
  buffer.noStroke();

  // Background Shape Layer
  buffer.fill(randomFromPalette([palette[1], palette[4]]));
  buffer.beginShape();
  buffer.curveVertex(size * random(0.1, 0.3), size * random(0.1, 0.3));
  buffer.curveVertex(size * random(0.1, 0.3), size * random(0.1, 0.3));
  buffer.curveVertex(size * random(0.7, 0.9), size * random(0.1, 0.4));
  buffer.curveVertex(size * random(0.6, 0.9), size * random(0.7, 0.9));
  buffer.curveVertex(size * random(0.1, 0.4), size * random(0.6, 0.9));
  buffer.curveVertex(size * random(0.1, 0.3), size * random(0.1, 0.3));
  buffer.curveVertex(size * random(0.1, 0.3), size * random(0.1, 0.3));
  buffer.endShape(CLOSE);

  // Middle Layer - Lines / Curves
  buffer.strokeWeight(strokeWeightBase * random(0.8, 1.5));
  buffer.stroke(randomFromPalette([palette[2], palette[3]]));
  buffer.noFill();
  for (let i = 0; i < 2; i++) {
    let startX = size * random(0.1, 0.9); let startY = size * random(0.1, 0.9);
    let cp1X = size * random(0, 1); let cp1Y = size * random(0, 1);
    let cp2X = size * random(0, 1); let cp2Y = size * random(0, 1);
    let endX = size * random(0.1, 0.9); let endY = size * random(0.1, 0.9);
    buffer.bezier(startX, startY, cp1X, cp1Y, cp2X, cp2Y, endX, endY);
  }
  buffer.strokeWeight(strokeWeightBase * random(0.5, 1));
  buffer.stroke(randomFromPalette(palette));
  let numLines = floor(random(1, 4));
  for(let i = 0; i < numLines; i++) {
    if (random() > 0.5) {
       buffer.line(size * random(0, 0.5), 0, size * random(0.5, 1), size);
    } else {
       buffer.line(size * random(0.5, 1), 0, size * random(0, 0.5), size);
    }
  }

  // Top Layer - Small Accent Shapes
  buffer.noStroke();
  buffer.fill(randomFromPalette([palette[3], palette[4], palette[2]]));
  let numShapes = floor(random(1, 5));
  for (let i = 0; i < numShapes; i++) {
    let shapeSize = size * random(0.1, 0.25);
    let shapeX = size * random(0.1, 0.9);
    let shapeY = size * random(0.1, 0.9);
    if (random() > 0.5) {
      buffer.ellipse(shapeX, shapeY, shapeSize, shapeSize);
    } else {
      buffer.rectMode(CENTER);
      buffer.push();
      buffer.translate(shapeX, shapeY);
      buffer.rotate(random(-PI / 4, PI / 4));
      buffer.rect(0, 0, shapeSize, shapeSize, shapeSize * random(0.1, 0.5));
      buffer.pop();
      buffer.rectMode(CORNER);
    }
  }
}

// --- UTILITY FUNCTIONS (Unchanged) ---

function randomFromPalette(paletteSubset = palette) {
  return paletteSubset[floor(random(paletteSubset.length))];
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('transport_seat_mockup', 'png');
    print("Canvas saved!");
  }
   if (key === 'r' || key === 'R') {
    // Re-generate pattern and redraw
    generatePatternOnBuffer(patternBuffer);
    createSeatMask(seatMaskBuffer); // Recreate mask in case dimensions change later
    loop(); // Trigger draw() once
    noLoop(); // Stop loop again
    print("Pattern regenerated!");
  }
}