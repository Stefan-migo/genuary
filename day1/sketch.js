// ===== PHASE 4 ENHANCED VERSION =====
// Creative Expansion: Advanced Generative Techniques + Machine Learning + Creative Modules

let seed, fft, mic, soundFile;
let currentPalette = [];
let targetPalette = [];
let palettes = [];
let audioActive = false;
let audioSource = 'mic'; // 'mic' or 'file'
let t = 0;
let colorsTable; // Add this declaration

// Performance monitoring
let fps = 60;
let frameTimeHistory = [];
let adaptiveQuality = 1.0;
let targetFPS = 55;
let lastFrameTime = 0;

// Performance optimization flags
let performanceMode = {
  skipFrames: 0,
  layerUpdateFreq: 1, // Update layers every N frames
  particleUpdateFreq: 1, // Update particles every N frames
  frameCounter: 0
};

// Control Panel Settings
let controlPanel = {
  visible: false, // Disabled by default - use dat.GUI instead
  maxParticles: 100, // Start with fewer particles for better performance
  enableGradientLayer: true,
  enableOscillatingLayer: true,
  enableMutatingLayer: false, // Start with some layers disabled
  enableHorizontalLayer: false,
  enableRadialLayer: false,
  enableParticles: true,
  audioUpdateFreq: 2, // Update audio every 2 frames for better performance
  qualityMultiplier: 0.8, // Start with slightly reduced quality
  enablePostProcessing: true,
  enableGlow: false, // Start with glow disabled for performance
  enableFeedback: false, // Start with feedback disabled for performance
  
  // UI interaction
  mouseOverButton: null,
  buttons: {} // Will store button areas for mouse interaction
};

// Enhanced audio analysis
let audioAnalyzer = {
  bands: {
    subBass: { min: 20, max: 60, energy: 0 },
    bass: { min: 60, max: 250, energy: 0 },
    lowMid: { min: 250, max: 500, energy: 0 },
    highMid: { min: 500, max: 2000, energy: 0 },
    treble: { min: 2000, max: 20000, energy: 0 }
  },
  rms: 0,
  onset: false,
  beatHistory: [],
  adaptiveThresholds: {
    bass: 155,
    treble: 105
  }
};

// Graphics buffers for performance
let backgroundBuffer, gradientBuffer, oscillatingBuffer, mutatingBuffer;
let particleBuffer, horizontalBuffer, postProcessBuffer, debugBuffer;
let bufferWidth, bufferHeight;

// Color management
let paletteTransition = {
  active: false,
  progress: 0,
  speed: 0.02,
  startPalette: [],
  targetPalette: []
};

// ===== PHASE 2: ADVANCED VISUAL SYSTEMS =====

// Particle System
let particles = [];
let maxParticles = 200;

// 3D Camera System (renamed from 'camera' to avoid conflict)
let cam3D = {
  x: 0,
  y: 0,
  z: 1000,
  rotX: 0,
  rotY: 0,
  fov: 60,
  targetZ: 1000,
  autoRotate: false
};

// Animation System
let animations = {
  layers: {
    gradient: { opacity: 255, scale: 1.0, rotation: 0 },
    oscillating: { opacity: 180, scale: 1.0, rotation: 0 },
    mutating: { opacity: 255, scale: 1.0, rotation: 0 },
    particles: { opacity: 200, scale: 1.0, rotation: 0 },
    horizontal: { opacity: 150, scale: 1.0, rotation: 0 }
  },
  transitions: {
    beatPulse: 0,
    onsetFlash: 0,
    colorShift: 0
  }
};

// Post-processing effects
let effects = {
  blur: { active: false, intensity: 0 },
  glow: { active: true, intensity: 0.3 },
  feedback: { active: true, intensity: 0.02 },
  distortion: { active: false, intensity: 0 }
};

// Pattern modes
let patterns = {
  mode: 'mixed', // 'vertical', 'horizontal', 'radial', 'mixed'
  horizontalWaves: [],
  radialRings: [],
  flowField: []
};

// SVG Particle System
let svgParticles = {
  enabled: true,
  svgs: [], // Will store loaded SVG graphics
  svgFiles: ['particle1.svg', 'particle2.svg', 'particle3.svg'], // SVG file names
  fallbackShapes: ['circle', 'line', 'cross'], // Fallback if SVGs don't load
  useSVG: false // Whether SVGs are loaded and ready
};

// ===== PHASE 3: ADVANCED FEATURES & USER EXPERIENCE =====

// dat.GUI System
let gui;
let guiControls = {
  // Performance
  maxParticles: 100,
  qualityMultiplier: 0.8,
  audioUpdateFreq: 2,
  
  // Layers
  enableGradientLayer: true,
  enableOscillatingLayer: true,
  enableMutatingLayer: false,
  enableHorizontalLayer: false,
  enableRadialLayer: false,
  enableParticles: true,
  
  // Effects
  enablePostProcessing: true,
  enableGlow: false,
  enableFeedback: false,
  
  // Audio
  audioSource: 'mic',
  
  // Camera
  cameraAutoRotate: false,
  cameraZoom: 1000,
  
  // Pattern
  patternMode: 'mixed',
  
  // Phase 4 Advanced Features
  enableFlowField: false,
  flowFieldStrength: 0.5,
  enableCellularAutomata: false,
  enableTypography: false,
  typographyText: 'GENUARY',
  enableLSystem: false,
  enableFractals: false,
  fractalType: 'mandelbrot',
  enableMLFeatures: false,
  enableSVGParticles: true,
  
  // Actions
  exportPNG: function() { exportImage('png'); },
  exportHighRes: function() { exportImage('png', 2.0); },
  savePreset: function() { saveCurrentPreset(); },
  loadPreset: function() { loadPresetDialog(); },
  resetToDefaults: function() { resetToDefaults(); },
  showHelp: function() { showHelpOverlay(); }
};

// Preset System
let presetManager = {
  currentPreset: 'Default',
  presets: {},
  autoSave: true
};

// Export & Recording System
let exportSystem = {
  recording: false,
  recordingType: null, // 'gif', 'video'
  frames: [],
  maxFrames: 300, // 10 seconds at 30fps
  gifRecorder: null,
  mediaRecorder: null,
  recordedChunks: []
};

// MIDI System
let midiSystem = {
  enabled: false,
  inputs: [],
  currentInput: null,
  mappings: {}, // MIDI CC to parameter mappings
  learnMode: false,
  lastCC: null
};

// Help System
let helpSystem = {
  visible: false,
  content: null
};

// ===== PHASE 4: CREATIVE EXPANSION & ADVANCED GENERATIVE TECHNIQUES =====

// Flow Field System
let flowField = {
  enabled: false,
  resolution: 20, // Grid resolution
  strength: 0.5,
  noiseScale: 0.01,
  timeScale: 0.005,
  vectors: [],
  particles: []
};

// Cellular Automata System
let cellularAutomata = {
  enabled: false,
  grid: [],
  width: 80,
  height: 60,
  rules: {
    birth: [3], // Standard Conway's rule
    survival: [2, 3],
    audioModulated: true
  },
  generation: 0,
  updateRate: 10 // frames between updates
};

// Advanced Audio Analysis
let advancedAudio = {
  spectralCentroid: 0,
  spectralRolloff: 0,
  spectralFlux: 0,
  mfcc: [], // Mel-frequency cepstral coefficients
  chroma: [], // Chromagram for harmony analysis
  beatPattern: [],
  tempo: 0,
  genre: 'unknown',
  confidence: 0
};

// Typography System
let typography = {
  enabled: false,
  text: 'GENUARY',
  font: null,
  size: 100,
  audioReactive: true,
  morphing: false,
  particles: []
};

// L-System Generative
let lSystem = {
  enabled: false,
  currentType: 0,
  types: [
    { // Dragon Curve
      axiom: 'FX',
      rules: { 'X': 'X+YF+', 'Y': '-FX-Y' },
      angle: 90,
      length: 4,
      iterations: 8
    },
    { // Sierpinski Triangle
      axiom: 'F-G-G',
      rules: { 'F': 'F-G+F+G-F', 'G': 'GG' },
      angle: 120,
      length: 3,
      iterations: 4
    },
    { // Plant
      axiom: 'X',
      rules: { 'X': 'F+[[X]-X]-F[-FX]+X', 'F': 'FF' },
      angle: 25,
      length: 6,
      iterations: 5
    },
    { // Levy C Curve  
      axiom: 'F',
      rules: { 'F': '+F--F+' },
      angle: 45,
      length: 5,
      iterations: 10
    }
  ],
  path: [],
  changeInterval: 300 // Change pattern every 5 seconds at 60fps
};

// Fractal Systems
let fractalSystem = {
  enabled: false,
  type: 'mandelbrot', // 'mandelbrot', 'julia', 'sierpinski'
  zoom: 1,
  iterations: 50,
  audioModulation: true,
  juliaC: { x: -0.7, y: 0.27015 }
};

// Machine Learning Features
let mlFeatures = {
  enabled: false,
  beatLearning: {
    patterns: [],
    predictions: [],
    accuracy: 0
  },
  genreClassification: {
    features: [],
    classification: 'unknown',
    confidence: 0
  }
};

function preload() {
  // Load color palettes from CSV with error handling
  try {
    colorsTable = loadTable('colors.csv', 'csv', 'header');
  } catch(e) {
    console.warn('Could not load colors.csv, will use default palette');
    colorsTable = null;
  }
  
  // Load the MP3 file for dual audio source option
  try {
    soundFile = loadSound('day-1-genuary.mp3');
  } catch(e) {
    console.warn('Could not load day-1-genuary.mp3, will use mic only');
    soundFile = null;
  }
  
  // Try to load SVG files for particles
  loadSVGParticles();
}

function loadSVGParticles() {
  console.log('Loading real SVG particles...');
  svgParticles.svgs = [];
  
  // Try to load actual SVG files
  let loadedCount = 0;
  let totalSVGs = svgParticles.svgFiles.length;
  
  for(let i = 0; i < totalSVGs; i++) {
    loadImage(svgParticles.svgFiles[i], 
      function(img) {
        // Success callback
        svgParticles.svgs[i] = img;
        loadedCount++;
        
        if(loadedCount === totalSVGs) {
          svgParticles.useSVG = true;
          console.log('All SVG particles loaded successfully');
        }
      },
      function(err) {
        // Error callback - fall back to custom graphics
        console.warn('Could not load', svgParticles.svgFiles[i], '- using custom graphics');
        createFallbackGraphics();
      }
    );
  }
  
  // If no SVGs load, create fallback graphics
  setTimeout(() => {
    if(loadedCount === 0) {
      createFallbackGraphics();
    }
  }, 2000);
}

function createFallbackGraphics() {
  console.log('Creating fallback SVG-style particles...');
  svgParticles.svgs = [];
  
  // Create custom particle graphics (SVG-like designs)
  try {
    // Particle 1: Star shape
    let star = createGraphics(20, 20);
    star.fill(255);
    star.noStroke();
    star.beginShape();
    for(let i = 0; i < 10; i++) {
      let angle = map(i, 0, 10, 0, TWO_PI);
      let radius = i % 2 === 0 ? 8 : 4;
      let x = 10 + cos(angle) * radius;
      let y = 10 + sin(angle) * radius;
      star.vertex(x, y);
    }
    star.endShape(CLOSE);
    svgParticles.svgs.push(star);
    
    // Particle 2: Heart shape
    let heart = createGraphics(20, 18);
    heart.fill(255);
    heart.noStroke();
    heart.beginShape();
    heart.vertex(10, 15);
    heart.bezierVertex(10, 12, 2, 8, 10, 4);
    heart.bezierVertex(18, 8, 10, 12, 10, 15);
    heart.endShape();
    svgParticles.svgs.push(heart);
    
    // Particle 3: Diamond/crystal shape
    let diamond = createGraphics(16, 20);
    diamond.fill(255);
    diamond.noStroke();
    diamond.beginShape();
    diamond.vertex(8, 2);   // top
    diamond.vertex(14, 8);  // right
    diamond.vertex(8, 18);  // bottom
    diamond.vertex(2, 8);   // left
    diamond.endShape(CLOSE);
    svgParticles.svgs.push(diamond);
    
    svgParticles.useSVG = true;
    console.log('Custom SVG-style particles created successfully');
    
  } catch(e) {
    console.warn('Error creating custom particles:', e);
    svgParticles.useSVG = false;
  }
}

function setup() {
  createCanvas(800, 800, P2D); // Use P2D to avoid shader conflicts
  colorMode(RGB, 255);
  seed = random(1000);
  
  // Prevent context menu on right-click in control panel area (defer to ensure canvas is ready)
  setTimeout(() => {
    if (canvas && canvas.elt) {
      canvas.elt.addEventListener('contextmenu', function(e) {
        if (controlPanel.visible && 
            mouseX >= width - 320 && mouseX <= width && 
            mouseY >= 10 && mouseY <= height - 10) {
          e.preventDefault();
          return false;
        }
      });
    }
  }, 100);
  
  console.log('Canvas created, width:', width, 'height:', height);
  
  // Initialize graphics buffers (all P2D for compatibility)
  bufferWidth = width;
  bufferHeight = height;
  
  try {
    backgroundBuffer = createGraphics(bufferWidth, bufferHeight, P2D);
    gradientBuffer = createGraphics(bufferWidth, bufferHeight, P2D);
    oscillatingBuffer = createGraphics(bufferWidth, bufferHeight, P2D);
    mutatingBuffer = createGraphics(bufferWidth, bufferHeight, P2D);
    particleBuffer = createGraphics(bufferWidth, bufferHeight, P2D);
    horizontalBuffer = createGraphics(bufferWidth, bufferHeight, P2D);
    postProcessBuffer = createGraphics(bufferWidth, bufferHeight, P2D);
    debugBuffer = createGraphics(bufferWidth, bufferHeight, P2D);
    console.log('Graphics buffers created successfully');
  } catch(e) {
    console.error('Error creating graphics buffers:', e);
  }
  
  // Process color palettes with validation
  processPalettes();
  
  // Initialize audio system
  setupAudio();
  
  // Initialize performance monitoring
  frameTimeHistory = new Array(20).fill(16.67); // ~60fps baseline, shorter history
  lastFrameTime = millis();
  
  // Initialize particle system
  initializeParticles();
  
  // Initialize pattern systems
  initializePatterns();
  
  // ===== PHASE 3 INITIALIZATION =====
  initializeGUI();
  initializeMIDI();
  initializeExportSystem();
  initializePresets();
  initializeHelpSystem();
  
  // ===== PHASE 4 INITIALIZATION =====
  initializeFlowField();
  initializeCellularAutomata();
  initializeTypography();
  initializeLSystem();
  initializeFractalSystem();
  initializeMLFeatures();
  
  console.log('Setup complete - Phase 4 Enhanced');
}

