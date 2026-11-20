// Genuary Day 21: Collision Detection System (Artistic Version)
// Concept: "Ethereal Weave"

let particles = [];
let numParticles = 25;
let boxes = [];
let numBoxes = 12;

let connections = [];
let connectionLifespan = 45; // Slightly longer lifespan for visual effect

let ripples = []; // For collision visual effects

// --- Collision Detection Functions ---
// (Keep the same functions as before)
function checkCircleCircle(c1, c2) { /* ... (same as before) ... */ }
function checkRectRect(r1, r2) { /* ... (same as before) ... */ }
function checkCircleRect(circle, rect) { /* ... (same as before) ... */ }

// Paste the collision functions from the previous version here...
// Circle-Circle Collision
function checkCircleCircle(c1, c2) {
  let dx = c1.x - c2.x;
  let dy = c1.y - c2.y;
  let distanceSq = dx * dx + dy * dy;
  let radiiSum = c1.displayRadius + c2.displayRadius; // Use displayRadius for check
  return distanceSq <= radiiSum * radiiSum;
}

// Rectangle-Rectangle Collision (AABB)
function checkRectRect(r1, r2) {
  let overlapX = abs(r1.x - r2.x) * 2 < (r1.displayW + r2.displayW);
  let overlapY = abs(r1.y - r2.y) * 2 < (r1.displayH + r2.displayH);
  return overlapX && overlapY;
}

// Circle-Rectangle Collision (AABB)
function checkCircleRect(circle, rect) {
  let closestX = constrain(circle.x, rect.x - rect.displayW / 2, rect.x + rect.displayW / 2);
  let closestY = constrain(circle.y, rect.y - rect.displayH / 2, rect.y + rect.displayH / 2);
  let dx = circle.x - closestX;
  let dy = circle.y - closestY;
  let distanceSq = dx * dx + dy * dy;
  return distanceSq < circle.displayRadius * circle.displayRadius; // Use displayRadius
}


// --- Ripple Effect Class ---
class Ripple {
  constructor(x, y, initialRadius, maxRadius, lifespan, col) {
    this.x = x;
    this.y = y;
    this.radius = initialRadius;
    this.maxRadius = maxRadius;
    this.lifespan = lifespan;
    this.initialLifespan = lifespan;
    this.color = col;
  }

  update() {
    this.lifespan--;
    this.radius = lerp(this.radius, this.maxRadius, 0.1); // Smooth expansion
  }

  draw() {
    let alpha = map(this.lifespan, 0, this.initialLifespan, 0, 150); // Fade out
    noFill();
    strokeWeight(map(this.lifespan, 0, this.initialLifespan, 0.5, 2)); // Thin out
    stroke(hue(this.color), saturation(this.color), brightness(this.color), alpha);
    ellipse(this.x, this.y, this.radius * 2);
  }

  isDead() {
    return this.lifespan <= 0;
  }
}


// --- Shape Classes (Modified) ---

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.baseRadius = random(10, 25);
    this.displayRadius = this.baseRadius; // Radius used for drawing and collision
    this.vx = random(-0.8, 0.8);
    this.vy = random(-0.8, 0.8);
    this.baseColor = color(random(180, 260), 70, 90, 180); // Cool colors HSB+Alpha
    this.collisionColor = color(30, 90, 100, 220); // Warm collision color
    this.currentColor = this.baseColor;
    this.colliding = false;
    this.pulseOffset = random(TWO_PI); // For pulsing animation
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.checkEdges();

    // Subtle pulse
    let pulse = sin(frameCount * 0.05 + this.pulseOffset) * 2;
    this.displayRadius = this.baseRadius + pulse;

    if (!this.colliding) {
      this.currentColor = lerpColor(this.currentColor, this.baseColor, 0.08);
    }
    this.colliding = false;
  }

  checkEdges() {
    if (this.x < this.displayRadius || this.x > width - this.displayRadius) {
      this.vx *= -1;
      this.x = constrain(this.x, this.displayRadius, width - this.displayRadius);
    }
    if (this.y < this.displayRadius || this.y > height - this.displayRadius) {
      this.vy *= -1;
      this.y = constrain(this.y, this.displayRadius, height - this.displayRadius);
    }
  }

  markColliding() {
    this.colliding = true;
    this.currentColor = this.collisionColor;
    // Add a ripple effect
    ripples.push(new Ripple(this.x, this.y, this.displayRadius, this.displayRadius * 2.5, 30, this.collisionColor));
  }

  draw() {
    let col = this.currentColor;
    noFill();
    // Outer stroke (softer)
    strokeWeight(3);
    stroke(hue(col), saturation(col) * 0.8, brightness(col), alpha(col) * 0.4);
    ellipse(this.x, this.y, this.displayRadius * 2);
    // Inner stroke (brighter)
    strokeWeight(1.5);
    stroke(hue(col), saturation(col), brightness(col), alpha(col));
    ellipse(this.x, this.y, this.displayRadius * 1.8); // Slightly smaller inner ellipse
  }
}

