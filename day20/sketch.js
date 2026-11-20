// Genuary 20: Generative Architecture
// Concept: Fragmented, noise-driven towers with varied materials.

let angle = 0; // For camera rotation
let detail = 10; // How many segments per "tower"
let maxTowers = 25; // Number of architectural structures
let noiseScalePos = 0.0008; // Noise scale for tower base positions
// --- CHANGE 1: Declare noiseScaleSeg here, but don't assign the random value yet ---
let noiseScaleSeg; // Noise scale for segment variations
let noiseSpeed = 0.00003; // Speed of noise evolution over time

let baseHue; // Store a base hue for the scene

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    colorMode(HSB, 360, 100, 100, 100); // HSB mode is great for generative color
    angleMode(DEGREES); // Easier to think in degrees for rotation
    noiseSeed(floor(random(100))); // Random seed for noise generation

    baseHue = random(670); // Pick a random base hue for this generation

    // --- CHANGE 2: Assign the random value inside setup() ---
    noiseScaleSeg = random(0.7); // <<< Initialize it here

    // Improve rendering quality slightly (optional)
    perspective(PI / 0.09, width / height , 1, 20000); // Adjusted perspective slightly

}

function draw() {
    background( (baseHue + 180) % 360, 30, 10 ); // Dark, desaturated complementary background

    // --- Camera & Lighting ---
    let camRadius = width * 1.9; // Adjust camera distance based on width
    let camX = sin(angle) * camRadius;
    let camZ = cos(angle) * camRadius;
    // Camera orbits around the center, looking slightly down
    camera(camX, -height * 0.08, camZ, 0, -height * 0.45, 0, 0, 1, 0); // Center X/Z slightly simplified

    // Lighting setup for mood and depth
    ambientLight( (baseHue + 60) % 360, 20, 20); // Low, cool ambient light
    directionalLight( (baseHue + 30) % 360, 60, 80, 0.5, 1, -0.8); // Main colored light source
    pointLight( (baseHue + 240) % 360, 70, 90, -width/4, -height/2, width/4); // Contrasting point light

    // --- Generative Structures ---
    noStroke(); // Cleaner look for 3D forms

    let time = frameCount * noiseSpeed; // Time dimension for noise

    for (let i = 0; i < maxTowers; i++) {
        // --- Tower Base Position ---
        // Use noise to get somewhat clustered but unpredictable base positions
        let noiseValX = noise(i * 10.5, time, 100);
        let noiseValZ = noise(i * 0.5, time, 200);
        let baseX = map(noiseValX, 0, 1, -width * 0.4, width * 0.4);
        let baseZ = map(noiseValZ, 0, 1, -width * 0.4, width * 0.4);

        // Base dimensions vary per tower using noise
        let baseW = map(noise(i * 10.1, 300), 0, 1, 30, 190);
        let baseD = map(noise(i / 50.2, 400), 0, 1, 30, 320);

        push(); // Isolate transformations for this tower
        translate(baseX, 0, baseZ); // Move to tower's base location

        let currentY = 0; // Start at ground level (adjust if needed)

        // --- Tower Segments ---
        for (let j = 0; j < detail; j++) {
            // Unique noise inputs for each segment based on tower (i), segment (j), and time
            let nIdx = i * detail + j;
            // Use the noiseScaleSeg variable assigned in setup() or mousePressed()
            let noiseX = noise(nIdx * noiseScaleSeg, time + 1000);
            let noiseY = noise(nIdx * noiseScaleSeg, time + 2000);
            let noiseZ = noise(nIdx * noiseScaleSeg, time + 3000);
            let noiseRot = noise(nIdx * noiseScaleSeg, time + 4000);
            let noiseDim = noise(nIdx * noiseScaleSeg, time + 5000);
            let noiseMat = noise(nIdx * noiseScaleSeg * 0.5, time + 6000); // Slower noise for material

            // --- Segment Properties derived from noise ---
            // Offset from the tower's central axis - increases slightly with height for more 'spread'
            let offsetX = map(noiseX, 0, 1, -baseW * 0.3, baseW * 0.3) * (1 + j * 0.05); // Reduced spread multiplier
            let offsetZ = map(noiseZ, 0, 1, -baseD * 0.3, baseD * 0.3) * (1 + j * 0.05); // Reduced spread multiplier

            // Rotation - subtle, organic tilts
            let rotX = map(noiseX, 0, 1, -10, 10);
            let rotY = map(noiseRot, 0, 1, -60, 60); // Allow more yaw rotation
            let rotZ = map(noiseZ, 0, 1, -10, 10);

            // Dimensions - general tapering + noise variation
            let taper = 1.0 - (j / (detail * 1.2)); // Gradual taper
            let segW = baseW * taper * map(noiseDim, 0, 1, 0.8, 1.2);
            let segH = map(noiseY, 0, 1, 20, 90) * (1 + (detail - j) / detail * 0.5); // Slightly taller segments near base
            let segD = baseD * taper * map(noiseDim, 0, 1, 0.8, 1.2);

             // Clamp dimensions to avoid zero or negative sizes
            segW = max(5, segW);
            segH = max(5, segH);
            segD = max(5, segD);


            // --- Material & Color ---
            push(); // Isolate transformations for this segment

            // Translate up by previous segments height + half of current segment height
            translate(offsetX, -currentY - segH / 2, offsetZ);
            rotateX(rotX);
            rotateY(rotY);
            rotateZ(rotZ);

            // Choose material based on noise
            let hueShift = map(noiseY, 0, 1, -30, 30);
            let segHue = (baseHue + hueShift + map(j, 0, detail, -20, 20)) % 360; // Vary hue slightly by height & noise
            let segSat = map(noiseX, 0, 1, 50, 90);
            let segBri = map(noiseZ, 0, 1, 60, 100);

            // Add occasional glowing ("emissive") segments
            if (noiseMat > 0.8 && j > 1) { // Threshold noise value, not on the very base
                let glowHue = (baseHue + 120 + random(-30, 30)) % 360; // Contrasting glow color
                emissiveMaterial(glowHue, 90, 100);
            } else {
                // Standard shiny material
                specularMaterial(segHue, segSat, segBri);
                shininess(15); // Adjust shininess factor
                // For a less shiny look, use ambientMaterial or normalMaterial
                // ambientMaterial(segHue, segSat, segBri);
            }

            // Draw the segment
            box(segW, segH, segD);

            pop(); // Restore state before segment transformation

            // Update the height for the next segment
            currentY += segH * map(noiseY, 0, 1, 0.85, 0.98); // Adjusted overlap/gap variation for less extreme gaps
        }
    pop(); // Restore state before tower transformation
}

angle += 0.1; // Slightly faster camera rotation
}

// Adjust canvas size when window is resized
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    perspective(PI / 0.8, width / height, 0.1, 20000); // Re-apply perspective
}

// --- Interactivity ---
// Click mouse to generate a new architectural layout
function mousePressed() {
    noiseSeed(floor(random(10000)));
    baseHue = random(360); // Get a new base color scheme

    // --- CHANGE 3: Re-randomize noiseScaleSeg on click ---
    noiseScaleSeg = random(0.5); // <<< Get a new scale for the new scene

    // Optionally reset angle or other states if desired
    angle = 0; // Reset camera angle for new scene
}