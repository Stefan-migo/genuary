// Genuary 21: Gradients Only - Gradient Aurora
// By [Your Name/Alias Here] - Based on concept by Chat

let auroraBands = [];
let bgColor1, bgColor2;

// Aurora Color Palettes (feel free to experiment!)
const palettes = [
  // Classic Greens
  [ [0, 150, 100], [50, 255, 150], [100, 255, 200] ],
  // Pink/Purple Hues
  [ [280, 80, 80], [300, 100, 100], [330, 90, 100] ],
  // Cyan/Green Mix
  [ [160, 100, 80], [180, 255, 200], [140, 255, 180] ],
  // Multi-color (more complex gradients)
  [ [240, 80, 90], [150, 100, 100], [50, 100, 100] ],
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100); // Hue, Saturation, Brightness, Alpha
  noStroke();

  // Background gradient colors
  bgColor1 = color(240, 60, 30); // Deep Blue/Purple
  bgColor2 = color(240, 40, 5);  // Near Black

  // Initial burst of bands
  for (let i = 0; i < 5; i++) {
      auroraBands.push(new AuroraBand());
  }
}

function draw() {
  // 1. Draw the background gradient (manually)
  drawVerticalGradient(0, 0, width, height, bgColor1, bgColor2);

  // 2. Additive blending for light effect
  blendMode(ADD);

  // 3. Update and display aurora bands
  for (let i = auroraBands.length - 1; i >= 0; i--) {
    let band = auroraBands[i];
    band.update();
    band.display();
    if (band.isDone()) {
      auroraBands.splice(i, 1); // Remove dead bands
    }
  }

  // 4. Reset blend mode for next frame's background
  blendMode(BLEND);

  // 5. Occasionally spawn new bands
  if (random(1) < 0.03 && auroraBands.length < 15) { // Control spawn rate and max bands
    auroraBands.push(new AuroraBand());
  }
}

// Function to draw a vertical gradient using thin rectangles
function drawVerticalGradient(x, y, w, h, c1, c2) {
  push();
  noStroke();
  for (let i = y; i <= y + h; i++) {
    let inter = map(i, y, y + h, 0, 1);
    let c = lerpColor(c1, c2, inter);
    fill(c);
    rect(x, i, w, 1); // Draw thin horizontal strips
  }
  pop();
}


// AuroraBand Class
class AuroraBand {
  constructor() {
    this.x = random(width * -0.1, width * 1.1); // Allow starting off-screen
    this.y = 0; // Start at the top
    this.maxHeight = random(height * 0.6, height * 0.95);
    this.currentHeight = 0; // Starts invisible and grows
    this.maxWidth = random(width * 0.1, width * 0.5); // Max width it can shimmer to
    this.baseWidth = this.maxWidth * random(0.3, 0.6); // Average width

    // Choose a random palette and colors
    let palette = random(palettes);
    this.c1 = color(palette[0][0], palette[0][1], palette[0][2]);
    this.c2 = color(palette[1][0], palette[1][1], palette[1][2]);
    // Optional third color for more complex gradient
    this.c3 = random(1) > 0.5 ? color(palette[2][0], palette[2][1], palette[2][2]) : this.c2;

    this.alpha = 0; // Start transparent
    this.maxAlpha = random(40, 80); // Max opacity (keep it ethereal)
    this.lifespan = random(300, 600); // Frames to live
    this.age = 0;

    // Noise parameters for shimmering
    this.noiseOffsetX = random(1000);
    this.noiseOffsetY = random(1000);
    this.noiseScaleX = random(0.005, 0.015);
    this.noiseScaleY = random(0.008, 0.02);
    this.noiseSpeed = random(0.005, 0.01);

    // Phase: 0=fading in, 1=living, 2=fading out
    this.phase = 0;
    this.fadeInSpeed = random(1, 3);
    this.fadeOutSpeed = random(0.5, 1.5);
    this.driftSpeed = random(-0.5, 0.5); // Slow horizontal drift
  }

  update() {
    this.age++;
    this.x += this.driftSpeed;

    // Phase handling (fade in, live, fade out)
    if (this.phase === 0) { // Fading in
      this.alpha = lerp(this.alpha, this.maxAlpha, 0.1);
      this.currentHeight = lerp(this.currentHeight, this.maxHeight, 0.08);
      if (abs(this.alpha - this.maxAlpha) < 1 && abs(this.currentHeight - this.maxHeight) < 5) {
        this.alpha = this.maxAlpha;
        this.currentHeight = this.maxHeight;
        this.phase = 1; // Transition to living phase
      }
    } else if (this.phase === 1) { // Living
        if (this.age > this.lifespan * 0.7) { // Start fading out in the last 30% of life
            this.phase = 2;
        }
    } else if (this.phase === 2) { // Fading out
      this.alpha = lerp(this.alpha, 0, 0.05);
      // Optional: Could also shrink height here
    }

    // Keep track of noise offsets over time
    this.noiseOffsetX += this.noiseSpeed;
    this.noiseOffsetY += this.noiseSpeed; // Add vertical dimension to noise evolution
  }

  display() {
    push();
    // Iterate vertically to draw gradient segments
    for (let y = this.y; y < this.y + this.currentHeight; y++) {
      // Map current y to gradient interpolation factor (0 to 1)
      let inter = map(y, this.y, this.y + this.currentHeight, 0, 1);

      // Interpolate color (can be 2-step or 3-step)
      let col;
      if (inter < 0.5) {
        col = lerpColor(this.c1, this.c2, map(inter, 0, 0.5, 0, 1));
      } else {
        col = lerpColor(this.c2, this.c3, map(inter, 0.5, 1, 0, 1));
      }

      // Calculate shimmer using Perlin noise
      // Noise input uses both y-position and time (noiseOffsetX)
      let noiseValX = noise(this.noiseOffsetX + y * this.noiseScaleY, this.noiseOffsetY);
      let noiseValW = noise(this.noiseOffsetX + y * this.noiseScaleY + 10, this.noiseOffsetY + 10); // Different noise for width

      // Map noise to horizontal offset and width variation
      let xOffset = map(noiseValX, 0, 1, -this.maxWidth * 0.4, this.maxWidth * 0.4);
      let segmentWidth = this.baseWidth + map(noiseValW, 0, 1, -this.baseWidth * 0.5, this.maxWidth - this.baseWidth);

      // Calculate final position and apply alpha
      let currentX = this.x + xOffset;
      let currentAlpha = this.alpha * (1.0 - pow(inter, 3)); // Fade out towards bottom edge slightly
      col.setAlpha(currentAlpha);

      // Draw the thin horizontal segment
      fill(col);
      rect(currentX - segmentWidth / 2, y, segmentWidth, 1); // Centered segment
    }
    pop();
  }

  isDone() {
    // Consider done if completely faded or moved way off-screen
    return (this.phase === 2 && this.alpha < 0.1) || this.x < -this.maxWidth * 2 || this.x > width + this.maxWidth * 2;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Re-calculate background colors if needed (though not strictly necessary here)
  bgColor1 = color(240, 60, 30);
  bgColor2 = color(240, 40, 5);
}