function processPalettes() {
  palettes = [];
  
  // Create a default palette in case CSV loading fails
  let defaultPalette = [
    color(255, 0, 0),    // Red
    color(0, 255, 0),    // Green  
    color(0, 0, 255),    // Blue
    color(255, 255, 0),  // Yellow
    color(255, 0, 255)   // Magenta
  ];
  
  if (colorsTable && colorsTable.getRowCount && colorsTable.getRowCount() > 0) {
    // Process CSV data
    try {
      for(let row = 0; row < colorsTable.getRowCount(); row++) {
        let palette = [];
        let cols = colorsTable.getRow(row).arr;
        
        // Validate and process colors
        if (cols && cols.length >= 3) {
          for(let i = 0; i < cols.length; i += 3) {
            if(i + 2 < cols.length) {
              let r = constrain(parseInt(cols[i]) || 0, 0, 255);
              let g = constrain(parseInt(cols[i+1]) || 0, 0, 255);
              let b = constrain(parseInt(cols[i+2]) || 0, 0, 255);
              palette.push(color(r, g, b));
            }
          }
        }
        
        if(palette.length > 0) {
          palettes.push(palette);
        }
      }
    } catch(e) {
      console.error('Error processing color palettes:', e);
    }
  }
  
  // If no palettes loaded from CSV, use default
  if (palettes.length === 0) {
    console.warn('No palettes loaded from CSV, using default palette');
    palettes.push(defaultPalette);
  }
  
  // Ensure we have valid current and target palettes
  currentPalette = [...(palettes[0] || defaultPalette)];
  targetPalette = [...(palettes[0] || defaultPalette)];
  
  console.log(`Loaded ${palettes.length} color palettes`);
}

function setupAudio() {
  try {
    // Initialize microphone
    mic = new p5.AudioIn();
    
    // Set up FFT with higher resolution for better frequency analysis
    fft = new p5.FFT(0.8, 1024);
    
    // Connect default source (microphone)
    mic.connect(fft);
    console.log('Audio system initialized');
  } catch(e) {
    console.error('Error setting up audio:', e);
  }
}

function initializeParticles() {
  particles = [];
  try {
    for(let i = 0; i < maxParticles; i++) {
      particles.push(createParticle());
    }
    console.log('Particles initialized:', particles.length);
  } catch(e) {
    console.error('Error initializing particles:', e);
  }
}

function createParticle() {
  // Ensure currentPalette exists and has length
  let paletteToUse = (currentPalette && currentPalette.length > 0) ? currentPalette : [color(255, 255, 255)];
  
  // Choose particle type based on SVG availability
  let particleType;
  if(svgParticles.enabled && svgParticles.useSVG && svgParticles.svgs.length > 0) {
    particleType = floor(random(svgParticles.svgs.length));
  } else {
    particleType = random(['circle', 'line', 'cross']);
  }
  
  return {
    x: random(width),
    y: random(height),
    z: random(-200, 200),
    vx: random(-2, 2),
    vy: random(-2, 2),
    vz: random(-1, 1),
    life: 255,
    maxLife: random(60, 180),
    size: random(0.5, 2.0), // Scale factor for SVG particles
    color: paletteToUse[floor(random(paletteToUse.length))],
    type: particleType,
    rotation: random(TWO_PI) // For rotating SVG particles
  };
}

function initializePatterns() {
  try {
    // Initialize horizontal wave patterns
    patterns.horizontalWaves = [];
    for(let i = 0; i < 20; i++) {
      patterns.horizontalWaves.push({
        y: random(height),
        amplitude: random(50, 200),
        frequency: random(0.01, 0.05),
        phase: random(TWO_PI),
        speed: random(0.02, 0.1)
      });
    }
    
    // Initialize radial ring patterns
    patterns.radialRings = [];
    for(let i = 0; i < 10; i++) {
      patterns.radialRings.push({
        centerX: width/2 + random(-100, 100),
        centerY: height/2 + random(-100, 100),
        radius: random(50, 300),
        thickness: random(2, 10),
        speed: random(0.01, 0.03),
        phase: random(TWO_PI)
      });
    }
    console.log('Patterns initialized');
  } catch(e) {
    console.error('Error initializing patterns:', e);
  }
}

function draw() {
  try {
    // Performance monitoring
    monitorPerformance();
    
    // Update systems
    updateAudioAnalysis();
    updateColorTransitions();
    updateAnimations();
    updateParticles();
    update3DCamera();
    updatePhase3Systems();
    
    // ===== PHASE 4 UPDATES =====
    updateFlowField();
    updateCellularAutomata();
    updateTypography();
    updateMLFeatures();
    
    // Clear and setup space
    background(0);
    
    // Apply pseudo-3D transformations using 2D methods
    push();
    translate(width/2 + cam3D.x, height/2 + cam3D.y);
    
    // Simulate 3D rotation with 2D scaling and skewing
    let zoomFactor = map(cam3D.z, 500, 1500, 1.5, 0.5);
    scale(zoomFactor);
    
    // Simple rotation simulation
    rotate(cam3D.rotY * 0.1); // Reduced rotation for 2D
    
    // Draw to buffers
    drawLayersToBuffers();
    
    // Apply post-processing
    applyPostProcessing();
    
    // Composite final result
    compositeFinalFrame();
    
    pop(); // End pseudo-3D transformations
    
    // Render debug info to buffer
    drawDebugInfo();
    
    // Composite debug buffer on top
    if (debugBuffer) {
      image(debugBuffer, 0, 0);
    }
    
  } catch(e) {
    console.error('Error in draw loop:', e);
    // Fallback: draw a simple pattern
    background(0);
    if (currentPalette && currentPalette.length > 0) {
      stroke(currentPalette[0]);
      line(0, 0, width, height);
      line(width, 0, 0, height);
    }
  }
}

function monitorPerformance() {
  let currentTime = millis();
  let frameTime = currentTime - lastFrameTime;
  lastFrameTime = currentTime;
  
  frameTimeHistory.push(frameTime);
  if(frameTimeHistory.length > 10) frameTimeHistory.shift(); // Even shorter for responsiveness
  
  let avgFrameTime = frameTimeHistory.reduce((a, b) => a + b) / frameTimeHistory.length;
  fps = 1000 / avgFrameTime;
  
  // Use control panel settings instead of aggressive auto-adjustments
  maxParticles = controlPanel.maxParticles;
  adaptiveQuality = controlPanel.qualityMultiplier;
  
  // Light auto-adjustment only for extreme cases
  if(fps < 20) {
    performanceMode.layerUpdateFreq = 2;
  } else if(fps > 45) {
    performanceMode.layerUpdateFreq = 1;
  }
  
  performanceMode.frameCounter++;
}

function updateAudioAnalysis() {
  if(!audioActive) return;
  
  // Skip audio updates based on control panel setting
  if(performanceMode.frameCounter % controlPanel.audioUpdateFreq !== 0) return;
  
  try {
    // Get spectrum and RMS with error checking
    let spectrum = fft.analyze();
    if (!spectrum) return;
    
    audioAnalyzer.rms = (mic && mic.getLevel) ? mic.getLevel() : 0;
    
    // Analyze frequency bands
    for(let band in audioAnalyzer.bands) {
      let bandData = audioAnalyzer.bands[band];
      bandData.energy = fft.getEnergy(bandData.min, bandData.max);
    }
    
    // Onset detection using spectral flux
    detectOnset(spectrum);
    
    // Update adaptive thresholds
    updateAdaptiveThresholds();
    
    // React to audio features
    reactToAudio();
  } catch(e) {
    console.error('Error in audio analysis:', e);
  }
}

function detectOnset(spectrum) {
  if (!spectrum || !Array.isArray(spectrum)) return;
  
  // Simple onset detection based on spectral flux
  let spectralFlux = 0;
  if(audioAnalyzer.lastSpectrum && audioAnalyzer.lastSpectrum.length === spectrum.length) {
    for(let i = 0; i < spectrum.length; i++) {
      spectralFlux += max(0, spectrum[i] - audioAnalyzer.lastSpectrum[i]);
    }
  }
  
  audioAnalyzer.onset = spectralFlux > 200; // Threshold for onset
  audioAnalyzer.lastSpectrum = [...spectrum];
  
  // Store beat history for pattern analysis
  if(audioAnalyzer.onset) {
    audioAnalyzer.beatHistory.push(millis());
    if(audioAnalyzer.beatHistory.length > 10) {
      audioAnalyzer.beatHistory.shift();
    }
  }
}

function updateAdaptiveThresholds() {
  // Adapt thresholds based on recent audio levels
  let bassAvg = audioAnalyzer.bands.bass.energy;
  let trebleAvg = audioAnalyzer.bands.treble.energy;
  
  audioAnalyzer.adaptiveThresholds.bass = lerp(
    audioAnalyzer.adaptiveThresholds.bass, 
    bassAvg * 0.7, 
    0.01
  );
  
  audioAnalyzer.adaptiveThresholds.treble = lerp(
    audioAnalyzer.adaptiveThresholds.treble, 
    trebleAvg * 0.6, 
    0.01
  );
}

function reactToAudio() {
  // Bass response - pattern mutation and camera
  if(audioAnalyzer.bands.bass.energy > audioAnalyzer.adaptiveThresholds.bass) {
    seed += random(0.005, 0.1) * (audioAnalyzer.bands.bass.energy / 255);
    t += random(0.05, 0.2) * (audioAnalyzer.rms * 2);
    
    // Camera shake on bass
    cam3D.x += random(-5, 5) * (audioAnalyzer.bands.bass.energy / 255);
    cam3D.y += random(-5, 5) * (audioAnalyzer.bands.bass.energy / 255);
    
    // Beat pulse animation
    animations.transitions.beatPulse = 1.0;
  }
  
  // Treble response - palette changes and particles
  if(audioAnalyzer.bands.treble.energy > audioAnalyzer.adaptiveThresholds.treble) {
    if (palettes && palettes.length > 0) {
      changePalette(floor(random(palettes.length)));
    }
    spawnBeatParticles(5);
  }
  
  // Mid-range response - time evolution and rotation
  if(audioAnalyzer.bands.lowMid.energy > 100) {
    t += 0.01 * (audioAnalyzer.bands.lowMid.energy / 255);
    if(cam3D.autoRotate) {
      cam3D.rotY += 0.005 * (audioAnalyzer.bands.lowMid.energy / 255);
    }
  }
  
  // High-mid response - 3D camera zoom
  if(audioAnalyzer.bands.highMid.energy > 80) {
    cam3D.targetZ = map(audioAnalyzer.bands.highMid.energy, 0, 255, 800, 1200);
  }
  
  // Onset response - dramatic changes
  if(audioAnalyzer.onset) {
    seed += random(-0.1, 0.1);
    animations.transitions.onsetFlash = 1.0;
    spawnBeatParticles(10);
    
    // Change pattern mode occasionally
    if(random() < 0.1) {
      let modes = ['vertical', 'horizontal', 'radial', 'mixed'];
      patterns.mode = random(modes);
    }
  }
}

function updateAnimations() {
  try {
    // Decay animation values
    animations.transitions.beatPulse *= 0.95;
    animations.transitions.onsetFlash *= 0.9;
    animations.transitions.colorShift = sin(t * 0.1) * 0.5 + 0.5;
    
    // Update layer animations based on audio
    if(audioActive) {
      let bassIntensity = audioAnalyzer.bands.bass.energy / 255;
      let trebleIntensity = audioAnalyzer.bands.treble.energy / 255;
      
      animations.layers.gradient.scale = 1.0 + bassIntensity * 0.1;
      animations.layers.oscillating.rotation += trebleIntensity * 0.02;
      animations.layers.particles.opacity = 150 + trebleIntensity * 100;
    }
    
    // Smooth camera movement
    cam3D.z = lerp(cam3D.z, cam3D.targetZ, 0.05);
    cam3D.x *= 0.95; // Decay camera shake
    cam3D.y *= 0.95;
  } catch(e) {
    console.error('Error in animations:', e);
  }
}

function updateParticles() {
  if (!particles || !controlPanel.enableParticles) {
    particles = [];
    return;
  }
  
  try {
    let audioRms = audioActive ? audioAnalyzer.rms : 0;
    
    // Simple, direct particle update - no batching overhead
    for(let i = particles.length - 1; i >= 0; i--) {
      let p = particles[i];
      if (!p) continue;
      
      // Update position
      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;
      
      // Simple audio-reactive movement
      if(audioActive && audioRms > 0.1) {
        p.vx += (Math.random() - 0.5) * 0.1 * audioRms;
        p.vy += (Math.random() - 0.5) * 0.1 * audioRms;
      }
      
      // Update life
      p.life -= 255 / p.maxLife;
      
      // Simple boundary wrapping
      if(p.x < 0) p.x = width;
      if(p.x > width) p.x = 0;
      if(p.y < 0) p.y = height;
      if(p.y > height) p.y = 0;
      
      // Remove dead particles immediately
      if(p.life <= 0) {
        particles.splice(i, 1);
      }
    }
    
    // Maintain particle count simply
    while(particles.length < controlPanel.maxParticles) {
      particles.push(createParticle());
    }
  } catch(e) {
    console.error('Error updating particles:', e);
  }
}

function spawnBeatParticles(count) {
  if (!particles) particles = [];
  
  try {
    for(let i = 0; i < count; i++) {
      let p = createParticle();
      p.x = width/2 + random(-50, 50);
      p.y = height/2 + random(-50, 50);
      p.vx = random(-5, 5);
      p.vy = random(-5, 5);
      p.size = random(5, 15);
      p.life = 255;
      particles.push(p);
    }
  } catch(e) {
    console.error('Error spawning particles:', e);
  }
}