class Box {
 constructor(x, y) {
    this.x = x;
    this.y = y;
    this.baseW = random(25, 60);
    this.baseH = random(25, 60);
    this.displayW = this.baseW; // Use display sizes for collision/drawing
    this.displayH = this.baseH;
    this.vx = random(-0.7, 0.7);
    this.vy = random(-0.7, 0.7);
    this.baseColor = color(random(200, 300), 60, 80, 160); // Cool colors HSB+Alpha
    this.collisionColor = color(0, 80, 100, 200); // Warm collision color
    this.currentColor = this.baseColor;
    this.colliding = false;
    this.pulseOffset = random(TWO_PI);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.checkEdges();

    // Subtle pulse
    let pulseW = sin(frameCount * 0.04 + this.pulseOffset) * 3;
    let pulseH = cos(frameCount * 0.045 + this.pulseOffset) * 3; // Slightly different rhythm
    this.displayW = this.baseW + pulseW;
    this.displayH = this.baseH + pulseH;


    if (!this.colliding) {
      this.currentColor = lerpColor(this.currentColor, this.baseColor, 0.08);
    }
    this.colliding = false;
  }

   checkEdges() {
    if (this.x < this.displayW / 2 || this.x > width - this.displayW / 2) {
      this.vx *= -1;
       this.x = constrain(this.x, this.displayW / 2, width - this.displayW / 2);
    }
    if (this.y < this.displayH / 2 || this.y > height - this.displayH / 2) {
      this.vy *= -1;
       this.y = constrain(this.y, this.displayH / 2, height - this.displayH / 2);
    }
  }

 markColliding() {
    this.colliding = true;
    this.currentColor = this.collisionColor;
    // Add a ripple effect
    let rippleSize = max(this.displayW, this.displayH) / 2;
    ripples.push(new Ripple(this.x, this.y, rippleSize, rippleSize * 3, 35, this.collisionColor));
 }

  draw() {
    let col = this.currentColor;
    push(); // Isolate transformations
    translate(this.x, this.y);
    // Rotation can be added here if desired: rotate(angle);
    noFill();
     // Outer stroke
    strokeWeight(3);
    stroke(hue(col), saturation(col) * 0.8, brightness(col), alpha(col) * 0.4);
    rect(0, 0, this.displayW, this.displayH);
    // Inner stroke
    strokeWeight(1.5);
    stroke(hue(col), saturation(col), brightness(col), alpha(col));
    rect(0, 0, this.displayW * 0.9, this.displayH * 0.9); // Slightly smaller inner rect
    pop();
  }
}

// --- p5.js Functions ---

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 255);
  rectMode(CENTER);
  ellipseMode(RADIUS); // Still using radius internally

  // Create initial particles & boxes
  for (let i = 0; i < numParticles; i++) {
    particles.push(new Particle(random(width), random(height)));
  }
   for (let i = 0; i < numBoxes; i++) {
    boxes.push(new Box(random(width), random(height)));
  }
}

