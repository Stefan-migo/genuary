let mic;
let fft;
let particles = [];
let numParticles = 200;
let bgAlpha = 10;
let colorOffset = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  colorMode(HSL);
  noStroke();

  // Initialize microphone input
  mic = new p5.AudioIn();
  mic.start();
  
  // Initialize FFT for audio analysis
  fft = new p5.FFT(0.9, 64);
  fft.setInput(mic);

  // Create particles
  for (let i = 0; i < numParticles; i++) {
    particles.push(new Particle());
  }
}

function draw() {
  // Create trailing effect
  fill(0, bgAlpha);
  rect(0, 0, width, height);

  // Analyze audio frequencies
  let spectrum = fft.analyze();
  let waveform = fft.waveform();

  // Update and display particles
  particles.forEach((particle, i) => {
    let freq = spectrum[i % spectrum.length];
    let wave = waveform[i % waveform.length];
    particle.update(freq, wave);
    particle.display();
  });

  // Draw concentric circles responding to bass frequencies
  drawEnergyCircles(spectrum[0]);
  
  // Slowly cycle through colors
  colorOffset = (colorOffset + 0.5) % 360;
}

function drawEnergyCircles(bass) {
  let baseSize = map(bass, 0, 255, 50, 500);
  let opacity = map(bass, 0, 255, 50, 200);
  
  for (let i = 0; i < 5; i++) {
    let size = baseSize * (i + 1);
    let hue = (colorOffset + i * 30) % 360;
    fill(hue, 50, 50, opacity/2);
    ellipse(width/2, height/2, size * 0.8);
    fill(hue, 70, 70, opacity);
    ellipse(width/2, height/2, size * 0.5);
  }
}

class Particle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 5;
    this.target = createVector();
    this.size = random(2, 8);
    this.hue = random(360);
  }

  update(freq, wave) {
    // Calculate audio-reactive forces
    let audioForce = map(freq, 0, 255, 0.1, 2);
    let waveForce = map(wave, -1, 1, -1, 1);
    
    // Update target position based on audio
    this.target = createVector(
      map(sin(frameCount * 0.02 + this.hue), -1, 1, 0, width),
      map(cos(frameCount * 0.02 + this.hue), -1, 1, 0, height)
    );

    // Apply steering force towards target
    let steer = p5.Vector.sub(this.target, this.pos);
    steer.limit(audioForce);
    this.acc.add(steer);
    
    // Add random noise-based movement
    this.acc.add(p5.Vector.random2D().mult(waveForce * 0.2));

    // Update physics
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);

    // Handle edges
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.y < 0) this.pos.y = height;
    if (this.pos.y > height) this.pos.y = 0;

    // Update size based on audio
    this.size = map(freq, 0, 255, 2, 20);
  }

  display() {
    let wave = fft.waveform()[int(map(this.pos.x, 0, width, 0, 512))];
    let hue = (colorOffset + map(wave, -1, 1, -30, 30)) % 360;
    
    // Draw main particle
    fill(hue, 80, 60, 200);
    ellipse(this.pos.x, this.pos.y, this.size);
    
    // Add glow effect
    fill(hue, 50, 90, 50);
    ellipse(this.pos.x, this.pos.y, this.size * 3);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Click to start audio (required by browsers)
function mousePressed() {
  userStartAudio();
}