function update3DCamera() {
  if(cam3D.autoRotate) {
    cam3D.rotY += 0.01;
  }
}

function updateColorTransitions() {
  try {
    if(paletteTransition.active && currentPalette && targetPalette) {
      paletteTransition.progress += paletteTransition.speed;
      
      if(paletteTransition.progress >= 1.0) {
        // Transition complete
        currentPalette = [...targetPalette];
        paletteTransition.active = false;
        paletteTransition.progress = 0;
      } else {
        // Interpolate colors
        for(let i = 0; i < currentPalette.length; i++) {
          if(i < paletteTransition.startPalette.length && i < targetPalette.length) {
            currentPalette[i] = lerpColor(
              paletteTransition.startPalette[i],
              targetPalette[i],
              paletteTransition.progress
            );
          }
        }
      }
    }
  } catch(e) {
    console.error('Error in color transitions:', e);
  }
}

function drawLayersToBuffers() {
  try {
    let quality = controlPanel.qualityMultiplier;
    let shouldUpdateLayers = (performanceMode.frameCounter % performanceMode.layerUpdateFreq === 0);
    
    // Clear all buffers when updating
    if(shouldUpdateLayers) {
      if (gradientBuffer && controlPanel.enableGradientLayer) gradientBuffer.clear();
      if (oscillatingBuffer && controlPanel.enableOscillatingLayer) oscillatingBuffer.clear();
      if (mutatingBuffer && controlPanel.enableMutatingLayer) mutatingBuffer.clear();
      if (horizontalBuffer && controlPanel.enableHorizontalLayer) horizontalBuffer.clear();
    }
    
    // Clear particle buffer if particles are enabled
    if (particleBuffer && controlPanel.enableParticles) particleBuffer.clear();
    
    // Draw enabled layers based on pattern mode
    if(shouldUpdateLayers) {
      // VERTICAL mode: Only vertical patterns
      if(patterns.mode === 'vertical') {
        if(controlPanel.enableGradientLayer) drawDensityGradientLayer(gradientBuffer, quality);
        if(controlPanel.enableOscillatingLayer) drawOscillatingLayer(oscillatingBuffer, quality);
        if(controlPanel.enableMutatingLayer) drawMutatingPatternLayer(mutatingBuffer, quality);
      }
      
      // HORIZONTAL mode: Only horizontal patterns
      else if(patterns.mode === 'horizontal') {
        if(controlPanel.enableHorizontalLayer) drawHorizontalPatternLayer(horizontalBuffer, quality);
      }
      
      // RADIAL mode: Only radial patterns
      else if(patterns.mode === 'radial') {
        if(controlPanel.enableRadialLayer) drawRadialPatternLayer(gradientBuffer, quality);
      }
      
      // MIXED mode: All enabled patterns
      else if(patterns.mode === 'mixed') {
        if(controlPanel.enableGradientLayer) drawDensityGradientLayer(gradientBuffer, quality);
        if(controlPanel.enableOscillatingLayer) drawOscillatingLayer(oscillatingBuffer, quality);
        if(controlPanel.enableMutatingLayer) drawMutatingPatternLayer(mutatingBuffer, quality);
        if(controlPanel.enableHorizontalLayer) drawHorizontalPatternLayer(horizontalBuffer, quality);
        if(controlPanel.enableRadialLayer) drawRadialPatternLayer(gradientBuffer, quality);
      }
    }
    
    // Draw particles if enabled
    if(controlPanel.enableParticles) {
      drawParticleLayer(particleBuffer, quality);
    }
    
    // ===== PHASE 4 DRAWING =====
    // Draw Phase 4 features to appropriate buffers
    if(flowField.enabled) {
      drawFlowField(particleBuffer); // Use particle buffer for flow field
    }
    
    if(cellularAutomata.enabled) {
      drawCellularAutomata(gradientBuffer); // Use gradient buffer for cellular automata
    }
    
    if(typography.enabled) {
      drawTypography(postProcessBuffer); // Use post-process buffer for typography
    }
    
    if(lSystem.enabled) {
      drawLSystem(oscillatingBuffer); // Use oscillating buffer for L-system
    }
    
    if(fractalSystem.enabled) {
      drawFractals(mutatingBuffer); // Use mutating buffer for fractals
    }
  } catch(e) {
    console.error('Error drawing layers to buffers:', e);
  }
}

function drawDensityGradientLayer(buffer, quality) {
  if (!buffer || !currentPalette || currentPalette.length === 0) {
    console.warn('Cannot draw gradient layer: missing buffer or palette');
    return;
  }
  
  try {
    buffer.push();
    buffer.translate(width/2, height/2);
    buffer.scale(animations.layers.gradient.scale);
    buffer.rotate(animations.layers.gradient.rotation);
    buffer.translate(-width/2, -height/2);
    
    buffer.noFill();
    
    // More aggressive step sizing for performance
    let step = max(2, floor(4 / quality));
    let paletteLength = currentPalette.length;
    let timeOffset = t * 0.1;
    
    // Cache audio values for this frame
    let audioIntensity = 1.0;
    let strokeWeight = 1;
    if(audioActive) {
      audioIntensity = map(audioAnalyzer.rms, 0, 0.3, 0.3, 1.0) + animations.transitions.beatPulse * 0.3;
      strokeWeight = 1 + animations.transitions.beatPulse * 2;
    }
    
    // Pre-calculate width mapping
    let widthInv = 1.0 / width;
    
    for(let x = 0; x < width; x += step) {
      let density = 0.9 - (x * widthInv * 0.8); // Optimized mapping
      
      if(noise(x * 0.1, timeOffset) < density) {
        let colIndex = floor(x * widthInv * paletteLength);
        let lineColor = currentPalette[colIndex];
        
        // Apply audio reactivity only when needed
        if(audioActive && audioIntensity < 0.95) {
          lineColor = lerpColor(color(0), lineColor, audioIntensity);
        }
        
        buffer.stroke(lineColor);
        buffer.strokeWeight(strokeWeight);
        buffer.line(x, 0, x, height);
      }
    }
    
    buffer.pop();
  } catch(e) {
    console.error('Error in drawDensityGradientLayer:', e);
  }
}

function drawOscillatingLayer(buffer, quality) {
  if (!buffer || !currentPalette || currentPalette.length === 0) return;
  
  try {
    buffer.push();
    buffer.translate(width/2, height/2);
    buffer.scale(animations.layers.oscillating.scale);
    buffer.rotate(animations.layers.oscillating.rotation);
    buffer.translate(-width/2, -height/2);
    
    buffer.noFill();
    let centerX = width/2;
    let count = floor(max(50, 100 * quality)); // Reduced base count for performance
    
    // Cache audio calculations
    let audioOffset = 0;
    let onsetWeight = 1;
    if(audioActive) {
      audioOffset = audioAnalyzer.bands.highMid.energy * 0.5;
      onsetWeight = 1 + animations.transitions.onsetFlash * 3;
    }
    
    let timeOffset = t * 0.3;
    let paletteLength = currentPalette.length;
    
    for(let i = 0; i < count; i++) {
      let baseOffset = noise(i * 0.1, timeOffset) * 300 - 150;
      
      // Add audio-reactive offset (optimized)
      let totalOffset = baseOffset;
      if(audioActive) {
        totalOffset += audioOffset * sin(i * 0.1 + t) + 
                      animations.transitions.onsetFlash * 50 * sin(i * 0.2);
      }
      
      let x = centerX + totalOffset;
      let colIndex = floor(noise(i * 0.05) * paletteLength);
      buffer.stroke(currentPalette[colIndex]);
      buffer.strokeWeight(onsetWeight);
      buffer.line(x, 0, x, height);
    }
    
    buffer.pop();
  } catch(e) {
    console.error('Error in drawOscillatingLayer:', e);
  }
}

function drawMutatingPatternLayer(buffer, quality) {
  if (!buffer || !currentPalette || currentPalette.length === 0) return;
  
  try {
    buffer.push();
    buffer.translate(width/2, height/2);
    buffer.scale(animations.layers.mutating.scale);
    buffer.rotate(animations.layers.mutating.rotation);
    buffer.translate(-width/2, -height/2);
    
    buffer.noFill();
    let step = max(3, floor(8 / quality)); // More aggressive stepping
    
    // Cache time calculations
    let timeDouble = t * 2;
    let paletteLength = currentPalette.length;
    
    // Cache audio calculations
    let audioBassEffect = 0;
    let beatPulseEffect = animations.transitions.beatPulse * 5;
    if(audioActive) {
      audioBassEffect = map(audioAnalyzer.bands.bass.energy, 0, 255, 0, 5) * audioAnalyzer.rms * 10;
    }
    
    for(let x = 0; x < width; x += step) {
      if(noise(x * 0.01, timeDouble) > 0.75) { // Slightly higher threshold for fewer lines
        let thickness = noise(x * 0.02, t) * 7;
        let colIndex = floor(noise(x * 0.005) * paletteLength);
        
        // Apply audio effects
        if(audioActive) {
          thickness += audioBassEffect + beatPulseEffect;
        }
        
        buffer.stroke(currentPalette[colIndex]);
        buffer.strokeWeight(max(1, thickness));
        buffer.line(x, 0, x, height);
      }
    }
    
    buffer.pop();
  } catch(e) {
    console.error('Error in drawMutatingPatternLayer:', e);
  }
}

function drawHorizontalPatternLayer(buffer, quality) {
  if (!buffer || !currentPalette || currentPalette.length === 0) return;
  
  try {
    buffer.push();
    buffer.translate(width/2, height/2);
    buffer.scale(animations.layers.horizontal.scale);
    buffer.rotate(animations.layers.horizontal.rotation);
    buffer.translate(-width/2, -height/2);
    
    buffer.noFill();
    
    // Optimized: Use fewer waves and larger steps for better performance
    let step = max(5, floor(8 / quality)); // Larger step size
    let maxWaves = min(8, patterns.horizontalWaves.length); // Limit wave count
    
    for(let i = 0; i < maxWaves; i++) {
      let wave = patterns.horizontalWaves[i];
      wave.phase += wave.speed;
      
      let colIndex = floor(i * currentPalette.length / maxWaves);
      buffer.stroke(currentPalette[colIndex]);
      buffer.strokeWeight(1 + (audioActive ? audioAnalyzer.rms * 2 : 0));
      
      // Use beginShape for better performance than individual points
      buffer.beginShape();
      buffer.noFill();
      
      for(let x = 0; x < width; x += step) {
        let y = wave.y + sin(x * wave.frequency + wave.phase) * wave.amplitude;
        
        // Simplified audio reactivity
        if(audioActive) {
          y += audioAnalyzer.bands.lowMid.energy * 0.05 * sin(x * 0.005 + t);
        }
        
        buffer.vertex(x, y);
      }
      buffer.endShape();
    }
    
    buffer.pop();
  } catch(e) {
    console.error('Error in drawHorizontalPatternLayer:', e);
  }
}

function drawRadialPatternLayer(buffer, quality) {
  if (!buffer || !currentPalette || currentPalette.length === 0) return;
  
  try {
    buffer.push();
    buffer.translate(width/2, height/2);
    
    buffer.noFill();
    
    for(let ring of patterns.radialRings) {
      ring.phase += ring.speed;
      
      let colIndex = floor(random(currentPalette.length));
      buffer.stroke(currentPalette[colIndex]);
      buffer.strokeWeight(ring.thickness);
      
      let radius = ring.radius + sin(ring.phase) * 20;
      
      // Add audio reactivity
      if(audioActive) {
        radius += audioAnalyzer.bands.treble.energy * 0.2;
      }
      
      buffer.circle(ring.centerX - width/2, ring.centerY - height/2, radius * 2);
    }
    
    buffer.pop();
  } catch(e) {
    console.error('Error in drawRadialPatternLayer:', e);
  }
}

function drawParticleLayer(buffer, quality) {
  if (!buffer || !particles || particles.length === 0) return;
  
  try {
    buffer.push();
    buffer.translate(width/2, height/2);
    buffer.scale(animations.layers.particles.scale);
    buffer.translate(-width/2, -height/2);
    
    for(let p of particles) {
      if (!p) continue;
      
      let alpha = p.life;
      
      buffer.push();
      buffer.translate(p.x + p.z * 0.05, p.y + p.z * 0.05); // Pseudo-3D offset
      
      // Set color with alpha
      let c = color(red(p.color), green(p.color), blue(p.color), alpha);
      buffer.fill(c);
      buffer.stroke(c);
      buffer.strokeWeight(1);
      
      // Draw different particle types
      if(svgParticles.enabled && svgParticles.useSVG && typeof p.type === 'number' && svgParticles.svgs[p.type]) {
        // Draw SVG-style particle
        buffer.push();
        buffer.rotate(p.rotation);
        buffer.scale(p.size);
        buffer.tint(red(p.color), green(p.color), blue(p.color), alpha);
        buffer.image(svgParticles.svgs[p.type], -10, -10); // Center the image
        buffer.noTint();
        buffer.pop();
      } else {
        // Draw basic shapes
        switch(p.type) {
          case 'circle':
            buffer.circle(0, 0, p.size * 4); // Scale up for visibility
            break;
          case 'line':
            buffer.line(-p.size * 2, 0, p.size * 2, 0);
            break;
          case 'cross':
            buffer.line(-p.size * 2, 0, p.size * 2, 0);
            buffer.line(0, -p.size * 2, 0, p.size * 2);
            break;
        }
      }
      
      buffer.pop();
    }
    
    buffer.pop();
  } catch(e) {
    console.error('Error in drawParticleLayer:', e);
  }
}

