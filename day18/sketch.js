// Genuary 2024 - Day 18: What does wind look like?
// Concept: Swaying Lanterns with Collision Sounds
// By: Chatbot (refined by human)
// No flow fields. Wind is a global force. Gravity added. Mouse interacts.

let lanterns = [];
let numLanterns = 30; // Adjusted back from previous example, feel free to change

// Wind parameters
let windAngle;
let windStrength;
let noiseTime = 0;
let noiseSpeed = 0.006;

// Appearance
let stringColor;
let lanternColor1, lanternColor2;
let skyColor1, skyColor2;

// Sound
let bellSounds = []; // **** CHANGED: Use an array for sounds ****
let numSounds = 4; // **** ADDED: Number of sound files ****
let soundsLoaded = false; // **** ADDED: Flag to track loading ****
let collisionCooldownFrames = 35;

function preload() {
  soundFormats('wav', 'mp3'); // Specify formats you might use

  // **** CHANGED: Load multiple sounds into the array ****
  for (let i = 1; i <= numSounds; i++) {
    let soundPath = `bell${nf(i, 2)}.mp3`; // Assumes files are bell01.mp3, bell02.mp3, ...
    try {
      let sound = loadSound(soundPath, soundLoadSuccess, soundLoadError, soundLoadProgress);
      bellSounds.push(sound);
    } catch (e) {
      console.error(`Could not initiate loading for sound: ${soundPath}`, e);
      // Add a placeholder if loading fails initiation
      bellSounds.push({ play: () => {}, rate: () => {}, amp: () => {}, isLoaded: () => false, _path: soundPath });
    }
  }
}

// **** ADDED: Callbacks for loadSound ****
function soundLoadSuccess(sound) {
  console.log(`Successfully loaded: ${sound.url}`);
  checkAllSoundsLoaded(); // Check if all sounds are now loaded
}

function soundLoadError(err, sound) {
    // p5.sound may pass the sound object even on error, check its path
    let path = sound && sound.url ? sound.url : 'unknown file';
    console.error(`Error loading sound: ${path}`, err);
    checkAllSoundsLoaded(); // Still check, maybe others loaded
}

function soundLoadProgress(percent, sound) {
    // Optional: Log loading progress
    // let path = sound && sound.url ? sound.url : 'unknown file';
    // console.log(`Loading ${path}: ${nf(percent * 100, 2, 1)}%`);
}

// **** ADDED: Function to check if all sounds are ready ****
function checkAllSoundsLoaded() {
    // Check if every sound object in the array reports isLoaded() as true
    soundsLoaded = bellSounds.every(sound => sound.isLoaded());
    if (soundsLoaded) {
        console.log("All sounds loaded successfully!");
        // Potentially remove loading indicator here if you add one
    } else {
        // Optional: Check how many are loaded
        // let loadedCount = bellSounds.filter(s => s.isLoaded()).length;
        // console.log(`${loadedCount}/${numSounds} sounds loaded...`);
    }
}


function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  strokeWeight(1);
  noFill();

  skyColor1 = color(230, 70, 20);
  skyColor2 = color(260, 60, 40);
  stringColor = color(0, 0, 80, 50);
  lanternColor1 = color(30, 90, 90);
  lanternColor2 = color(55, 100, 100);

  for (let i = 0; i < numLanterns; i++) {
    let x = random(width * 0.1, width * 0.9);
    let y = random(-50, 50);
    let stringLength = random(height * 0.3, height * 0.8);
    let stiffness = random(0.01, 0.04);
    let damping = random(0.9, 0.96);
    let lanternSize = random(15, 40);
    let baseLanternColor = lerpColor(lanternColor1, lanternColor2, random());
    lanterns.push(new LanternString(x, y, stringLength, stiffness, damping, lanternSize, baseLanternColor));
  }
   lanterns.sort((a, b) => a.anchor.x - b.anchor.x);

   // Add instruction text
   let instructions = createP('Click to enable sound');
   instructions.style('color', 'white');
   instructions.style('position', 'absolute');
   instructions.style('top', '10px');
   instructions.style('left', '10px');
   instructions.style('font-family', 'sans-serif');
   instructions.style('z-index', '10');
}

