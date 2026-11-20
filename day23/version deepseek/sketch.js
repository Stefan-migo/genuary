const CANVAS_SIZE = 800;
const MODULE_COUNT = 12;
const MODULE_SIZE = 120;
const SHADOW_OFFSET = 15;
const ENERGY_COLOR = [200, 70, 50];

let modules = [];
let brutalParticles = [];
let globalRotation = 0;

class BrutalModule {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.rotation = random(TWO_PI);
    this.type = random(['panel', 'column', 'beam', 'void']);
    this.color = random([
      color(40), 
      color(80), 
      color(120),
      color(...ENERGY_COLOR)
    ]);
    this.scale = random(0.8, 1.2);
    this.offsetX = random(-20, 20);
    this.offsetY = random(-20, 20);
  }

  display() {
    push();
    translate(this.x + this.offsetX, this.y + this.offsetY);
    
    // Enhanced shadow with subtle movement
    fill(30, 30, 30, 150);
    noStroke();
    rect(
      SHADOW_OFFSET * sin(globalRotation),
      SHADOW_OFFSET * cos(globalRotation),
      MODULE_SIZE * 0.9 * this.scale,
      MODULE_SIZE * 0.9 * this.scale,
      4
    );

    rotate(this.rotation);
    fill(this.color);
    stroke(30);
    strokeWeight(2);

    switch(this.type) {
      case 'panel':
        this.drawPanel();
        break;
      case 'column':
        this.drawColumn();
        break;
      case 'beam':
        this.drawBeam();
        break;
      case 'void':
        this.drawVoid();
        break;
    }

    pop();
  }

  drawPanel() {
    let s = MODULE_SIZE * 0.9 * this.scale;
    rect(0, 0, s, s, 4);
    line(-s/3, -s/3, s/3, s/3);
  }

  drawColumn() {
    let h = MODULE_SIZE * 1.4 * this.scale;
    rect(-MODULE_SIZE/6, -h/2, MODULE_SIZE/3, h);
    for(let i = -2; i <= 2; i++) {
      line(i * 8, -h/2, i * 8, h/2);
    }
  }

  drawBeam() {
    let w = MODULE_SIZE * 1.6 * this.scale;
    rect(-w/2, -MODULE_SIZE/4, w, MODULE_SIZE/2);
    for(let x = -w/2 + 10; x < w/2; x += 20) {
      line(x, -MODULE_SIZE/4, x, MODULE_SIZE/4);
    }
  }

  drawVoid() {
    let s = MODULE_SIZE * 0.7 * this.scale;
    let depth = map(sin(frameCount * 0.05), -1, 1, 5, 20);
    drawingContext.shadowBlur = depth;
    drawingContext.shadowColor = color(...ENERGY_COLOR);
    rect(0, 0, s, s);
  }
}

class BrutalParticle {
  constructor(x, y) {
    this.x = x || random(width);
    this.y = y || random(height);
    this.angle = random(TWO_PI);
    this.radius = random(50, CANVAS_SIZE/3);
    this.speed = random(0.01, 0.03);
    this.weight = random(1, 4);
    this.life = random(100, 200);
  }

  update() {
    this.angle += this.speed;
    this.x = width/2 + cos(this.angle) * this.radius;
    this.y = height/2 + sin(this.angle) * this.radius;
    this.life--;
  }

  display() {
    stroke(...ENERGY_COLOR, this.life/2);
    strokeWeight(this.weight);
    point(this.x, this.y);
    
    // Subtle trail effect
    if(this.life > 50) {
      noFill();
      stroke(...ENERGY_COLOR, this.life/4);
      circle(this.x, this.y, this.weight * 3);
    }
  }
}

function setup() {
  createCanvas(CANVAS_SIZE, CANVAS_SIZE);
  angleMode(RADIANS);
  rectMode(CENTER);
  generateComposition();
}

function draw() {
  background(220, 210, 200);
  
  globalRotation += 0.002;

  // Draw particles first (behind modules)
  for(let i = brutalParticles.length - 1; i >= 0; i--) {
    brutalParticles[i].update();
    brutalParticles[i].display();
    if(brutalParticles[i].life <= 0) {
      brutalParticles.splice(i, 1);
    }
  }

  // Draw modules
  modules.forEach(module => {
    module.display();
  });

  // Random module rotation
  if(frameCount % 60 === 0 && random() < 0.2) {
    modules[floor(random(modules.length))].rotation += HALF_PI;
  }

  // Add subtle vignette
  drawingContext.globalCompositeOperation = 'multiply';
  noStroke();
  fill(40, 40, 50, 20);
  rect(0, 0, width, height);
  drawingContext.globalCompositeOperation = 'source-over';
}

function generateComposition() {
  modules = [];
  brutalParticles = [];
  
  // Create organic layout along bottom half
  for(let i = 0; i < MODULE_COUNT; i++) {
    let x = random(width * 0.1, width * 0.9);
    let y = random(height * 0.5, height * 0.9);
    modules.push(new BrutalModule(x, y));
  }

  // Add particles
  for(let i = 0; i < 30; i++) {
    brutalParticles.push(new BrutalParticle());
  }
}

function mouseClicked() {
  generateComposition();
}

function keyPressed() {
  if(key === ' ') {
    generateComposition();
  }
}