function applyPostProcessing() {
  if (!postProcessBuffer || !controlPanel.enablePostProcessing) {
    return;
  }
  
  try {
    postProcessBuffer.clear();
    
    // Composite enabled layers only
    if (gradientBuffer && controlPanel.enableGradientLayer) {
      postProcessBuffer.image(gradientBuffer, 0, 0);
    }
    
    if (horizontalBuffer && controlPanel.enableHorizontalLayer && (patterns.mode === 'horizontal' || patterns.mode === 'mixed')) {
      postProcessBuffer.tint(255, animations.layers.horizontal.opacity);
      postProcessBuffer.image(horizontalBuffer, 0, 0);
    }
    
    if (oscillatingBuffer && controlPanel.enableOscillatingLayer) {
      postProcessBuffer.tint(255, animations.layers.oscillating.opacity);
      postProcessBuffer.image(oscillatingBuffer, 0, 0);
    }
    
    if (mutatingBuffer && controlPanel.enableMutatingLayer) {
      postProcessBuffer.tint(255, animations.layers.mutating.opacity);
      postProcessBuffer.image(mutatingBuffer, 0, 0);
    }
    
    if (particleBuffer && controlPanel.enableParticles) {
      postProcessBuffer.tint(255, animations.layers.particles.opacity);
      postProcessBuffer.image(particleBuffer, 0, 0);
    }
    
    postProcessBuffer.noTint();
    
    // Apply feedback effect if enabled
    if(controlPanel.enableFeedback) {
      // Create feedback by drawing the buffer onto itself with offset and transparency
      postProcessBuffer.tint(255, 255 * 0.05); // Very low opacity for subtle feedback
      postProcessBuffer.image(postProcessBuffer, 
        random(-1, 1), random(-1, 1), 
        width + random(-2, 2), height + random(-2, 2));
      postProcessBuffer.noTint();
      
      // Add slight blur effect for more visible feedback
      postProcessBuffer.filter(BLUR, 0.2);
    }
  } catch(e) {
    console.error('Error in post processing:', e);
  }
}

function compositeFinalFrame() {
  if (!postProcessBuffer) {
    console.warn('Cannot composite: post process buffer not available');
    return;
  }
  
  try {
    // Adjust for center-origin coordinate system
    let centerX = -width/2;
    let centerY = -height/2;
    
    // Apply glow effect with simple overlays
    if(controlPanel.enableGlow) {
      tint(255, 50);
      for(let i = 1; i <= 3; i++) {
        image(postProcessBuffer, centerX + i, centerY + i);
        image(postProcessBuffer, centerX - i, centerY - i);
      }
      noTint();
    }
    
    // Draw main image at correct position
    image(postProcessBuffer, centerX, centerY);
    
    // Apply onset flash as overlay
    if(animations.transitions.onsetFlash > 0.1) {
      fill(255, 255, 255, animations.transitions.onsetFlash * 100);
      noStroke();
      rect(centerX, centerY, width, height);
    }
  } catch(e) {
    console.error('Error compositing final frame:', e);
    // Simple fallback
    try {
      image(postProcessBuffer, -width/2, -height/2);
    } catch(e2) {
      console.error('Fallback also failed:', e2);
      // Basic colored background
      fill(50, 20, 80);
      noStroke();
      rect(-width/2, -height/2, width, height);
    }
  }
}

function changePalette(index) {
  if(!palettes || palettes.length === 0) return;
  if(index >= 0 && index < palettes.length && !paletteTransition.active) {
    paletteTransition.startPalette = [...currentPalette];
    targetPalette = [...palettes[index]];
    paletteTransition.active = true;
    paletteTransition.progress = 0;
  }
}

function drawDebugInfo() {
  if (!debugBuffer) return;
  
  try {
    debugBuffer.clear();
    
    if(controlPanel.visible) {
      drawControlPanel();
    } else {
      // Simple FPS display when control panel is hidden
      debugBuffer.fill(0, 100);
      debugBuffer.noStroke();
      debugBuffer.rect(10, 10, 120, 30);
      
      debugBuffer.fill(255);
      debugBuffer.textSize(12);
      debugBuffer.textAlign(LEFT, TOP);
      debugBuffer.text(`FPS: ${fps.toFixed(1)}`, 15, 25);
      debugBuffer.text(`Press 'H' for controls`, 15, height - 25);
    }
  } catch(e) {
    console.error('Error drawing debug info:', e);
  }
}

function drawControlPanel() {
  // Reset buttons for this frame
  controlPanel.buttons = {};
  
  // Control panel background
  debugBuffer.fill(0, 180);
  debugBuffer.noStroke();
  debugBuffer.rect(width - 320, 10, 300, height - 20);
  
  debugBuffer.fill(255);
  debugBuffer.textSize(14);
  debugBuffer.textAlign(LEFT, TOP);
  
  let x = width - 310;
  let y = 20;
  let lineHeight = 25;
  let buttonWidth = 280;
  let buttonHeight = 18;
  
  debugBuffer.text("PERFORMANCE CONTROLS", x, y);
  y += lineHeight * 1.5;
  
  // FPS and basic info
  debugBuffer.fill(100, 255, 100);
  debugBuffer.textSize(12);
  debugBuffer.text(`FPS: ${fps.toFixed(1)}`, x, y);
  y += lineHeight;
  
  // Particles control with buttons
  drawValueControl("particles", x, y, `Max Particles: ${controlPanel.maxParticles}`, "(1/2: ±50, 3/4: ±10)", buttonWidth, buttonHeight);
  y += lineHeight * 1.5;
  
  // Quality control with buttons
  drawValueControl("quality", x, y, `Quality: ${(controlPanel.qualityMultiplier * 100).toFixed(0)}%`, "(Z/X: ±0.1)", buttonWidth, buttonHeight);
  y += lineHeight * 1.5;
  
  // Audio frequency with buttons
  drawValueControl("audio", x, y, `Audio Update: 1/${controlPanel.audioUpdateFreq}`, "(A/S: change)", buttonWidth, buttonHeight);
  y += lineHeight * 1.5;
  
  // Layer toggles
  debugBuffer.fill(200, 200, 255);
  debugBuffer.text("LAYERS (click or F1-F6):", x, y);
  y += lineHeight;
  
  y = drawToggleButton("gradientLayer", x, y, "F1: Gradient", controlPanel.enableGradientLayer, buttonWidth, buttonHeight, lineHeight);
  y = drawToggleButton("oscillatingLayer", x, y, "F2: Oscillating", controlPanel.enableOscillatingLayer, buttonWidth, buttonHeight, lineHeight);
  y = drawToggleButton("mutatingLayer", x, y, "F3: Mutating", controlPanel.enableMutatingLayer, buttonWidth, buttonHeight, lineHeight);
  y = drawToggleButton("horizontalLayer", x, y, "F4: Horizontal", controlPanel.enableHorizontalLayer, buttonWidth, buttonHeight, lineHeight);
  y = drawToggleButton("radialLayer", x, y, "F5: Radial", controlPanel.enableRadialLayer, buttonWidth, buttonHeight, lineHeight);
  y = drawToggleButton("particles", x, y, "F6: Particles", controlPanel.enableParticles, buttonWidth, buttonHeight, lineHeight);
  y += lineHeight * 0.4;
  
  // Effects
  debugBuffer.fill(255, 200, 200);
  debugBuffer.text("EFFECTS (click or F7-F9):", x, y);
  y += lineHeight;
  
  y = drawToggleButton("postProcessing", x, y, "F7: Post-Process", controlPanel.enablePostProcessing, buttonWidth, buttonHeight, lineHeight);
  y = drawToggleButton("glow", x, y, "F8: Glow", controlPanel.enableGlow, buttonWidth, buttonHeight, lineHeight);
  y = drawToggleButton("feedback", x, y, "F9: Feedback", controlPanel.enableFeedback, buttonWidth, buttonHeight, lineHeight);
  y += lineHeight * 0.4;
  
  // Instructions
  debugBuffer.fill(255, 255, 100);
  debugBuffer.text("H: Hide controls", x, y);
  y += lineHeight * 0.8;
  debugBuffer.text("T: Toggle audio source", x, y);
  y += lineHeight * 0.8;
  debugBuffer.text("P: Change pattern mode", x, y);
  y += lineHeight * 0.8;
  debugBuffer.fill(255, 200, 255);
  debugBuffer.textSize(11);
  debugBuffer.text("✓ All controls are clickable!", x, y);
  debugBuffer.textSize(12); // Reset text size
}

function drawToggleButton(id, x, y, label, isOn, buttonWidth, buttonHeight, lineHeight) {
  // Store button area for mouse interaction
  controlPanel.buttons[id] = {
    x: x,
    y: y,
    width: buttonWidth,
    height: buttonHeight,
    type: 'toggle'
  };
  
  // Check if mouse is over this button
  let isHover = mouseX >= x && mouseX <= x + buttonWidth && 
                mouseY >= y && mouseY <= y + buttonHeight;
  
  // Button background with enhanced hover effect
  if (isHover) {
    debugBuffer.fill(isOn ? 40 : 30, isOn ? 80 : 30, isOn ? 40 : 30, 180); // Dynamic hover background
    debugBuffer.stroke(isOn ? 150 : 100, isOn ? 255 : 150, isOn ? 150 : 100, 120); // Colored border
    debugBuffer.strokeWeight(1);
    debugBuffer.rect(x - 5, y - 2, buttonWidth, buttonHeight);
    debugBuffer.noStroke();
  }
  
  // Toggle indicator (small rectangle)
  let toggleX = x + buttonWidth - 40;
  debugBuffer.fill(isOn ? 100 : 50, isOn ? 255 : 100, isOn ? 100 : 50, isOn ? 200 : 100);
  debugBuffer.rect(toggleX, y + 2, 30, 12);
  
  // Button text with enhanced state colors
  if (isHover) {
    debugBuffer.fill(255, 255, 255); // White on hover for maximum contrast
  } else if (isOn) {
    debugBuffer.fill(120, 255, 120); // Bright green for ON
  } else {
    debugBuffer.fill(120, 120, 120); // Gray for OFF
  }
  
  debugBuffer.text(`${label} ${isOn ? 'ON' : 'OFF'}`, x, y);
  
  // Click indicator
  if (isHover) {
    debugBuffer.fill(200, 200, 255, 150);
    debugBuffer.textSize(10);
    debugBuffer.text("click", toggleX - 25, y + 10);
    debugBuffer.textSize(12); // Reset text size
  }
  
  return y + lineHeight * 0.8;
}

function drawValueControl(id, x, y, label, hint, buttonWidth, buttonHeight) {
  // Store control area for mouse interaction
  controlPanel.buttons[id] = {
    x: x,
    y: y,
    width: buttonWidth,
    height: buttonHeight,
    type: 'value'
  };
  
  // Check if mouse is over this control
  let isHover = mouseX >= x && mouseX <= x + buttonWidth && 
                mouseY >= y && mouseY <= y + buttonHeight;
  
  // Control background with clickable indicator
  if (isHover) {
    debugBuffer.fill(50, 50, 70, 150); // More prominent hover background
    debugBuffer.stroke(100, 150, 255, 100); // Blue border on hover
    debugBuffer.strokeWeight(1);
    debugBuffer.rect(x - 5, y - 2, buttonWidth, buttonHeight + 15);
    debugBuffer.noStroke();
  }
  
  debugBuffer.fill(isHover ? 255 : 255);
  debugBuffer.text(label, x, y);
  
  // Enhanced hint with click instructions
  debugBuffer.fill(isHover ? 200 : 150);
  debugBuffer.text(hint, x, y + 12);
  
  if (isHover) {
    debugBuffer.fill(100, 200, 255, 180);
    debugBuffer.textSize(10);
    debugBuffer.text("Left-click: +  Right-click: -", x + 180, y + 6);
    debugBuffer.text("Hold SHIFT for smaller steps", x + 180, y + 16);
    debugBuffer.textSize(12); // Reset text size
  }
}

function mousePressed() {
  // Check if clicking on control panel buttons
  if (controlPanel.visible && handleControlPanelClick()) {
    return; // Don't do other mouse actions if clicking on panel
  }
  
  seed = random(1000);
  
  if(!audioActive) {
    startAudio();
  } else {
    // Cycle through palettes
    if (palettes && palettes.length > 0) {
      let currentIndex = palettes.findIndex(p => p === targetPalette);
      let nextIndex = (currentIndex + 1) % palettes.length;
      changePalette(nextIndex);
    }
  }
}

// Add mouseReleased to help with right-click detection
function mouseReleased() {
  // This can help ensure proper right-click handling
  return false;
}

function handleControlPanelClick() {
  for (let buttonId in controlPanel.buttons) {
    let button = controlPanel.buttons[buttonId];
    
    // Check if mouse is within button area
    if (mouseX >= button.x && mouseX <= button.x + button.width &&
        mouseY >= button.y && mouseY <= button.y + button.height) {
      
      if (button.type === 'toggle') {
        // Handle toggle buttons
        switch(buttonId) {
          case 'gradientLayer':
            controlPanel.enableGradientLayer = !controlPanel.enableGradientLayer;
            break;
          case 'oscillatingLayer':
            controlPanel.enableOscillatingLayer = !controlPanel.enableOscillatingLayer;
            break;
          case 'mutatingLayer':
            controlPanel.enableMutatingLayer = !controlPanel.enableMutatingLayer;
            break;
          case 'horizontalLayer':
            controlPanel.enableHorizontalLayer = !controlPanel.enableHorizontalLayer;
            break;
          case 'radialLayer':
            controlPanel.enableRadialLayer = !controlPanel.enableRadialLayer;
            break;
          case 'particles':
            controlPanel.enableParticles = !controlPanel.enableParticles;
            break;
          case 'postProcessing':
            controlPanel.enablePostProcessing = !controlPanel.enablePostProcessing;
            break;
          case 'glow':
            controlPanel.enableGlow = !controlPanel.enableGlow;
            break;
          case 'feedback':
            controlPanel.enableFeedback = !controlPanel.enableFeedback;
            break;
        }
        return true; // Click was handled
      }
      
      else if (button.type === 'value') {
        // Handle value controls (left click = increase, right click = decrease)
        let isIncrease = (mouseButton === LEFT);
        let stepSize = (keyIsPressed && (key === 'Shift' || keyCode === 16)) ? 'small' : 'normal';
        
        switch(buttonId) {
          case 'particles':
            let particleStep = stepSize === 'small' ? 10 : 50;
            if (isIncrease) {
              controlPanel.maxParticles = min(500, controlPanel.maxParticles + particleStep);
            } else {
              controlPanel.maxParticles = max(0, controlPanel.maxParticles - particleStep);
            }
            break;
          case 'quality':
            let qualityStep = stepSize === 'small' ? 0.05 : 0.1;
            if (isIncrease) {
              controlPanel.qualityMultiplier = min(2.0, controlPanel.qualityMultiplier + qualityStep);
            } else {
              controlPanel.qualityMultiplier = max(0.1, controlPanel.qualityMultiplier - qualityStep);
            }
            break;
          case 'audio':
            if (isIncrease) {
              controlPanel.audioUpdateFreq = min(10, controlPanel.audioUpdateFreq + 1);
            } else {
              controlPanel.audioUpdateFreq = max(1, controlPanel.audioUpdateFreq - 1);
            }
            break;
        }
        return true; // Click was handled
      }
    }
  }
  return false; // No button was clicked
}