function draw() {
  drawGradientBackground(skyColor1, skyColor2);

  windAngle = map(noise(noiseTime), 0, 1, -PI * 0.8, PI * 0.8);
  windStrength = map(noise(noiseTime + 10000), 0, 1, 0, 8);
  noiseTime += noiseSpeed;

  // Update lanterns
  for (let lantern of lanterns) {
    lantern.applyGravity();
    lantern.applyForce(windAngle, windStrength);
    lantern.applyMouseInteraction(mouseX, mouseY);
    lantern.update();
    lantern.display();
    if (lantern.collisionCooldown > 0) {
        lantern.collisionCooldown--;
    }
  }

  // **** CHANGED: Check the soundsLoaded flag ****
  if (soundsLoaded) {
      checkForCollisions();
  }
}

function checkForCollisions() {
    for (let i = 0; i < lanterns.length; i++) {
        for (let j = i + 1; j < lanterns.length; j++) {
            let l1 = lanterns[i];
            let l2 = lanterns[j];

            let pos1 = l1.points[l1.points.length - 1];
            let pos2 = l2.points[l2.points.length - 1];
            let r1 = l1.lanternSize / 2;
            let r2 = l2.lanternSize / 2;

            let distance = dist(pos1.x, pos1.y, pos2.x, pos2.y);
            let collisionThreshold = r1 + r2;

            if (distance < collisionThreshold) {
                if (l1.collisionCooldown === 0 && l2.collisionCooldown === 0) {
                    // **** CHANGED: Pick a random sound ****
                    let soundToPlay = random(bellSounds); // Select a random sound object

                    if (soundToPlay && soundToPlay.isLoaded()) { // Double check selected sound
                        let playbackRate = random(0.7, 1.3);
                        let amplitude = map(distance, collisionThreshold, 0, 0.1, 0.6);
                        amplitude = constrain(amplitude, 0.1, 0.7);

                        soundToPlay.rate(playbackRate);
                        soundToPlay.amp(amplitude);
                        soundToPlay.play();

                        l1.collisionCooldown = collisionCooldownFrames;
                        l2.collisionCooldown = collisionCooldownFrames;
                    } else {
                        // This should ideally not happen if soundsLoaded is true, but good fallback
                        console.warn("Tried to play an unloaded sound, skipping.");
                    }
                }
            }
        }
    }
}


function drawGradientBackground(c1, c2) {
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(0, y, width, y);
  }
  noStroke();
}

// --- LanternString Class (Unchanged from previous version) ---
class LanternString {
  constructor(x, y, stringLength, stiffness, damping, lanternSize, lanternColor) {
    this.anchor = createVector(x, y);
    this.stringLength = stringLength;
    this.stiffness = stiffness;
    this.damping = damping;
    this.lanternSize = lanternSize;
    this.baseLanternColor = lanternColor;

    this.points = [];
    this.velocities = [];
    this.numSegments = max(5, floor(stringLength / 20));
    this.collisionCooldown = 0;

    for (let i = 0; i <= this.numSegments; i++) {
      let ratio = i / this.numSegments;
      this.points.push(createVector(this.anchor.x, this.anchor.y + ratio * this.stringLength));
      this.velocities.push(createVector(0, 0));
    }
  }

    applyGravity() {
      let gravity = createVector(0, 0.1);
      for (let i = 1; i < this.points.length; i++) {
          this.velocities[i].add(gravity);
      }
  }

  applyForce(angle, strength) {
    let windForce = p5.Vector.fromAngle(angle).mult(strength);
    for (let i = 1; i < this.points.length; i++) {
      let ratio = i / this.numSegments;
      let forceMultiplier = ratio * ratio;
      this.velocities[i].add(p5.Vector.mult(windForce, forceMultiplier * 0.02));
    }
  }

