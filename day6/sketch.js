let img;
let shapes = [];
let cellSize = 5;
let showOriginal = false;
let availableShapes = ['rect', 'ellipse', 'triangle'];
let imgScale = 1;

// DOM elements
let detailSlider, detailValue, shapeSelect, colorModeSelect;
let generateBtn, saveBtn, toggleBtn;

function setup() {
  createCanvas(800, 600).parent('container');
  
  // Initialize DOM elements
  detailSlider = select('#detailSlider');
  detailValue = select('#detailValue');
  shapeSelect = select('#shapeSelect');
  colorModeSelect = select('#colorMode');
  generateBtn = select('#generateBtn');
  saveBtn = select('#saveBtn');
  toggleBtn = select('#toggleBtn');
  
  // Set up event listeners
  select('#imageUpload').changed(handleFile);
  detailSlider.input(updateDetailValue);
  generateBtn.mousePressed(generateArt);
  saveBtn.mousePressed(saveImage);
  toggleBtn.mousePressed(toggleOriginal);
  
  // Default image
  img = createImage(800, 600);
  img.loadPixels();
  for (let i = 0; i < img.width; i++) {
    for (let j = 0; j < img.height; j++) {
      let c = color(
        map(i, 0, img.width, 100, 200),
        map(j, 0, img.height, 150, 250),
        200
      );
      img.set(i, j, c);
    }
  }
  img.updatePixels();
  generateArt();
}

function draw() {
  background(240);
  
  if (showOriginal && img) {
    // Draw the original image centered and scaled
    imageMode(CENTER);
    image(img, width/2, height/2, img.width * imgScale, img.height * imgScale);
  } else {
    // Draw all shapes centered on canvas accounting for scaling
    push();
    translate(width/2, height/2);
    scale(imgScale);
    translate(-img.width/2, -img.height/2);
    
    shapes.forEach(s => {
      fill(s.color);
      noStroke();
      
      push();
      translate(s.x, s.y);
      rotate(s.rotation);
      
      switch(s.type) {
        case 'rect':
          rect(-s.w/2, -s.h/2, s.w, s.h);
          break;
        case 'ellipse':
          ellipse(0, 0, s.w, s.h);
          break;
        case 'triangle':
          triangle(
            -s.w/2, s.h/2,
            s.w/2, s.h/2,
            0, -s.h/2
          );
          break;
      }
      pop();
    });
    pop();
  }
  
  // Display instructions if no image is loaded
  if (!img || img.width === 800 && img.height === 600) {
    fill(0, 100);
    textSize(16);
    textAlign(CENTER);
    text("Upload an image to begin", width/2, height/2);
  }
}

function handleFile() {
  const file = this.elt.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      img = loadImage(e.target.result, () => {
        // Calculate scaling factor to fit image in canvas
        imgScale = min(width/img.width, height/img.height) * 0.9;
        generateArt();
      });
    }
    reader.readAsDataURL(file);
  }
}

function generateArt() {
  if (!img) return;
  
  shapes = [];
  cellSize = parseInt(detailSlider.value());
  
  // Get selected shape types
  availableShapes = [];
  for (let option of shapeSelect.elt.options) {
    if (option.selected) {
      availableShapes.push(option.value);
    }
  }
  
  if (availableShapes.length === 0) {
    availableShapes = ['rect'];
  }
  
  img.loadPixels();
  
  // Sample image in grid pattern
  for (let y = 0; y < img.height; y += cellSize) {
    for (let x = 0; x < img.width; x += cellSize) {
      // Get color based on selected mode
      let shapeColor;
      const colorMode = colorModeSelect.value();
      
      if (colorMode === 'average') {
        shapeColor = getAverageColor(x, y, cellSize);
      } else if (colorMode === 'dominant') {
        shapeColor = getDominantColor(x, y, cellSize);
      } else {
        const baseColor = getAverageColor(x, y, cellSize);
        shapeColor = color(
          red(baseColor) + random(-20, 20),
          green(baseColor) + random(-20, 20),
          blue(baseColor) + random(-20, 20)
        );
      }
      
      // Create shape with some variation
      const shapeType = random(availableShapes);
      const sizeVariation = random(0.7, 1.3);
      
      shapes.push({
        x: x + cellSize/2,
        y: y + cellSize/2,
        w: cellSize * sizeVariation,
        h: cellSize * sizeVariation,
        color: shapeColor,
        type: shapeType,
        rotation: random(-0.2, 0.2)
      });
    }
  }
}

function getAverageColor(x, y, size) {
  let r = 0, g = 0, b = 0, count = 0;
  
  for (let i = y; i < y + size && i < img.height; i++) {
    for (let j = x; j < x + size && j < img.width; j++) {
      const index = (i * img.width + j) * 4;
      r += img.pixels[index];
      g += img.pixels[index + 1];
      b += img.pixels[index + 2];
      count++;
    }
  }
  
  return color(r / count, g / count, b / count);
}

function getDominantColor(x, y, size) {
  const centerX = min(x + size/2, img.width - 1);
  const centerY = min(y + size/2, img.height - 1);
  const index = (floor(centerY) * img.width + floor(centerX)) * 4;
  
  return color(
    img.pixels[index],
    img.pixels[index + 1],
    img.pixels[index + 2]
  );
}

function updateDetailValue() {
  detailValue.html(detailSlider.value());
}

function saveImage() {
  saveCanvas('primitive-landscape', 'png');
}

function toggleOriginal() {
  showOriginal = !showOriginal;
  toggleBtn.html(showOriginal ? 'Show Primitive' : 'Show Original');
}

function windowResized() {
  resizeCanvas(800, 600);
}