function startAudio() {
  userStartAudio().then(() => {
    if(audioSource === 'mic' && mic) {
      mic.start();
      mic.connect(fft);
    } else if(audioSource === 'file' && soundFile) {
      soundFile.loop();
      fft.setInput(soundFile);
    }
    audioActive = true;
    console.log(`${audioSource} audio started.`);
  }).catch(e => {
    console.warn('Could not start audio:', e);
  });
}

function keyPressed() {
  // Control panel toggle (H key)
  if(key === 'h' || key === 'H') {
    controlPanel.visible = !controlPanel.visible;
  }
  
  // Particle controls
  if(key === '1') {
    controlPanel.maxParticles = max(0, controlPanel.maxParticles - 50);
  }
  if(key === '2') {
    controlPanel.maxParticles = min(500, controlPanel.maxParticles + 50);
  }
  if(key === '3') {
    controlPanel.maxParticles = max(0, controlPanel.maxParticles - 10);
  }
  if(key === '4') {
    controlPanel.maxParticles = min(500, controlPanel.maxParticles + 10);
  }
  
  // Quality controls
  if(key === 'z' || key === 'Z') {
    controlPanel.qualityMultiplier = max(0.1, controlPanel.qualityMultiplier - 0.1);
  }
  if(key === 'x' || key === 'X') {
    controlPanel.qualityMultiplier = min(2.0, controlPanel.qualityMultiplier + 0.1);
  }
  
  // Audio update frequency
  if(key === 'a' || key === 'A') {
    controlPanel.audioUpdateFreq = max(1, controlPanel.audioUpdateFreq - 1);
  }
  if(key === 's' || key === 'S') {
    controlPanel.audioUpdateFreq = min(10, controlPanel.audioUpdateFreq + 1);
  }
  
  // Layer toggles (Function keys)
  if(keyCode === 112) { // F1
    controlPanel.enableGradientLayer = !controlPanel.enableGradientLayer;
  }
  if(keyCode === 113) { // F2
    controlPanel.enableOscillatingLayer = !controlPanel.enableOscillatingLayer;
  }
  if(keyCode === 114) { // F3
    controlPanel.enableMutatingLayer = !controlPanel.enableMutatingLayer;
  }
  if(keyCode === 115) { // F4
    controlPanel.enableHorizontalLayer = !controlPanel.enableHorizontalLayer;
  }
  if(keyCode === 116) { // F5
    controlPanel.enableRadialLayer = !controlPanel.enableRadialLayer;
  }
  if(keyCode === 117) { // F6
    controlPanel.enableParticles = !controlPanel.enableParticles;
  }
  if(keyCode === 118) { // F7
    controlPanel.enablePostProcessing = !controlPanel.enablePostProcessing;
  }
  if(keyCode === 119) { // F8
    controlPanel.enableGlow = !controlPanel.enableGlow;
  }
  if(keyCode === 120) { // F9
    controlPanel.enableFeedback = !controlPanel.enableFeedback;
  }
  
  // Original controls (shifted to different keys)
  if(key === '5' || key === '6' || key === '7' || key === '8' || key === '9') {
    if (palettes && palettes.length > 0) {
      let index = (key - '5') % palettes.length;
      changePalette(index);
    }
  }
  
  // Reset (R key)
  if(key === 'r' || key === 'R') {
    seed = random(1000);
    t = 0;
    cam3D.rotY = 0;
    cam3D.rotX = 0;
  }
  
  // Pattern mode cycling (P key)
  if(key === 'p' || key === 'P') {
    let modes = ['vertical', 'horizontal', 'radial', 'mixed'];
    let currentIndex = modes.indexOf(patterns.mode);
    patterns.mode = modes[(currentIndex + 1) % modes.length];
  }
  
  // Camera auto-rotation toggle (C key)
  if(key === 'c' || key === 'C') {
    cam3D.autoRotate = !cam3D.autoRotate;
  }
  
  // Audio source toggle (T key)
  if(key === 't' || key === 'T') {
    toggleAudioSource();
  }
  
  // Manual camera controls (Arrow keys)
  if(keyCode === UP_ARROW) {
    cam3D.rotX -= 0.1;
  }
  if(keyCode === DOWN_ARROW) {
    cam3D.rotX += 0.1;
  }
  if(keyCode === LEFT_ARROW) {
    cam3D.rotY -= 0.1;
  }
  if(keyCode === RIGHT_ARROW) {
    cam3D.rotY += 0.1;
  }
}

function toggleAudioSource() {
  if(audioActive) {
    // Stop current audio
    if(audioSource === 'mic' && mic) {
      mic.stop();
    } else if(audioSource === 'file' && soundFile) {
      soundFile.stop();
    }
    audioActive = false;
  }
  
  // Switch source
  audioSource = audioSource === 'mic' ? 'file' : 'mic';
  
  // Update GUI
  if(gui) {
    guiControls.audioSource = audioSource;
    gui.updateDisplay();
  }
  
  // Restart with new source
  setTimeout(() => {
    startAudio();
  }, 100);
}

// ===== PHASE 3: ADVANCED FEATURES IMPLEMENTATION =====

// GUI System
function initializeGUI() {
  if (typeof dat === 'undefined') {
    console.warn('dat.GUI not loaded, using fallback controls');
    return;
  }
  
  try {
    gui = new dat.GUI({ width: 320 });
    gui.domElement.style.position = 'fixed';
    gui.domElement.style.top = '10px';
    gui.domElement.style.right = '10px';
    gui.domElement.style.zIndex = '1000';

    // A 320px panel eats most of a phone screen: start folded there, one tap
    // reopens it.
    if (window.innerWidth < 600) {
      gui.close();
    }
    
    // Performance folder
    let perfFolder = gui.addFolder('⚡ Performance');
    perfFolder.add(guiControls, 'maxParticles', 0, 500).step(10).name('Max Particles').onChange(updatePerformance);
    perfFolder.add(guiControls, 'qualityMultiplier', 0.1, 2.0).step(0.1).name('Quality').onChange(updatePerformance);
    perfFolder.add(guiControls, 'audioUpdateFreq', 1, 10).step(1).name('Audio Update Freq').onChange(updatePerformance);
    perfFolder.open();
    
    // Layers folder
    let layersFolder = gui.addFolder('🎨 Layers');
    layersFolder.add(guiControls, 'enableGradientLayer').name('Gradient').onChange(updateLayers);
    layersFolder.add(guiControls, 'enableOscillatingLayer').name('Oscillating').onChange(updateLayers);
    layersFolder.add(guiControls, 'enableMutatingLayer').name('Mutating').onChange(updateLayers);
    layersFolder.add(guiControls, 'enableHorizontalLayer').name('Horizontal').onChange(updateLayers);
    layersFolder.add(guiControls, 'enableRadialLayer').name('Radial').onChange(updateLayers);
    layersFolder.add(guiControls, 'enableParticles').name('Particles').onChange(updateLayers);
    layersFolder.open();
    
    // Effects folder
    let effectsFolder = gui.addFolder('✨ Effects');
    effectsFolder.add(guiControls, 'enablePostProcessing').name('Post Processing').onChange(updateEffects);
    effectsFolder.add(guiControls, 'enableGlow').name('Glow').onChange(updateEffects);
    effectsFolder.add(guiControls, 'enableFeedback').name('Feedback').onChange(updateEffects);
    effectsFolder.open();
    
    // Audio folder
    let audioFolder = gui.addFolder('🎵 Audio');
    audioFolder.add(guiControls, 'audioSource', ['mic', 'file']).name('Source').onChange(switchAudioSource);
    
    // Camera folder
    let cameraFolder = gui.addFolder('📷 Camera');
    cameraFolder.add(guiControls, 'cameraAutoRotate').name('Auto Rotate').onChange(updateCamera);
    cameraFolder.add(guiControls, 'cameraZoom', 500, 1500).name('Zoom').onChange(updateCamera);
    
    // Pattern folder
    let patternFolder = gui.addFolder('🔀 Patterns');
    patternFolder.add(guiControls, 'patternMode', ['vertical', 'horizontal', 'radial', 'mixed']).name('Mode').onChange(updatePatterns);
    
    // Export folder
    let exportFolder = gui.addFolder('📤 Export');
    exportFolder.add(guiControls, 'exportPNG').name('📷 Export PNG');
    exportFolder.add(guiControls, 'exportHighRes').name('🖼️ Export Hi-Res');
    
    // Presets folder
    let presetsFolder = gui.addFolder('💾 Presets');
    presetsFolder.add(guiControls, 'savePreset').name('💾 Save Current');
    presetsFolder.add(guiControls, 'loadPreset').name('📂 Load Preset');
    presetsFolder.add(guiControls, 'resetToDefaults').name('🔄 Reset Defaults');
    
    // Phase 4 Advanced Features folder
    let phase4Folder = gui.addFolder('🚀 Phase 4: Advanced');
    phase4Folder.add(guiControls, 'enableFlowField').name('Flow Field').onChange(updatePhase4Features);
    phase4Folder.add(guiControls, 'flowFieldStrength', 0.1, 2.0).name('Flow Strength').onChange(updatePhase4Features);
    phase4Folder.add(guiControls, 'enableCellularAutomata').name('Cellular Automata').onChange(updatePhase4Features);
    phase4Folder.add(guiControls, 'enableTypography').name('Typography').onChange(updatePhase4Features);
    phase4Folder.add(guiControls, 'typographyText').name('Text').onChange(updatePhase4Features);
    phase4Folder.add(guiControls, 'enableLSystem').name('L-System').onChange(updatePhase4Features);
    phase4Folder.add(guiControls, 'enableFractals').name('Fractals').onChange(updatePhase4Features);
    phase4Folder.add(guiControls, 'fractalType', ['mandelbrot', 'julia', 'sierpinski']).name('Fractal Type').onChange(updatePhase4Features);
    phase4Folder.add(guiControls, 'enableMLFeatures').name('ML Features').onChange(updatePhase4Features);
    phase4Folder.add(guiControls, 'enableSVGParticles').name('SVG Particles').onChange(updatePhase4Features);
    
    // Help folder
    let helpFolder = gui.addFolder('❓ Help');
    helpFolder.add(guiControls, 'showHelp').name('📖 Show Help');
    
    // Sync initial values
    syncGUIWithControls();
    
    console.log('dat.GUI initialized successfully');
  } catch(e) {
    console.error('Error initializing GUI:', e);
  }
}

function syncGUIWithControls() {
  guiControls.maxParticles = controlPanel.maxParticles;
  guiControls.qualityMultiplier = controlPanel.qualityMultiplier;
  guiControls.audioUpdateFreq = controlPanel.audioUpdateFreq;
  guiControls.enableGradientLayer = controlPanel.enableGradientLayer;
  guiControls.enableOscillatingLayer = controlPanel.enableOscillatingLayer;
  guiControls.enableMutatingLayer = controlPanel.enableMutatingLayer;
  guiControls.enableHorizontalLayer = controlPanel.enableHorizontalLayer;
  guiControls.enableRadialLayer = controlPanel.enableRadialLayer;
  guiControls.enableParticles = controlPanel.enableParticles;
  guiControls.enablePostProcessing = controlPanel.enablePostProcessing;
  guiControls.enableGlow = controlPanel.enableGlow;
  guiControls.enableFeedback = controlPanel.enableFeedback;
  guiControls.audioSource = audioSource;
  guiControls.cameraAutoRotate = cam3D.autoRotate;
  guiControls.cameraZoom = cam3D.z;
  guiControls.patternMode = patterns.mode;
  
  if(gui) gui.updateDisplay();
}

// GUI Update Functions
function updatePerformance() {
  controlPanel.maxParticles = guiControls.maxParticles;
  controlPanel.qualityMultiplier = guiControls.qualityMultiplier;
  controlPanel.audioUpdateFreq = guiControls.audioUpdateFreq;
}

function updateLayers() {
  controlPanel.enableGradientLayer = guiControls.enableGradientLayer;
  controlPanel.enableOscillatingLayer = guiControls.enableOscillatingLayer;
  controlPanel.enableMutatingLayer = guiControls.enableMutatingLayer;
  controlPanel.enableHorizontalLayer = guiControls.enableHorizontalLayer;
  controlPanel.enableRadialLayer = guiControls.enableRadialLayer;
  controlPanel.enableParticles = guiControls.enableParticles;
}

function updateEffects() {
  controlPanel.enablePostProcessing = guiControls.enablePostProcessing;
  controlPanel.enableGlow = guiControls.enableGlow;
  controlPanel.enableFeedback = guiControls.enableFeedback;
}

function switchAudioSource() {
  audioSource = guiControls.audioSource;
  toggleAudioSource();
}

function updateCamera() {
  cam3D.autoRotate = guiControls.cameraAutoRotate;
  cam3D.targetZ = guiControls.cameraZoom;
}

function updatePatterns() {
  patterns.mode = guiControls.patternMode;
}

function updatePhase4Features() {
  flowField.enabled = guiControls.enableFlowField;
  flowField.strength = guiControls.flowFieldStrength;
  cellularAutomata.enabled = guiControls.enableCellularAutomata;
  typography.enabled = guiControls.enableTypography;
  typography.text = guiControls.typographyText;
  lSystem.enabled = guiControls.enableLSystem;
  fractalSystem.enabled = guiControls.enableFractals;
  fractalSystem.type = guiControls.fractalType;
  mlFeatures.enabled = guiControls.enableMLFeatures;
  svgParticles.enabled = guiControls.enableSVGParticles;
  
  // Regenerate particles if SVG mode changes
  if(svgParticles.enabled !== guiControls.enableSVGParticles) {
    initializeParticles(); // Recreate particles with new types
  }
}

