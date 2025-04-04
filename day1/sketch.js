let seed, fft, mic; // Changed soundFile to mic
let currentPalette = [];
let palettes = [];
let audioActive = false;
let t = 0;

function preload() {
  // Load color palettes from CSV
  colorsTable = loadTable('colors.csv', 'csv', 'header');
  
  // Removed soundFile loading
}

function setup() {
  createCanvas(800, 800);
  colorMode(RGB, 255);
  seed = random(1000);
  noStroke();
  
  // Process color palettes
  for(let row = 0; row < colorsTable.getRowCount(); row++) {
    let palette = [];
    let cols = colorsTable.getRow(row).arr;
    for(let i = 0; i < cols.length; i += 3) {
      palette.push(color(cols[i], cols[i+1], cols[i+2]));
    }
    palettes.push(palette);
  }
  currentPalette = palettes[0];

  // Initialize microphone input
  mic = new p5.AudioIn();
  
  // Set up FFT and connect it to the microphone input
  fft = new p5.FFT();
  mic.connect(fft); // Connect mic to FFT
}

function draw() {
  background(0);
  noiseSeed(seed);
  
  analyzeBeat();
  drawDensityGradientLayer();
  drawOscillatingLayer();
  drawMutatingPatternLayer();
}

function analyzeBeat() {
  if(!audioActive) return;
  
  // Analyze the frequency spectrum of the song
  let spectrum = fft.analyze();
  
  // Analyze bass frequencies (60Hz - 240Hz)
  let bassEnergy = fft.getEnergy(60, 240);
  let beatThreshold = 155;
  
  // Analyze high frequencies (2000Hz - 5000Hz)
  let highEnergy = fft.getEnergy(300, 1000);
  let highThreshold = 105;
  
  // React to bass beats
  if(bassEnergy > beatThreshold) {
    seed += random(0.1, 0.005);
    t += random(0.05, 0.2);
  }
  
  // React to high-frequency beats
  if(highEnergy > highThreshold) {
    currentPalette = palettes[floor(random(palettes.length))];
  }
}

function drawDensityGradientLayer() {
  for(let x = 0; x < width; x += 1) {
    let density = map(x, 0, width, 0.9, 0.1);
    if(noise(x * 0.1) < density) {
      let colIndex = floor(map(x, 0, width, 0, currentPalette.length));
      let lineColor = currentPalette[colIndex];
      stroke(lineColor);
      line(x, 0, x, height);
    }
  }
}

function drawOscillatingLayer() {
  let centerX = width/2;
  for(let i = 0; i < 150; i++) {
    let offset = noise(i * 0.1, t * 0.3) * 300 - 150;
    let x = centerX + offset;
    let colIndex = floor(map(noise(i * 0.05), 0, 1, 0, currentPalette.length));
    stroke(currentPalette[colIndex]);
    line(x, 0, x, height);
  }
}

function drawMutatingPatternLayer() {
  for(let x = 0; x < width; x += 5) {
    if(noise(x * 0.01, t * 2) > 0.7) {
      let thickness = noise(x * 0.02, t) * 7;
      let colIndex = floor(map(noise(x * 0.005), 0, 1, 0, currentPalette.length));
      stroke(currentPalette[colIndex]);
      strokeWeight(thickness + (audioActive ? map(fft.getEnergy("bass"), 0, 255, 0, 5) : 0));
      line(x, 0, x, height);
    }
  }
}

function mousePressed() {
  seed = random(1000);
  currentPalette = palettes[floor(random(palettes.length))];
  
  if(!audioActive) {
    // Start the audio context and microphone input
    userStartAudio().then(() => {
      mic.start(); // Start microphone input
      audioActive = true;
      console.log("Microphone input started."); // Optional: Log confirmation
    });
  } else {
     // If audio is already active, maybe toggle mic on/off or change palette?
     // For now, just changing palette like before.
     currentPalette = palettes[floor(random(palettes.length))];
  }
}

function keyPressed() {
  if(key >= 1 && key <= 5) {
    currentPalette = palettes[(key - 1) % palettes.length];
  }
}

// Removed the second, redundant keyPressed function that handled soundFile playback
