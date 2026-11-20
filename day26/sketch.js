let numSegments = 6; // Initial number of symmetry segments
let currentHue = 0; // For cycling colors
let currentStrokeWeight = 2;
let useTrails = true;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0); // Start with a black background
  noCursor(); // Hide the cursor for a cleaner look
  colorMode(HSB, 360, 100, 100, 100); // Use HSB color mode (Hue, Saturation, Brightness, Alpha)
  angleMode(DEGREES); // Use degrees for rotation
  strokeWeight(currentStrokeWeight);
  // Initial instructions are in HTML, but you could draw them here too
}

function draw() {
  // --- Handle Trails ---
  if (useTrails) {
    // Draw a semi-transparent background to create fading trails
    // Adjust the alpha value (last parameter) for trail length (lower = longer trails)
    background(0, 0, 0, 5); // Black with low alpha
  }

  // --- Drawing Logic ---
  if (mouseIsPressed && mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    // Get current and previous mouse positions
    let mx = mouseX;
    let my = mouseY;
    let pmx = pmouseX;
    let pmy = pmouseY;

    // Calculate center
    let centerX = width / 2;
    let centerY = height / 2;

    // Calculate the angle for each segment
    let angleStep = 360 / numSegments;

    // Update the hue slightly each frame mouse is pressed
    currentHue = (currentHue + 0.5) % 360;
    let saturation = 85; // Keep saturation high
    let brightness = 95; // Keep brightness high
    stroke(currentHue, saturation, brightness);
    strokeWeight(currentStrokeWeight);

    // --- Apply Symmetry ---
    push(); // Isolate transformations
    translate(centerX, centerY); // Move origin to the center

    for (let i = 0; i < numSegments; i++) {
      // Rotate for the current segment
      rotate(angleStep);

      // --- Draw the line in the current segment ---
      // We need coordinates relative to the new center origin
      let currentX = mx - centerX;
      let currentY = my - centerY;
      let previousX = pmx - centerX;
      let previousY = pmy - centerY;

      line(currentX, currentY, previousX, previousY);

      // --- Draw the reflection within the segment ---
      // Reflect across the segment's axis by scaling Y by -1
      push(); // Isolate reflection transformation
      scale(1, -1); // Reflect vertically (relative to current rotation)
      line(currentX, currentY, previousX, previousY);
      pop(); // Restore scale
    }

    pop(); // Restore original transformations (origin back to top-left)
  }
}

function keyPressed() {
  // --- Controls ---

  // Save Canvas
  if (key === 's' || key === 'S') {
    saveCanvas('symmetry_creation_' + nf(numSegments) + 'fold', 'png');
    console.log("Saved symmetry_creation.png");
  }

  // Clear Canvas
  if (key === 'c' || key === 'C') {
    background(0); // Reset background
    console.log("Canvas cleared");
  }

  // Toggle Trails
  if (key === 't' || key === 'T') {
    useTrails = !useTrails;
    if (!useTrails) {
      background(0); // Clear immediately if trails are turned off
    }
    console.log("Trails toggled:", useTrails);
  }

  // Change Number of Segments (Keys 2 through 9)
  if (key >= '2' && key <= '9') {
    numSegments = int(key); // Convert key character ('2', '3', etc.) to integer
    background(0); // Clear canvas when changing symmetry
    console.log("Symmetry segments set to:", numSegments);
  }

  // Adjust Stroke Weight
  if (key === '+' || key === '=') { // Include '=' for keyboards without numpad +
    currentStrokeWeight = min(currentStrokeWeight + 1, 20); // Increase, max 20
    console.log("Stroke weight:", currentStrokeWeight);
  }
  if (key === '-' || key === '_') {
    currentStrokeWeight = max(currentStrokeWeight - 1, 1); // Decrease, min 1
    console.log("Stroke weight:", currentStrokeWeight);
  }
}

// Adjust canvas size when window is resized
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0); // Clear canvas on resize
}