// Preset System
function initializePresets() {
  // Load default presets
  presetManager.presets = {
    'Default': getCurrentSettings(),
    'Performance Mode': {
      maxParticles: 50,
      qualityMultiplier: 0.6,
      enableGlow: false,
      enableFeedback: false,
      enableMutatingLayer: false,
      enableRadialLayer: false
    },
    'Visual Feast': {
      maxParticles: 300,
      qualityMultiplier: 1.0,
      enableGlow: true,
      enableFeedback: true,
      enableMutatingLayer: true,
      enableRadialLayer: true,
      enableHorizontalLayer: true
    },
    'Minimalist': {
      maxParticles: 20,
      enableGradientLayer: true,
      enableOscillatingLayer: false,
      enableMutatingLayer: false,
      enableHorizontalLayer: false,
      enableRadialLayer: false,
      enableParticles: false,
      enableGlow: false,
      enableFeedback: false
    }
  };
  
  // Load saved presets from localStorage
  try {
    let saved = localStorage.getItem('genuary_day1_presets');
    if(saved) {
      let savedPresets = JSON.parse(saved);
      presetManager.presets = {...presetManager.presets, ...savedPresets};
    }
  } catch(e) {
    console.warn('Could not load saved presets:', e);
  }
  
  console.log('Presets initialized:', Object.keys(presetManager.presets));
}

function getCurrentSettings() {
  return {
    maxParticles: controlPanel.maxParticles,
    qualityMultiplier: controlPanel.qualityMultiplier,
    audioUpdateFreq: controlPanel.audioUpdateFreq,
    enableGradientLayer: controlPanel.enableGradientLayer,
    enableOscillatingLayer: controlPanel.enableOscillatingLayer,
    enableMutatingLayer: controlPanel.enableMutatingLayer,
    enableHorizontalLayer: controlPanel.enableHorizontalLayer,
    enableRadialLayer: controlPanel.enableRadialLayer,
    enableParticles: controlPanel.enableParticles,
    enablePostProcessing: controlPanel.enablePostProcessing,
    enableGlow: controlPanel.enableGlow,
    enableFeedback: controlPanel.enableFeedback,
    patternMode: patterns.mode,
    cameraAutoRotate: cam3D.autoRotate
  };
}

function saveCurrentPreset() {
  let name = prompt('Enter preset name:', 'My Preset ' + Date.now());
  if(name) {
    presetManager.presets[name] = getCurrentSettings();
    
    // Save to localStorage
    try {
      localStorage.setItem('genuary_day1_presets', JSON.stringify(presetManager.presets));
      console.log('Preset saved:', name);
      alert('Preset "' + name + '" saved successfully!');
    } catch(e) {
      console.error('Could not save preset:', e);
      alert('Error saving preset: ' + e.message);
    }
  }
}

function loadPresetDialog() {
  let presetNames = Object.keys(presetManager.presets);
  let selection = prompt('Available presets:\n' + presetNames.join('\n') + '\n\nEnter preset name to load:');
  
  if(selection && presetManager.presets[selection]) {
    loadPreset(selection);
  } else if(selection) {
    alert('Preset "' + selection + '" not found.');
  }
}

function loadPreset(name) {
  if(!presetManager.presets[name]) {
    console.error('Preset not found:', name);
    return;
  }
  
  let preset = presetManager.presets[name];
  
  // Apply settings
  if(preset.maxParticles !== undefined) controlPanel.maxParticles = preset.maxParticles;
  if(preset.qualityMultiplier !== undefined) controlPanel.qualityMultiplier = preset.qualityMultiplier;
  if(preset.audioUpdateFreq !== undefined) controlPanel.audioUpdateFreq = preset.audioUpdateFreq;
  if(preset.enableGradientLayer !== undefined) controlPanel.enableGradientLayer = preset.enableGradientLayer;
  if(preset.enableOscillatingLayer !== undefined) controlPanel.enableOscillatingLayer = preset.enableOscillatingLayer;
  if(preset.enableMutatingLayer !== undefined) controlPanel.enableMutatingLayer = preset.enableMutatingLayer;
  if(preset.enableHorizontalLayer !== undefined) controlPanel.enableHorizontalLayer = preset.enableHorizontalLayer;
  if(preset.enableRadialLayer !== undefined) controlPanel.enableRadialLayer = preset.enableRadialLayer;
  if(preset.enableParticles !== undefined) controlPanel.enableParticles = preset.enableParticles;
  if(preset.enablePostProcessing !== undefined) controlPanel.enablePostProcessing = preset.enablePostProcessing;
  if(preset.enableGlow !== undefined) controlPanel.enableGlow = preset.enableGlow;
  if(preset.enableFeedback !== undefined) controlPanel.enableFeedback = preset.enableFeedback;
  if(preset.patternMode !== undefined) patterns.mode = preset.patternMode;
  if(preset.cameraAutoRotate !== undefined) cam3D.autoRotate = preset.cameraAutoRotate;
  
  // Update GUI
  syncGUIWithControls();
  
  presetManager.currentPreset = name;
  console.log('Preset loaded:', name);
  alert('Preset "' + name + '" loaded successfully!');
}

function resetToDefaults() {
  if(confirm('Reset all settings to defaults?')) {
    loadPreset('Default');
  }
}

// Export System
function initializeExportSystem() {
  // Initialize GIF.js if available
  if(typeof GIF !== 'undefined') {
    exportSystem.gifRecorder = new GIF({
      workers: 2,
      quality: 10,
      width: width,
      height: height
    });
    
    exportSystem.gifRecorder.on('finished', function(blob) {
      downloadBlob(blob, 'genuary_day1_' + Date.now() + '.gif');
      exportSystem.recording = false;
      updateExportUI();
    });
  }
  
  // Set up export button handlers
  setupExportHandlers();
  
  console.log('Export system initialized');
}

function setupExportHandlers() {
  // PNG Export
  document.getElementById('exportPNG').addEventListener('click', () => {
    exportImage('png');
  });
  
  // Hi-Res Export
  document.getElementById('exportHiRes').addEventListener('click', () => {
    exportImage('png', 2.0);
  });
  
  // GIF Recording
  document.getElementById('recordGIF').addEventListener('click', () => {
    if(exportSystem.recording && exportSystem.recordingType === 'gif') {
      stopGIFRecording();
    } else {
      startGIFRecording();
    }
  });
  
  // Video Recording
  document.getElementById('recordVideo').addEventListener('click', () => {
    if(exportSystem.recording && exportSystem.recordingType === 'video') {
      stopVideoRecording();
    } else {
      startVideoRecording();
    }
  });
}

function exportImage(format = 'png', scale = 1.0) {
  try {
    let timestamp = Date.now();
    let filename = `genuary_day1_${timestamp}.${format}`;
    
    if(scale === 1.0) {
      // Standard resolution export
      save(filename);
    } else {
      // High resolution export - render at higher resolution
      console.log('Rendering hi-res image at', scale, 'x scale');
      
      // Create hi-res buffer
      let hiResBuffer = createGraphics(width * scale, height * scale, P2D);
      hiResBuffer.pixelDensity(1);
      
      // Save current state
      let originalSeed = seed;
      let originalT = t;
      
      // Render to hi-res buffer with same parameters
      hiResBuffer.background(0);
      hiResBuffer.push();
      hiResBuffer.scale(scale);
      
      // Draw simplified version for hi-res (copy main visual elements)
      drawToBuffer(hiResBuffer, scale);
      
      hiResBuffer.pop();
      
      // Save the hi-res buffer
      save(hiResBuffer, filename);
      
      console.log('Hi-res image exported:', filename);
      alert('Hi-res image exported: ' + filename);
    }
    
    console.log('Image exported:', filename);
    if(scale === 1.0) alert('Image exported: ' + filename);
  } catch(e) {
    console.error('Export failed:', e);
    alert('Export failed: ' + e.message);
  }
}

function drawToBuffer(buffer, scale = 1.0) {
  try {
    // Simplified rendering for hi-res export
    buffer.colorMode(RGB, 255);
    
    if(!currentPalette || currentPalette.length === 0) return;
    
    // Draw gradient layer
    buffer.noFill();
    let step = max(1, floor(2 / scale));
    
    for(let x = 0; x < width; x += step) {
      let density = 0.9 - (x / width * 0.8);
      
      if(noise(x * 0.1, t * 0.1) < density) {
        let colIndex = floor(x / width * currentPalette.length);
        buffer.stroke(currentPalette[colIndex]);
        buffer.strokeWeight(1);
        buffer.line(x, 0, x, height);
      }
    }
    
    // Draw oscillating layer
    let centerX = width/2;
    let count = floor(50 * scale);
    
    for(let i = 0; i < count; i++) {
      let offset = noise(i * 0.1, t * 0.3) * 300 - 150;
      let x = centerX + offset;
      let colIndex = floor(noise(i * 0.05) * currentPalette.length);
      buffer.stroke(currentPalette[colIndex]);
      buffer.strokeWeight(1);
      buffer.line(x, 0, x, height);
    }
    
  } catch(e) {
    console.error('Error drawing to buffer:', e);
  }
}

function startGIFRecording() {
  if(typeof GIF === 'undefined') {
    alert('GIF.js library not loaded. GIF recording not available.');
    return;
  }
  
  // Create new GIF recorder for this session
  exportSystem.gifRecorder = new GIF({
    workers: 2,
    quality: 10,
    width: width,
    height: height,
    delay: 100 // 100ms delay between frames
  });
  
  exportSystem.gifRecorder.on('finished', function(blob) {
    downloadBlob(blob, 'genuary_day1_' + Date.now() + '.gif');
    exportSystem.recording = false;
    updateExportUI();
    console.log('GIF completed and downloaded');
    alert('GIF recording completed and downloaded!');
  });
  
  exportSystem.recording = true;
  exportSystem.recordingType = 'gif';
  exportSystem.frameCount = 0;
  
  updateExportUI();
  console.log('GIF recording started - will record for 10 seconds');
  alert('GIF recording started! Recording for 10 seconds...');
  
  // Auto-stop after 10 seconds (100 frames at 10fps)
  setTimeout(() => {
    if(exportSystem.recording && exportSystem.recordingType === 'gif') {
      stopGIFRecording();
    }
  }, 10000); // 10 seconds
}

function stopGIFRecording() {
  if(!exportSystem.recording || exportSystem.recordingType !== 'gif') return;
  
  exportSystem.recording = false;
  updateExportUI();
  
  if(exportSystem.gifRecorder) {
    console.log('GIF recording stopped, rendering...');
    alert('GIF recording stopped. Rendering GIF - this may take a moment...');
    exportSystem.gifRecorder.render();
  }
}

function startVideoRecording() {
  // Check for MediaRecorder support
  if(!window.MediaRecorder) {
    alert('Video recording not supported in this browser. Try using Chrome or Firefox.');
    return;
  }
  
  // Check for canvas stream support
  if(!document.querySelector('canvas').captureStream) {
    alert('Canvas video capture not supported in this browser.');
    return;
  }
  
  try {
    let canvasElement = document.querySelector('canvas');
    let stream = canvasElement.captureStream(30); // 30fps
    
    // Check if stream has video tracks
    if(stream.getVideoTracks().length === 0) {
      alert('Could not get video stream from canvas');
      return;
    }
    
    exportSystem.mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9' // Try VP9 first
    });
    
    exportSystem.recordedChunks = [];
    
    exportSystem.mediaRecorder.ondataavailable = function(event) {
      if(event.data && event.data.size > 0) {
        exportSystem.recordedChunks.push(event.data);
        console.log('Video chunk recorded, size:', event.data.size);
      }
    };
    
    exportSystem.mediaRecorder.onstop = function() {
      console.log('Video recording stopped, chunks:', exportSystem.recordedChunks.length);
      
      if(exportSystem.recordedChunks.length > 0) {
        let blob = new Blob(exportSystem.recordedChunks, { type: 'video/webm' });
        downloadBlob(blob, 'genuary_day1_' + Date.now() + '.webm');
        console.log('Video downloaded, size:', blob.size);
        alert('Video recording completed and downloaded!');
      } else {
        alert('No video data was recorded');
      }
      
      exportSystem.recordedChunks = [];
      exportSystem.recording = false;
      updateExportUI();
    };
    
    exportSystem.mediaRecorder.onerror = function(event) {
      console.error('MediaRecorder error:', event);
      alert('Video recording error: ' + event.error);
      exportSystem.recording = false;
      updateExportUI();
    };
    
    exportSystem.mediaRecorder.start(1000); // Record in 1-second chunks
    exportSystem.recording = true;
    exportSystem.recordingType = 'video';
    updateExportUI();
    
    console.log('Video recording started');
    alert('Video recording started! Will record for 15 seconds...');
    
    // Auto-stop after 15 seconds
    setTimeout(() => {
      if(exportSystem.recording && exportSystem.recordingType === 'video') {
        stopVideoRecording();
      }
    }, 15000); // 15 seconds
    
  } catch(e) {
    console.error('Video recording failed:', e);
    alert('Video recording failed: ' + e.message);
  }
}

function stopVideoRecording() {
  if(!exportSystem.recording || exportSystem.recordingType !== 'video') return;
  
  if(exportSystem.mediaRecorder && exportSystem.mediaRecorder.state === 'recording') {
    console.log('Stopping video recording...');
    exportSystem.mediaRecorder.stop();
  } else {
    console.log('MediaRecorder not in recording state:', exportSystem.mediaRecorder?.state);
    exportSystem.recording = false;
    updateExportUI();
  }
}

function updateExportUI() {
  let gifBtn = document.getElementById('recordGIF');
  let videoBtn = document.getElementById('recordVideo');
  
  if(exportSystem.recording && exportSystem.recordingType === 'gif') {
    gifBtn.textContent = '⏹️ Stop GIF';
    gifBtn.classList.add('recording');
  } else {
    gifBtn.textContent = '🎬 GIF';
    gifBtn.classList.remove('recording');
  }
  
  if(exportSystem.recording && exportSystem.recordingType === 'video') {
    videoBtn.textContent = '⏹️ Stop Video';
    videoBtn.classList.add('recording');
  } else {
    videoBtn.textContent = '📹 Video';
    videoBtn.classList.remove('recording');
  }
}

