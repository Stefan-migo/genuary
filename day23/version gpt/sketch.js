/*
Genuary Day 23 – Inspired by Brutalism
Brutal Oscillations – Historia de Acumulación:
Cada click fija en el fondo una nueva generación de shapes animados, acumulándose sobre una textura de concreto en evolución.
*/

let currentShapes = [];
let accumulatedShapes; // Buffer para acumular las formas fijas

function setup() {
  // Asegurarse de que el pixelDensity sea 1 para evitar problemas en pantallas Retina
  pixelDensity(1);
  createCanvas(windowWidth, windowHeight);
  
  // Crear el buffer de shapes acumulados
  accumulatedShapes = createGraphics(windowWidth, windowHeight);
  accumulatedShapes.pixelDensity(1);
  accumulatedShapes.rectMode(CENTER);
  accumulatedShapes.angleMode(RADIANS);
  
  rectMode(CENTER);
  angleMode(RADIANS);
  
  generateShapes();
}

function draw() {
  // Actualiza el fondo con textura de concreto dinámica
  drawConcreteTexture();
  
  // Dibuja las formas acumuladas (ya fijas) en el buffer
  image(accumulatedShapes, 0, 0);
  
  // Dibuja las formas actuales con animación (estas aún no están fijadas)
  currentShapes.forEach(shape => {
    push();
    translate(shape.x, shape.y);
    // Oscilación sutil para cada forma
    let oscillation = sin(frameCount * 2 + shape.offset) * 0.05;
    rotate(shape.angle + oscillation);
    fill(shape.fillColor);
    stroke(shape.strokeColor);
    strokeWeight(shape.strokeWeight);
    rect(0, 0, shape.w, shape.h);
    pop();
  });
}

function drawConcreteTexture() {
  loadPixels();
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let index = (x + y * width) * 4;
      // Textura animada con Perlin noise y factor temporal
      let n = noise(x * 0.01, y * 0.01, frameCount * 0.01);
      let c = 220 + n * 20 + 50; // Tono base con variaciones sutiles
      pixels[index] = c;
      pixels[index + 1] = c;
      pixels[index + 2] = c;
      pixels[index + 3] = 255;
    }
  }
  updatePixels();
}

function generateShapes() {
  currentShapes = [];
  let cols = 12;
  let rows = 12;
  let marginX = width / (cols + 1);
  let marginY = height / (rows + 1);
  
  for (let i = 1; i <= cols; i++) {
    for (let j = 1; j <= rows; j++) {
      // Posicionar las formas en una cuadrícula con un offset aleatorio para dar sensación de crudeza
      let x = i * marginX + random(-marginX * 0.3, marginX * 0.3);
      let y = j * marginY + random(-marginY * 0.3, marginY * 0.3);
      let w = random(marginX * 0.6, marginX);
      let h = random(marginY * 0.6, marginY);
      let angle = random([-PI/12, 0, PI/12, PI/8, -PI/8]);
      // Offset aleatorio para la oscilación de cada forma
      let offset = random(TWO_PI / 0.5);
      
      let fillColor = color(random(180, 220));
      let strokeColor = color(50);
      let strokeWeightVal = random([3, 4, 5]);
      
      currentShapes.push({
        x: x,
        y: y,
        w: w,
        h: h,
        angle: angle,
        offset: offset,
        fillColor: fillColor,
        strokeColor: strokeColor,
        strokeWeight: strokeWeightVal
      });
    }
  }
}

function mouseClicked() {
  // Al hacer click, "fijamos" las formas actuales en el buffer acumulado
  accumulatedShapes.push();
  currentShapes.forEach(shape => {
    accumulatedShapes.push();
    accumulatedShapes.translate(shape.x, shape.y);
    // Se dibujan en su estado actual (incluyendo la oscilación en ese instante)
    let oscillation = sin(frameCount * 2 + shape.offset) * 0.05;
    accumulatedShapes.rotate(shape.angle + oscillation);
    accumulatedShapes.fill(shape.fillColor);
    accumulatedShapes.stroke(shape.strokeColor);
    accumulatedShapes.strokeWeight(shape.strokeWeight);
    accumulatedShapes.rect(0, 0, shape.w, shape.h);
    accumulatedShapes.pop();
  });
  accumulatedShapes.pop();
  
  // Genera una nueva serie de formas animadas
  generateShapes();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Al redimensionar, se recrea el buffer acumulado (se pierde la acumulación previa)
  accumulatedShapes = createGraphics(windowWidth, windowHeight);
  accumulatedShapes.pixelDensity(1);
  accumulatedShapes.rectMode(CENTER);
  accumulatedShapes.angleMode(RADIANS);
  generateShapes();
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('brutal_oscillations', 'png');
  }
}
