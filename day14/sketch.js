// Genuary 2024 - Day 14: Pure black and white. No gray.
// Recursive Branching Structure

let angleOffsetA; // Random offset for branch angle A
let angleOffsetB; // Random offset for branch angle B
let lengthRatioA; // Random ratio for branch length A
let lengthRatioB; // Random ratio for branch length B
let baseStrokeWeight; // Initial thickness

function setup() {
  createCanvas(windowWidth, windowHeight);
  // Crucial for pure black and white - disables anti-aliasing
  noSmooth(); 
  
  // Set up initial random parameters for this generation
  resetParameters();
  
  // Draw the initial structure
  drawStructure();
  
  // Add instruction text (pure black)
  fill(0);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(14);
  text("Click to regenerate", width / 2, height - 30);
}

// We don't need draw() to loop continuously for this static piece
// function draw() {
// } 

function mousePressed() {
  // Regenerate parameters and redraw on mouse click
  resetParameters();
  drawStructure();
  
  // Redraw instruction text
  fill(0);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(14);
  text("Click to regenerate", width / 2, height - 30);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    // Optional: Redraw on resize if desired, otherwise it might crop
    resetParameters(); // Get new params appropriate for potentially new size ratios
    drawStructure();

    // Redraw instruction text
    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(14);
    text("Click to regenerate", width / 2, height - 30);
}


function resetParameters() {
  // Introduce randomness for variety in each generation
  angleOffsetA = random(PI / 5, PI / 9); // Angle deviation for branch A (15 to 60 degrees)
  angleOffsetB = random(PI / 12, PI / 3); // Angle deviation for branch B (15 to 60 degrees)
  lengthRatioA = random(0.65, 0.8);   // Length reduction factor for branch A
  lengthRatioB = random(0.65, 0.8);   // Length reduction factor for branch B
  baseStrokeWeight = random(4, 12);   // Starting thickness
}

function drawStructure() {
  // Set white background
  background(255); 
  
  // Set stroke color to black
  stroke(0); 
  
  // Start the recursive branching process from the bottom center
  let startLength = height * random(0.2, 0.35); // Initial branch length based on height
  push(); // Isolate transformations
  translate(width / 2, height); // Move origin to bottom center
  branch(startLength, baseStrokeWeight); // Start the first branch
  pop(); // Restore transformations
}

// Recursive function to draw branches
function branch(len, sw) {
  // Set the thickness for this branch segment
  strokeWeight(max(1, sw)); // Ensure stroke weight is at least 1

  // Draw the line segment (upwards, angle 0 relative to current orientation)
  line(0, 0, 0, -len); 

  // Move to the end of the branch
  translate(0, -len);

  // Recursive step:
  // Stop recursion if length is too small
  if (len > 4) { 
    // Branch A
    push(); // Save current transformation state
    rotate(angleOffsetA + random(-PI/18, PI/18)); // Rotate for branch A with slight extra randomness
    branch(len * lengthRatioA, sw * 0.7); // Recursive call for branch A
    pop(); // Restore transformation state

    // Branch B
    push(); // Save current transformation state
    rotate(-angleOffsetB + random(-PI/18, PI/18)); // Rotate for branch B with slight extra randomness
    branch(len * lengthRatioB, sw * 0.7); // Recursive call for branch B
    pop(); // Restore transformation state
  }
}