function downloadBlob(blob, filename) {
  let url = URL.createObjectURL(blob);
  let a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// MIDI System
function initializeMIDI() {
  if(!navigator.requestMIDIAccess) {
    console.warn('MIDI not supported in this browser');
    return;
  }
  
  navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
}

function onMIDISuccess(midiAccess) {
  midiSystem.enabled = true;
  
  // Get MIDI inputs
  for(let input of midiAccess.inputs.values()) {
    midiSystem.inputs.push(input);
    input.onmidimessage = onMIDIMessage;
  }
  
  if(midiSystem.inputs.length > 0) {
    midiSystem.currentInput = midiSystem.inputs[0];
    updateMIDIStatus('Connected: ' + midiSystem.currentInput.name);
    console.log('MIDI initialized:', midiSystem.inputs.length, 'inputs');
  } else {
    updateMIDIStatus('No MIDI devices found');
  }
  
  // Set up default MIDI mappings
  setupDefaultMIDIMappings();
}

function onMIDIFailure(error) {
  console.error('MIDI initialization failed:', error);
  updateMIDIStatus('MIDI Error: ' + error.message);
}

function onMIDIMessage(message) {
  let [command, note, velocity] = message.data;
  
  // Handle Control Change messages (CC)
  if((command & 0xf0) === 0xb0) {
    let cc = note;
    let value = velocity / 127.0; // Normalize to 0-1
    
    midiSystem.lastCC = { cc, value };
    
    if(midiSystem.learnMode) {
      // MIDI learn mode - map the last moved GUI control to this CC
      console.log('MIDI Learn: CC', cc, 'value', value);
      return;
    }
    
    // Apply MIDI mapping
    if(midiSystem.mappings[cc]) {
      applyMIDIMapping(cc, value);
    }
  }
}

function setupDefaultMIDIMappings() {
  // Default MIDI CC mappings
  midiSystem.mappings = {
    1: { param: 'maxParticles', min: 0, max: 500 },        // Mod wheel -> Particles
    7: { param: 'qualityMultiplier', min: 0.1, max: 2.0 },  // Volume -> Quality
    10: { param: 'cameraZoom', min: 500, max: 1500 },        // Pan -> Camera Zoom
    71: { param: 'filterCutoff', min: 0, max: 1 },           // Filter -> (future use)
    74: { param: 'resonance', min: 0, max: 1 }               // Brightness -> (future use)
  };
}

function applyMIDIMapping(cc, value) {
  let mapping = midiSystem.mappings[cc];
  if(!mapping) return;
  
  let mappedValue = mapping.min + (mapping.max - mapping.min) * value;
  
  switch(mapping.param) {
    case 'maxParticles':
      controlPanel.maxParticles = Math.round(mappedValue);
      guiControls.maxParticles = controlPanel.maxParticles;
      break;
    case 'qualityMultiplier':
      controlPanel.qualityMultiplier = mappedValue;
      guiControls.qualityMultiplier = mappedValue;
      break;
    case 'cameraZoom':
      cam3D.targetZ = mappedValue;
      guiControls.cameraZoom = mappedValue;
      break;
  }
  
  // Update GUI display
  if(gui) gui.updateDisplay();
  
  console.log('MIDI CC', cc, ':', mapping.param, '=', mappedValue);
}

function updateMIDIStatus(status) {
  let statusElement = document.getElementById('midiStatus');
  if(statusElement) {
    statusElement.textContent = 'MIDI: ' + status;
    statusElement.style.display = midiSystem.enabled ? 'block' : 'none';
  }
}

// Help System
function initializeHelpSystem() {
  generateHelpContent();
  
  // Set up help overlay handlers
  document.addEventListener('keydown', function(e) {
    if(e.key === 'F1' || e.key === 'Escape') {
      if(helpSystem.visible) {
        hideHelpOverlay();
      } else if(e.key === 'F1') {
        showHelpOverlay();
      }
    }
  });
  
  console.log('Help system initialized');
}

function generateHelpContent() {
  helpSystem.content = `
    <div style="column-count: 2; column-gap: 40px; max-width: 1000px;">
      <h3>🎮 Keyboard Controls</h3>
      <table style="width: 100%; font-size: 12px; margin-bottom: 20px;">
        <tr><td><strong>H</strong></td><td>Toggle built-in control panel</td></tr>
        <tr><td><strong>T</strong></td><td>Toggle audio source (mic/file)</td></tr>
        <tr><td><strong>P</strong></td><td>Cycle pattern modes</td></tr>
        <tr><td><strong>C</strong></td><td>Toggle camera auto-rotation</td></tr>
        <tr><td><strong>R</strong></td><td>Reset all parameters</td></tr>
        <tr><td><strong>1-4</strong></td><td>Adjust particle count (±50/±10)</td></tr>
        <tr><td><strong>Z/X</strong></td><td>Adjust quality (±0.1)</td></tr>
        <tr><td><strong>A/S</strong></td><td>Adjust audio update frequency</td></tr>
        <tr><td><strong>5-9</strong></td><td>Change color palettes</td></tr>
        <tr><td><strong>↑↓←→</strong></td><td>Manual camera rotation</td></tr>
        <tr><td><strong>F1-F6</strong></td><td>Toggle layers (Gradient, Oscillating, Mutating, Horizontal, Radial, Particles)</td></tr>
        <tr><td><strong>F7-F9</strong></td><td>Toggle effects (Post-process, Glow, Feedback)</td></tr>
        <tr><td><strong>F1</strong></td><td>Show/hide this help</td></tr>
        <tr><td><strong>ESC</strong></td><td>Close this help</td></tr>
      </table>
      
      <h3>🎚️ dat.GUI Controls</h3>
      <p><strong>Performance:</strong> Adjust particle count, rendering quality, and audio update frequency for optimal performance.</p>
      <p><strong>Layers:</strong> Enable/disable different visual layers for various artistic effects.</p>
      <p><strong>Effects:</strong> Control post-processing effects like glow and feedback.</p>
      <p><strong>Audio:</strong> Switch between microphone and MP3 file input.</p>
      <p><strong>Camera:</strong> Control 3D camera position and auto-rotation.</p>
      <p><strong>Patterns:</strong> Switch between vertical, horizontal, radial, and mixed pattern modes.</p>
      
      <h3>💾 Preset System</h3>
      <p>Save your current settings as custom presets and load them later. Presets are stored in your browser's local storage.</p>
      <ul>
        <li><strong>Default:</strong> Basic balanced settings</li>
        <li><strong>Performance Mode:</strong> Optimized for lower-end hardware</li>
        <li><strong>Visual Feast:</strong> Maximum visual effects (requires good hardware)</li>
        <li><strong>Minimalist:</strong> Clean, simple visual style</li>
      </ul>
      
      <h3>📤 Export & Recording</h3>
      <p><strong>PNG Export:</strong> Save current frame as image</p>
      <p><strong>Hi-Res Export:</strong> Save current frame at 2x resolution</p>
      <p><strong>GIF Recording:</strong> Record 10-second animated GIF (auto-stops)</p>
      <p><strong>Video Recording:</strong> Record WebM video up to 30 seconds</p>
      
      <h3>🎹 MIDI Support</h3>
      <p>Connect MIDI controllers for live performance. Default mappings:</p>
      <ul>
        <li><strong>CC 1 (Mod Wheel):</strong> Particle count</li>
        <li><strong>CC 7 (Volume):</strong> Rendering quality</li>
        <li><strong>CC 10 (Pan):</strong> Camera zoom</li>
      </ul>
      
      <h3>🎨 Visual Layers</h3>
      <p><strong>Gradient:</strong> Base density-based vertical lines</p>
      <p><strong>Oscillating:</strong> Center-based animated lines</p>
      <p><strong>Mutating:</strong> Sparse, thick audio-reactive lines</p>
      <p><strong>Horizontal:</strong> Sine wave patterns</p>
      <p><strong>Radial:</strong> Circular ring patterns</p>
      <p><strong>Particles:</strong> 3D particle system with beat triggering</p>
      
      <h3>🎵 Audio Analysis</h3>
      <p>5-band frequency analysis drives different visual elements:</p>
      <ul>
        <li><strong>Sub-bass (20-60Hz):</strong> Reserved for future features</li>
        <li><strong>Bass (60-250Hz):</strong> Pattern mutation, camera shake</li>
        <li><strong>Low-mid (250-500Hz):</strong> Wave modulation, time evolution</li>
        <li><strong>High-mid (500-2000Hz):</strong> Camera zoom, layer offset</li>
        <li><strong>Treble (2000-20000Hz):</strong> Palette changes, particle spawning</li>
      </ul>
      
      <h3>⚡ Performance Tips</h3>
      <ul>
        <li>Reduce particle count if experiencing low FPS</li>
        <li>Lower quality multiplier for better performance</li>
        <li>Disable glow and feedback effects on slower hardware</li>
        <li>Use "Performance Mode" preset for optimal settings</li>
        <li>Increase audio update frequency to reduce CPU load</li>
      </ul>
    </div>
  `;
}

function showHelpOverlay() {
  let overlay = document.getElementById('helpOverlay');
  let content = document.getElementById('helpContent');
  
  if(overlay && content) {
    content.innerHTML = helpSystem.content;
    overlay.style.display = 'block';
    helpSystem.visible = true;
  }
}

function hideHelpOverlay() {
  let overlay = document.getElementById('helpOverlay');
  if(overlay) {
    overlay.style.display = 'none';
    helpSystem.visible = false;
  }
}

// ===== PHASE 4: IMPLEMENTATION =====

// Flow Field System
function initializeFlowField() {
  flowField.vectors = [];
  
  // Create vector field grid
  for(let x = 0; x < width; x += flowField.resolution) {
    for(let y = 0; y < height; y += flowField.resolution) {
      flowField.vectors.push({
        x: x,
        y: y,
        angle: 0,
        magnitude: 1
      });
    }
  }
  
  // Create flow field particles
  flowField.particles = [];
  for(let i = 0; i < 100; i++) {
    flowField.particles.push({
      x: random(width),
      y: random(height),
      vx: 0,
      vy: 0,
      trail: [],
      life: 255,
      color: color(255, 100, 150, 150)
    });
  }
  
  console.log('Flow field initialized with', flowField.vectors.length, 'vectors');
}

function updateFlowField() {
  if(!flowField.enabled) return;
  
  // Update vector field based on noise and audio
  let audioInfluence = audioActive ? audioAnalyzer.rms * 2 : 0.5;
  
  for(let i = 0; i < flowField.vectors.length; i++) {
    let v = flowField.vectors[i];
    let noiseVal = noise(v.x * flowField.noiseScale, v.y * flowField.noiseScale, t * flowField.timeScale);
    v.angle = noiseVal * TWO_PI * 2;
    v.magnitude = flowField.strength * (0.5 + audioInfluence);
  }
  
  // Update particles following flow field
  for(let p of flowField.particles) {
    // Find nearest vector
    let gridX = Math.floor(p.x / flowField.resolution);
    let gridY = Math.floor(p.y / flowField.resolution);
    let vectorIndex = gridY * Math.floor(width / flowField.resolution) + gridX;
    
    if(vectorIndex >= 0 && vectorIndex < flowField.vectors.length) {
      let v = flowField.vectors[vectorIndex];
      
      // Apply flow field force
      p.vx += cos(v.angle) * v.magnitude * 0.1;
      p.vy += sin(v.angle) * v.magnitude * 0.1;
      
      // Apply velocity
      p.x += p.vx;
      p.y += p.vy;
      
      // Add to trail
      p.trail.push({x: p.x, y: p.y});
      if(p.trail.length > 20) p.trail.shift();
      
      // Apply drag
      p.vx *= 0.99;
      p.vy *= 0.99;
      
      // Wrap around screen
      if(p.x < 0) p.x = width;
      if(p.x > width) p.x = 0;
      if(p.y < 0) p.y = height;
      if(p.y > height) p.y = 0;
    }
  }
}

function drawFlowField(buffer) {
  if(!flowField.enabled || !buffer) return;
  
  buffer.push();
  
  // Draw flow field vectors (optional visualization)
  if(frameCount % 120 === 0) { // Draw vectors occasionally
    buffer.stroke(255, 50);
    buffer.strokeWeight(1);
    for(let v of flowField.vectors) {
      let x2 = v.x + cos(v.angle) * v.magnitude * 10;
      let y2 = v.y + sin(v.angle) * v.magnitude * 10;
      buffer.line(v.x, v.y, x2, y2);
    }
  }
  
  // Draw particles and trails
  buffer.noFill();
  for(let p of flowField.particles) {
    if(p.trail.length > 1) {
      buffer.stroke(p.color);
      buffer.strokeWeight(1);
      buffer.beginShape();
      buffer.noFill();
      for(let point of p.trail) {
        buffer.vertex(point.x, point.y);
      }
      buffer.endShape();
    }
    
    // Draw particle
    buffer.fill(p.color);
    buffer.noStroke();
    buffer.circle(p.x, p.y, 3);
  }
  
  buffer.pop();
}

// Cellular Automata System
function initializeCellularAutomata() {
  cellularAutomata.grid = [];
  
  // Initialize grid with random cells
  for(let x = 0; x < cellularAutomata.width; x++) {
    cellularAutomata.grid[x] = [];
    for(let y = 0; y < cellularAutomata.height; y++) {
      cellularAutomata.grid[x][y] = random() < 0.3 ? 1 : 0;
    }
  }
  
  console.log('Cellular automata initialized:', cellularAutomata.width, 'x', cellularAutomata.height);
}

function updateCellularAutomata() {
  if(!cellularAutomata.enabled) return;
  if(frameCount % cellularAutomata.updateRate !== 0) return;
  
  let newGrid = [];
  
  // Audio modulation of rules
  let bassInfluence = audioActive ? audioAnalyzer.bands.bass.energy / 255 : 0;
  let modifiedBirth = [...cellularAutomata.rules.birth];
  let modifiedSurvival = [...cellularAutomata.rules.survival];
  
  if(cellularAutomata.rules.audioModulated && bassInfluence > 0.7) {
    modifiedBirth.push(2); // Allow easier birth on strong bass
  }
  
  for(let x = 0; x < cellularAutomata.width; x++) {
    newGrid[x] = [];
    for(let y = 0; y < cellularAutomata.height; y++) {
      let neighbors = countNeighbors(x, y);
      let currentCell = cellularAutomata.grid[x][y];
      
      if(currentCell === 1) {
        // Cell is alive - check survival
        newGrid[x][y] = modifiedSurvival.includes(neighbors) ? 1 : 0;
      } else {
        // Cell is dead - check birth
        newGrid[x][y] = modifiedBirth.includes(neighbors) ? 1 : 0;
      }
    }
  }
  
  cellularAutomata.grid = newGrid;
  cellularAutomata.generation++;
}

function countNeighbors(x, y) {
  let count = 0;
  for(let i = -1; i <= 1; i++) {
    for(let j = -1; j <= 1; j++) {
      if(i === 0 && j === 0) continue;
      
      let nx = (x + i + cellularAutomata.width) % cellularAutomata.width;
      let ny = (y + j + cellularAutomata.height) % cellularAutomata.height;
      
      count += cellularAutomata.grid[nx][ny];
    }
  }
  return count;
}

function drawCellularAutomata(buffer) {
  if(!cellularAutomata.enabled || !buffer) return;
  
  let cellWidth = width / cellularAutomata.width;
  let cellHeight = height / cellularAutomata.height;
  
  buffer.push();
  buffer.noStroke();
  
  for(let x = 0; x < cellularAutomata.width; x++) {
    for(let y = 0; y < cellularAutomata.height; y++) {
      if(cellularAutomata.grid[x][y] === 1) {
        // Use current palette colors
        let colorIndex = (x + y) % currentPalette.length;
        let cellColor = currentPalette[colorIndex];
        
        buffer.fill(red(cellColor), green(cellColor), blue(cellColor), 150);
        buffer.rect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
      }
    }
  }
  
  buffer.pop();
}

// Typography System
function initializeTypography() {
  // Note: Would need to load a font file for full typography features
  // For now, we'll use built-in text rendering
  typography.particles = [];
  
  console.log('Typography system initialized');
}

function updateTypography() {
  if(!typography.enabled) return;
  
  // Create text particles based on audio
  if(audioActive && audioAnalyzer.onset && typography.particles.length < 50) {
    for(let i = 0; i < 5; i++) {
      typography.particles.push({
        x: width/2 + random(-100, 100),
        y: height/2 + random(-100, 100),
        vx: random(-2, 2),
        vy: random(-2, 2),
        char: typography.text[floor(random(typography.text.length))],
        size: random(20, 60),
        life: 255,
        color: random(currentPalette)
      });
    }
  }
  
  // Update text particles
  for(let i = typography.particles.length - 1; i >= 0; i--) {
    let p = typography.particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 2;
    p.vx *= 0.98;
    p.vy *= 0.98;
    
    if(p.life <= 0) {
      typography.particles.splice(i, 1);
    }
  }
}

function drawTypography(buffer) {
  if(!typography.enabled || !buffer) return;
  
  buffer.push();
  buffer.textAlign(CENTER, CENTER);
  
  // Ensure we have valid text
  let displayText = typography.text || 'GENUARY';
  
  // Draw main text with better visibility
  let audioScale = audioActive ? 1 + audioAnalyzer.rms * 0.5 : 1;
  let textSize = 60 * audioScale; // Smaller, more visible size
  buffer.textSize(textSize);
  
  // Draw text outline for better visibility
  buffer.stroke(255);
  buffer.strokeWeight(2);
  buffer.fill(0, 150);
  buffer.text(displayText, width/2, height/2);
  
  // Draw main text fill
  buffer.noStroke();
  buffer.fill(255, 200);
  buffer.text(displayText, width/2, height/2);
  
  // Draw text particles
  for(let p of typography.particles) {
    buffer.textSize(p.size);
    buffer.noStroke();
    buffer.fill(red(p.color), green(p.color), blue(p.color), p.life);
    buffer.text(p.char, p.x, p.y);
  }
  
  buffer.pop();
}

// L-System
function initializeLSystem() {
  generateLSystem();
  console.log('L-System initialized with', lSystem.path.length, 'commands');
}

function generateLSystem() {
  // Change L-System type based on audio or time
  if(frameCount % lSystem.changeInterval === 0) {
    if(audioActive && audioAnalyzer.onset) {
      lSystem.currentType = (lSystem.currentType + 1) % lSystem.types.length;
    } else if(!audioActive) {
      lSystem.currentType = Math.floor(frameCount / lSystem.changeInterval) % lSystem.types.length;
    }
  }
  
  let currentLSystem = lSystem.types[lSystem.currentType];
  let current = currentLSystem.axiom;
  
  for(let i = 0; i < currentLSystem.iterations; i++) {
    let next = '';
    for(let char of current) {
      next += currentLSystem.rules[char] || char;
    }
    current = next;
    if(next.length > 10000) break; // Prevent memory issues
  }
  
  // Convert to drawing commands with stack for branching
  lSystem.path = [];
  let x = width / 2;
  let y = height * 0.8; // Start lower
  let angle = -90; // Start pointing up
  let stack = [];
  
  for(let char of current) {
    switch(char) {
      case 'F':
      case 'G':
        let newX = x + cos(radians(angle)) * currentLSystem.length;
        let newY = y + sin(radians(angle)) * currentLSystem.length;
        lSystem.path.push({type: 'line', x1: x, y1: y, x2: newX, y2: newY, color: currentPalette[lSystem.path.length % currentPalette.length]});
        x = newX;
        y = newY;
        break;
      case '+':
        angle += currentLSystem.angle;
        break;
      case '-':
        angle -= currentLSystem.angle;
        break;
      case '[': // Push state (for branching)
        stack.push({x: x, y: y, angle: angle});
        break;
      case ']': // Pop state
        if(stack.length > 0) {
          let state = stack.pop();
          x = state.x;
          y = state.y;
          angle = state.angle;
        }
        break;
    }
  }
}

function drawLSystem(buffer) {
  if(!lSystem.enabled || !buffer) return;
  
  buffer.push();
  buffer.noFill();
  
  let audioInfluence = audioActive ? 1 + audioAnalyzer.rms * 2 : 1;
  
  for(let i = 0; i < lSystem.path.length; i++) {
    let cmd = lSystem.path[i];
    if(cmd.type === 'line') {
      // Use the stored color or default
      let lineColor = cmd.color || currentPalette[i % currentPalette.length];
      buffer.stroke(red(lineColor), green(lineColor), blue(lineColor), 150);
      buffer.strokeWeight(audioInfluence);
      buffer.line(cmd.x1, cmd.y1, cmd.x2, cmd.y2);
    }
  }
  
  buffer.pop();
}

// Fractal System
function initializeFractalSystem() {
  console.log('Fractal system initialized');
}

function drawFractals(buffer) {
  if(!fractalSystem.enabled || !buffer) return;
  
  buffer.push();
  
  switch(fractalSystem.type) {
    case 'mandelbrot':
      drawMandelbrot(buffer);
      break;
    case 'julia':
      drawJulia(buffer);
      break;
    case 'sierpinski':
      drawSierpinski(buffer);
      break;
  }
  
  buffer.pop();
}

function drawMandelbrot(buffer) {
  let audioZoom = audioActive ? 1 + audioAnalyzer.rms * 0.5 : 1;
  let zoom = fractalSystem.zoom * audioZoom;
  
  // Much more aggressive optimization for performance
  let step = 8; // Larger pixel blocks
  let maxIterations = 20; // Fewer iterations
  
  buffer.noStroke();
  
  for(let x = 0; x < width; x += step) {
    for(let y = 0; y < height; y += step) {
      let a = map(x, 0, width, -2.5 / zoom, 1 / zoom);
      let b = map(y, 0, height, -1.25 / zoom, 1.25 / zoom);
      
      let ca = a;
      let cb = b;
      let n = 0;
      
      while(n < maxIterations) {
        let aa = a * a - b * b;
        let bb = 2 * a * b;
        a = aa + ca;
        b = bb + cb;
        
        if(a * a + b * b > 4) break; // Simplified escape condition
        n++;
      }
      
      if(n < maxIterations) {
        let colorIndex = n % currentPalette.length;
        let fractalColor = currentPalette[colorIndex];
        buffer.fill(red(fractalColor), green(fractalColor), blue(fractalColor), 100);
        buffer.rect(x, y, step, step);
      }
    }
  }
}

function drawJulia(buffer) {
  let audioC = audioActive ? audioAnalyzer.rms * 0.3 : 0;
  let c = {
    x: fractalSystem.juliaC.x + audioC,
    y: fractalSystem.juliaC.y
  };
  
  // Optimized Julia set
  let step = 8;
  let maxIterations = 15;
  buffer.noStroke();
  
  for(let x = 0; x < width; x += step) {
    for(let y = 0; y < height; y += step) {
      let a = map(x, 0, width, -1.5, 1.5);
      let b = map(y, 0, height, -1.5, 1.5);
      
      let n = 0;
      while(n < maxIterations) {
        let aa = a * a - b * b;
        let bb = 2 * a * b;
        a = aa + c.x;
        b = bb + c.y;
        
        if(a * a + b * b > 4) break;
        n++;
      }
      
      if(n < maxIterations) {
        let colorIndex = n % currentPalette.length;
        let fractalColor = currentPalette[colorIndex];
        buffer.fill(red(fractalColor), green(fractalColor), blue(fractalColor), 80);
        buffer.rect(x, y, step, step);
      }
    }
  }
}

function drawSierpinski(buffer) {
  // Simplified Sierpinski triangle
  buffer.stroke(255, 100);
  buffer.noFill();
  
  let audioLevels = audioActive ? Math.floor(4 + audioAnalyzer.rms * 3) : 5;
  drawSierpinskiRecursive(buffer, width/2, 50, 300, audioLevels);
}

function drawSierpinskiRecursive(buffer, x, y, size, level) {
  if(level === 0) {
    buffer.triangle(
      x, y,
      x - size/2, y + size * 0.866,
      x + size/2, y + size * 0.866
    );
  } else {
    let newSize = size / 2;
    drawSierpinskiRecursive(buffer, x, y, newSize, level - 1);
    drawSierpinskiRecursive(buffer, x - size/4, y + size * 0.433, newSize, level - 1);
    drawSierpinskiRecursive(buffer, x + size/4, y + size * 0.433, newSize, level - 1);
  }
}

// Machine Learning Features
function initializeMLFeatures() {
  console.log('ML features initialized');
}

function updateMLFeatures() {
  if(!mlFeatures.enabled || !audioActive) return;
  
  // Simple beat pattern learning
  if(audioAnalyzer.onset) {
    let timeSinceLastBeat = millis() - (mlFeatures.beatLearning.patterns[mlFeatures.beatLearning.patterns.length - 1] || 0);
    mlFeatures.beatLearning.patterns.push(millis());
    
    if(mlFeatures.beatLearning.patterns.length > 50) {
      mlFeatures.beatLearning.patterns.shift();
    }
    
    // Simple tempo estimation
    if(mlFeatures.beatLearning.patterns.length > 2) {
      let intervals = [];
      for(let i = 1; i < mlFeatures.beatLearning.patterns.length; i++) {
        intervals.push(mlFeatures.beatLearning.patterns[i] - mlFeatures.beatLearning.patterns[i-1]);
      }
      let avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
      advancedAudio.tempo = 60000 / avgInterval; // BPM
    }
  }
  
  // Simple genre classification based on frequency characteristics
  if(frameCount % 60 === 0) { // Update every second
    let bassRatio = audioAnalyzer.bands.bass.energy / (audioAnalyzer.bands.treble.energy + 1);
    let midRange = (audioAnalyzer.bands.lowMid.energy + audioAnalyzer.bands.highMid.energy) / 2;
    
    if(bassRatio > 1.5 && advancedAudio.tempo > 120) {
      advancedAudio.genre = 'Electronic/Dance';
    } else if(midRange > 150 && advancedAudio.tempo < 100) {
      advancedAudio.genre = 'Ambient';
    } else if(audioAnalyzer.bands.treble.energy > 180) {
      advancedAudio.genre = 'Rock/Pop';
    } else {
      advancedAudio.genre = 'Unknown';
    }
  }
}

// Phase 3 Draw Loop Integration
function updatePhase3Systems() {
  // Update recording systems
  if(exportSystem.recording && exportSystem.recordingType === 'gif' && exportSystem.gifRecorder) {
    // Capture frame every 3 frames (20fps for smoother GIF)
    if(frameCount % 3 === 0) {
      try {
        // Get canvas element and add frame to GIF
        let canvasElement = document.querySelector('canvas');
        if(canvasElement) {
          // Create image from canvas for GIF
          let ctx = canvasElement.getContext('2d');
          let imageData = ctx.getImageData(0, 0, canvasElement.width, canvasElement.height);
          
          exportSystem.gifRecorder.addFrame(imageData, {delay: 50}); // 50ms = 20fps
          exportSystem.frameCount++;
          
          // Log progress every 20 frames
          if(exportSystem.frameCount % 20 === 0) {
            console.log('GIF frames captured:', exportSystem.frameCount);
          }
          
          // Stop after 200 frames (10 seconds at 20fps)
          if(exportSystem.frameCount >= 200) {
            stopGIFRecording();
          }
        } else {
          console.warn('Canvas element not found for GIF recording');
        }
      } catch(e) {
        console.error('Error capturing GIF frame:', e);
        console.log('Attempting alternative frame capture method...');
        
        // Fallback method
        try {
          exportSystem.gifRecorder.addFrame(canvas.elt, {copy: true, delay: 50});
          exportSystem.frameCount++;
        } catch(e2) {
          console.error('Fallback frame capture also failed:', e2);
        }
      }
    }
  }
  
  // Auto-save presets if enabled
  if(presetManager.autoSave && frameCount % 1800 === 0) { // Every 30 seconds at 60fps
    try {
      localStorage.setItem('genuary_day1_autosave', JSON.stringify(getCurrentSettings()));
    } catch(e) {
      // Ignore storage errors
    }
  }
}


