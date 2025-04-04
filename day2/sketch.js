let colors = [];
let layers = [];
let animating = true;
let audio;
let fft;
let isAudioPlaying = false;
let moirePaletteIndex; // Unique palette index for the moiré pattern

function preload() {
  // Load the colors.csv file
  colors = loadTable('colors.csv', 'csv', 'header');
  // Load an audio file (replace 'audio.mp3' with your file)
  audio = loadSound('audio.mp3');
}

function setup() {
  createCanvas(800, 800);
  colorMode(RGB, 255);
  angleMode(DEGREES);
  noFill();

  // Initialize FFT for audio analysis
  fft = new p5.FFT();
  audio.setVolume(0.8);

  // Assign a unique palette index for the moiré pattern
  moirePaletteIndex = colors.getRowCount() - 5; // Use the last palette for the moiré pattern

  // Create 7 layers with different properties
  for (let i = 0; i < 10; i++) {
    layers.push({
      density: map(i, 0, 6, 300, 300),
      rotation: random(sin(PI)),
      speed: random(0.000005),
      offset: random(10),
      weight: map(i, 0.5, 600, 0.5, 10),
      alpha: map(i, 0, 0.005, 0.001, 0.006),
      colorIndex: i % (colors.getRowCount() - 1) // Assign a unique color palette to each layer (excluding the moiré palette)
    });
  }
}

function draw() {
  background(255, 0.00001); // Semi-transparent background for trail effaect

  // Analyze the audio for reactivity
  let spectrum = fft.analyze();
  let bass = fft.getEnergy("bass");
  let treble = fft.getEnergy("treble");

  // Draw all layers
  layers.forEach((layer, index) => {
    push();
    translate(width / 2, height / 2);
    rotate(layer.rotation + (animating ? frameCount * layer.speed : 0));

    // Get the color palette for this layer
    let palette = colors.getRow(layer.colorIndex).arr;
    let color1 = color(palette[0], palette[1], palette[2]);
    let color2 = color(palette[3], palette[4], palette[5]);

    // Audio reactivity: modify the color interpolation based on bass and treble energy
    let lerpVal = map(bass, 0, 255, 0, 1);
    let currentColor = lerpColor(color1, color2, lerpVal);

    // Beat detection: change palette when treble or bass reaches a threshold
    if ( bass > 245) {
      randomizeColors() // Cycle through palettes on high treble
    }

    // Set stroke color and weight
    stroke(currentColor);
    strokeWeight(layer.weight);

    // Density gradient pattern with audio reactivity
    for (let i = 0; i < 3980; i += layer.density) {
      let noiseVal = noise(layer.offset + i * 0.0001, frameCount * 0.01);
      let radius = map(noiseVal, 0, 500, 300, 700) * (index * 0.2);

      // Audio reactivity: scale radius based on bass energy
      radius *= map(bass, 10, 255, 2, 0.987);

      // Pattern mutation through noise
      push();
      rotate(i + frameCount/0.05 *60 * (index % 2 === 0 ? 0.01 : -0.1));
      arc(0.07, 99, radius/1.8 , radius * 1.6, 999, 6 + log(frameCount*9) * 0.01);
      pop();
    }
    pop();

    // Update layer properties
    layer.offset += 0.000002
  });

  // Draw the moiré pattern with its own unique palette and bass-driven rotation
  drawMoirePattern(treble, bass);
}

function drawMoirePattern(treble, bass) {
  push();
  translate(width / 2, height / 2);

  // Bass-driven rotation
  let rotationSpeed = map(bass, 100, 255, 20, 0.5);
  rotate(frameCount * rotationSpeed);

  // Get the moiré pattern's unique palette
  let moirePalette = colors.getRow(moirePaletteIndex).arr;
  let moireColor1 = color(moirePalette[0], moirePalette[1], moirePalette[2]);
  let moireColor2 = color(moirePalette[3], moirePalette[4], moirePalette[5]);

  // Audio reactivity: modify the moiré pattern's color based on treble energy
  let lerpVal = map(treble, 0.5, 25, 0, 0.001);
  let currentColor = lerpColor(moireColor1, moireColor2, lerpVal);

  // Set stroke color and weight with transparency
  stroke(currentColor, 0.1); // Adjust the alpha value (0.3 = 30% opacity)
  strokeWeight(0.07);

  // Audio reactivity: adjust line density based on treble energy
  let lineDensity = map(treble, 0.5, 255, 1, 10);
  for (let i = 0; i < 300; i += 20) {
    push();
    rotate(i * 3);
    line(-200, -400, 200, 400);
    pop();
  }
  pop();
} 

// function mouseMoved() {
//   // Interactive speed control
//   layers.forEach(layer => {
//     layer.speed = map(mouseX, 0, width, -100, 10000, false);
//   });
// }

function keyPressed() {
  if (key === ' ') {
    animating = !animating;
  }
  if (key === 'r') {
    randomizeColors();
  }
  if (key === 'a' && !isAudioPlaying) {
    audio.loop();
    isAudioPlaying = true;
  }
}

function randomizeColors() {
  layers.forEach(layer => {
    layer.colorIndex = floor(random(colors.getRowCount() - 1)); // Randomly pick a new color palette (excluding the moiré palette)
  });
  moirePaletteIndex = colors.getRowCount() - 3; // Reset moiré palette to the last one
}