function draw() {
  // Background with trace effect
  background(10, 5, 15, 40); // Very dark blue/purple, low alpha for trails

  let allShapes = [...particles, ...boxes];

  // 1. Collision Detection Phase
  for (let i = 0; i < allShapes.length; i++) {
    for (let j = i + 1; j < allShapes.length; j++) {
      let shapeA = allShapes[i];
      let shapeB = allShapes[j];
      let hit = false;

      // Determine shape types and call appropriate check
      if (shapeA instanceof Particle && shapeB instanceof Particle) {
        hit = checkCircleCircle(shapeA, shapeB);
      } else if (shapeA instanceof Box && shapeB instanceof Box) {
        hit = checkRectRect(shapeA, shapeB);
      } else { // Circle vs Rect
        let circle = (shapeA instanceof Particle) ? shapeA : shapeB;
        let rect = (shapeA instanceof Box) ? shapeA : shapeB;
        hit = checkCircleRect(circle, rect);
      }

      if (hit) {
        shapeA.markColliding();
        shapeB.markColliding();

        // Add/refresh connection
        let exists = connections.some(conn =>
          (conn.obj1 === shapeA && conn.obj2 === shapeB) ||
          (conn.obj1 === shapeB && conn.obj2 === shapeA)
        );
        if (!exists) {
          connections.push({ obj1: shapeA, obj2: shapeB, lifespan: connectionLifespan });
        } else {
           let existingConn = connections.find(conn =>
             (conn.obj1 === shapeA && conn.obj2 === shapeB) ||
             (conn.obj1 === shapeB && conn.obj2 === shapeA)
           );
           if (existingConn) existingConn.lifespan = connectionLifespan;
        }
        // Basic impulse reaction (optional, can make it jittery)
        simpleImpulse(shapeA, shapeB);
      }
    }
  }

  // 2. Update Phase (Shapes and Effects)
  allShapes.forEach(shape => shape.update());
  for (let i = ripples.length - 1; i >= 0; i--) {
    ripples[i].update();
    if (ripples[i].isDead()) {
      ripples.splice(i, 1);
    }
  }
  for (let i = connections.length - 1; i >= 0; i--) {
     connections[i].lifespan--;
     if (connections[i].lifespan <= 0) {
       connections.splice(i, 1);
     }
   }


  // 3. Draw Phase
  // Draw connections (curved and glowing)
  noFill();
  for (let conn of connections) {
    let alpha = map(conn.lifespan, 0, connectionLifespan, 0, 255);
    let baseWeight = map(conn.lifespan, 0, connectionLifespan, 0.5, 2.5); // Taper thickness

    let x1 = conn.obj1.x;
    let y1 = conn.obj1.y;
    let x2 = conn.obj2.x;
    let y2 = conn.obj2.y;

    // Calculate midpoint and perpendicular offset for bezier control points
    let midX = (x1 + x2) / 2;
    let midY = (y1 + y2) / 2;
    let dx = x2 - x1;
    let dy = y2 - y1;
    let dist = sqrt(dx*dx + dy*dy);
    let offsetX = -dy * 0.15; // Adjust multiplier for curve intensity
    let offsetY = dx * 0.15;

    let ctrlX1 = midX + offsetX;
    let ctrlY1 = midY + offsetY;
    // For symmetry, could use midX - offsetX, midY - offsetY for ctrl2, but using one adds flow
     let ctrlX2 = midX + offsetX * 0.8; // Slightly different control point
     let ctrlY2 = midY + offsetY * 0.8;


    // Draw glow effect (multiple strokes)
    strokeWeight(baseWeight * 3.5); // Wider, dimmer halo
    stroke(30, 90, 100, alpha * 0.3); // Warm color, low alpha
    bezier(x1, y1, ctrlX1, ctrlY1, ctrlX2, ctrlY2, x2, y2);

    strokeWeight(baseWeight * 1.5); // Medium core
    stroke(30, 90, 100, alpha * 0.6);
    bezier(x1, y1, ctrlX1, ctrlY1, ctrlX2, ctrlY2, x2, y2);

    strokeWeight(baseWeight * 0.8); // Brightest thin core
    stroke(50, 5, 100, alpha); // Almost white core
     bezier(x1, y1, ctrlX1, ctrlY1, ctrlX2, ctrlY2, x2, y2);
  }


  // Draw ripples
  ripples.forEach(ripple => ripple.draw());

  // Draw shapes (on top of connections and ripples)
  allShapes.forEach(shape => shape.draw());

}

// Optional: Add shapes on mouse click
function mousePressed() {
    if (random() > 0.5) {
        particles.push(new Particle(mouseX, mouseY));
    } else {
         boxes.push(new Box(mouseX, mouseY));
    }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// --- Helper for basic impulse (Optional) ---
function simpleImpulse(objA, objB) {
    let dx = objB.x - objA.x;
    let dy = objB.y - objA.y;
    let distSq = dx*dx + dy*dy;
    if (distSq === 0) return; // Avoid division by zero if perfectly overlapped

    let dist = sqrt(distSq);
    let normalX = dx / dist;
    let normalY = dy / dist;

    // Minimal push apart - adjust strength (0.05 is very gentle)
    let pushStrength = 0.05;
    objA.vx -= normalX * pushStrength;
    objA.vy -= normalY * pushStrength;
    objB.vx += normalX * pushStrength;
    objB.vy += normalY * pushStrength;
}