  applyMouseInteraction(mx, my) {
      let mousePos = createVector(mx, my);
      let effectiveRadius = 120;
      for (let i = 1; i < this.points.length; i++) {
          let dist = p5.Vector.dist(this.points[i], mousePos);
          if (dist < effectiveRadius) {
              let diff = p5.Vector.sub(this.points[i], mousePos);
              let strength = map(dist, 0, effectiveRadius, 1.0, 0.0);
              let pushForce = diff.normalize().mult(strength * strength * 1.2);
              this.velocities[i].add(pushForce);
          }
      }
  }

  update() {
    this.points[0].set(this.anchor);
    this.velocities[0].set(0, 0);
    for (let i = 1; i < this.points.length; i++) {
      let targetPos = createVector(this.points[i-1].x, this.points[i-1].y + (this.stringLength / this.numSegments));
      let stretch = p5.Vector.sub(this.points[i], targetPos);
      let springForce = p5.Vector.mult(stretch, -this.stiffness);
      this.velocities[i].add(springForce);
      this.velocities[i].mult(this.damping);
      this.points[i].add(this.velocities[i]);
      let prevPoint = this.points[i - 1];
      let currentPoint = this.points[i];
      let desiredDist = this.stringLength / this.numSegments;
      let currentDist = p5.Vector.dist(prevPoint, currentPoint);
      if (abs(currentDist - desiredDist) > 0.1) {
          let correctionVector = p5.Vector.sub(currentPoint, prevPoint);
          correctionVector.setMag(desiredDist);
          this.points[i] = p5.Vector.add(prevPoint, correctionVector);
          this.velocities[i].mult(0.95);
      }
    }
  }
  display() {
    stroke(stringColor);
    strokeWeight(1);
    noFill();
    beginShape();
    curveVertex(this.points[0].x, this.points[0].y);
    for (let i = 0; i < this.points.length; i++) {
        curveVertex(this.points[i].x, this.points[i].y);
    }
    curveVertex(this.points[this.points.length - 1].x, this.points[this.points.length - 1].y);
    endShape();

    let lanternPos = this.points[this.points.length - 1];
    let flicker = noise(this.anchor.x + frameCount * 0.1);
    let brightnessMultiplier = map(flicker, 0.2, 0.8, 0.8, 1.1);
    let currentHue = hue(this.baseLanternColor);
    let currentSat = saturation(this.baseLanternColor);
    let currentBri = brightness(this.baseLanternColor) * brightnessMultiplier;
    let currentAlpha = 90;

    noStroke();
    fill(currentHue, currentSat, currentBri, currentAlpha * 0.2);
    ellipse(lanternPos.x, lanternPos.y, this.lanternSize * 1.8, this.lanternSize * 1.8);
    fill(currentHue, currentSat, currentBri, currentAlpha * 0.4);
    ellipse(lanternPos.x, lanternPos.y, this.lanternSize * 1.3, this.lanternSize * 1.3);
    fill(currentHue, currentSat, currentBri, currentAlpha);
    ellipse(lanternPos.x, lanternPos.y, this.lanternSize, this.lanternSize);

    noFill();
  }
} // End of LanternString class

// --- (windowResized remains the same) ---
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  lanterns = [];
  for (let i = 0; i < numLanterns; i++) {
     let x = random(width * 0.1, width * 0.9);
     let y = random(-50, 50);
     let stringLength = random(height * 0.3, height * 0.8);
     let stiffness = random(0.01, 0.04);
     let damping = random(0.9, 0.96);
     let lanternSize = random(15, 40);
     let baseLanternColor = lerpColor(lanternColor1, lanternColor2, random());
     lanterns.push(new LanternString(x, y, stringLength, stiffness, damping, lanternSize, baseLanternColor));
  }
   lanterns.sort((a, b) => a.anchor.x - b.anchor.x);
}

// Function to enable audio on user interaction
function mousePressed() {
    // **** CHANGED: Check the soundsLoaded flag ****
    if (!soundsLoaded) {
        console.log("Sounds not fully loaded yet.");
        // Optional: You could try starting audio anyway,
        // but some sounds might not play initially.
        // userStartAudio(); // Might allow already-loaded sounds to play
        return;
    }

    // Start audio context if needed
    userStartAudio();

    // Remove the instruction text
    let instructions = select('p');
    if (instructions) {
        instructions.remove();
    }
}