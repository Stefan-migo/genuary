let tiles = []; // Stores all placed buildings
let trees = []; // Stores tree positions
let tileWidth = 80; // Width of each grid tile
let tileHeight = 40; // Height of each grid tile
let heightPerUnit = 50; // Height scaling for buildings
let angle = 0; // Rotation angle (in degrees)
let zoomLevel = 0.4; // Zoom level
let environmentHealth = 100; // Environmental health (starts at 100%)
let profit = 0; // Profit from buildings
let gridSize = 11; // Grid size (11x11)
let totalTiles = gridSize * gridSize; // Total tiles in the grid
let riverTiles = gridSize; // Number of tiles occupied by the river
let blockedTiles = new Set(); // Tracks blocked grid tiles
let isDragging = false; // Tracks if the user is dragging the screen
let dragStartX, dragStartY; // Tracks the starting position of the drag
let offsetX = 0, offsetY = 0; // Tracks the screen offset
let isButtonClicked = false; // Tracks if a button is clicked
let colorPalettes = []; // Will store all color palettes
let selectedPalette; // Will store the palette for this game session

function preload() {
  // Load the CSV file
  colorsCSV = loadTable('colors.csv', 'csv', 'header');
}


function setup() {
  createCanvas(800, 600);
  angleMode(DEGREES);
  noStroke();

  // Parse the CSV data into color palettes
  for (let i = 0; i < colorsCSV.getRowCount(); i++) {
    let palette = [];
    for (let j = 0; j < 15; j += 3) { // Each row has 5 colors (R,G,B x5)
      let r = colorsCSV.getNum(i, j);
      let g = colorsCSV.getNum(i, j+1);
      let b = colorsCSV.getNum(i, j+2);
      palette.push(color(r, g, b));
    }
    colorPalettes.push(palette);
  }

  // Select one random palette for the entire game session
  selectedPalette = random(colorPalettes);


  // Draw a river when the game starts
  drawRiver();

  // Add an instructions button
  createInstructionsButton();
}

function draw() {
  background(100);

  // Draw the grid and other elements with transformations
  push(); // Save the current transformation state
  translate(width / 2 + offsetX, height / 2 + offsetY); // Center the grid with offset
  scale(zoomLevel); // Apply zoom
  rotate(angle); // Apply rotation

  // Draw the isometric grid
  drawGrid();

  // Draw the river
  drawRiver();

  // Draw all placed buildings
  tiles.forEach(building => {
    drawBuilding(building.x, building.y, building.w, building.h, building.d);
  });

  // Draw all placed trees
  trees.forEach(tree => {
    let screenPos = isoToScreen(tree.x, tree.y, 0);
    drawTree(screenPos.x, screenPos.y);
  });

  // Highlight the tile under the mouse
  let mouseGridPos = screenToIso((mouseX - width / 2 - offsetX) / zoomLevel, (mouseY - height / 2 - offsetY) / zoomLevel);
  if (isWithinGrid(mouseGridPos.x, mouseGridPos.y)) {
    let screenPos = isoToScreen(mouseGridPos.x, mouseGridPos.y, 0);
    fill(255, 200);
    drawTile(screenPos.x, screenPos.y);
  }

  // Draw pollution overlay if health is low
  if (environmentHealth < 60) {
    drawPollutionOverlay();
  }

  pop(); // Restore the transformation state

  // Draw UI (health bar and profit counter) outside the grid
  drawUI();

  // Check for endgame condition
  if (environmentHealth <= 0) {
    endGame();
  }

  // Check for win condition
  if (checkWinCondition()) {
    displayWinMessage();
  }

  // Check for lose condition: grid filled but health below 60%
  let occupiedTiles = tiles.length + trees.length + riverTiles;
  if (occupiedTiles === totalTiles && environmentHealth <= 60) {
    endGame();
  }
}

function mousePressed() {
  // Check if a button was clicked
  if (isButtonClicked) {
    isButtonClicked = false;
    return;
  }

  // Right-click to drag the screen
  if (mouseButton === RIGHT) {
    isDragging = true;
    dragStartX = mouseX - offsetX;
    dragStartY = mouseY - offsetY;
  }

  // Left-click to place buildings or trees
  if (mouseButton === LEFT) {
    let mouseGridPos = screenToIso((mouseX - width / 2 - offsetX) / zoomLevel, (mouseY - height / 2 - offsetY) / zoomLevel);

    // Check if the tile is within the grid
    if (!isWithinGrid(mouseGridPos.x, mouseGridPos.y)) {
      return;
    }

    // Check if the tile is already occupied by a building, tree, or river
    let isOccupied = isTileBlocked(mouseGridPos.x, mouseGridPos.y) ||
                     isRiverTile(mouseGridPos.x, mouseGridPos.y);

    if (!isOccupied) {
      if (keyIsDown(CONTROL)) {
        // Add a tree
        trees.push({ x: mouseGridPos.x, y: mouseGridPos.y });
        blockedTiles.add(`${mouseGridPos.x},${mouseGridPos.y}`);
        environmentHealth = constrain(environmentHealth + 5, 0, 100); // Trees heal
      } else {
        // Add a building
        let building = {
          x: mouseGridPos.x,
          y: mouseGridPos.y,
          w: 1, // Width (in grid units)
          h: 1, // Height (in grid units)
          d: floor(random(1, 1)) // Depth (random height)
        };
        tiles.push(building);

        // Block all tiles occupied by the building
        for (let i = 0; i < building.w; i++) {
          for (let j = 0; j < building.d; j++) {
            blockedTiles.add(`${building.x + i},${building.y + j}`);
          }
        }

        profit += 100; // Profit increases
        environmentHealth = constrain(environmentHealth - 10, 0, 100); // Buildings harm

        // Kill a random tree when health drops below 30%
        if (environmentHealth < 30 && trees.length > 0) {
          let randomTree = trees.splice(floor(random(trees.length)), 1)[0];
          blockedTiles.delete(`${randomTree.x},${randomTree.y}`);
        }
      }
    }
  }
}

function mouseDragged() {
  // Drag the screen with the right mouse button
  if (isDragging && mouseButton === RIGHT) {
    offsetX = mouseX - dragStartX;
    offsetY = mouseY - dragStartY;
  }
}

function mouseReleased() {
  // Stop dragging when the mouse is released
  if (mouseButton === RIGHT) {
    isDragging = false;
  }
}

function keyPressed() {
  // Rotate the view with arrow keys
  if (keyCode === LEFT_ARROW) {
    angle -= 90;
  } else if (keyCode === RIGHT_ARROW) {
    angle += 90;
  }

  // Zoom in/out with + and - keys
  if (key === '+' || key === '=') {
    zoomLevel *= 1.1;
  } else if (key === '-' || key === '_') {
    zoomLevel *= 0.9;
  }
}

// Draw a single grid tile
function drawTile(x, y) {
  beginShape();
  vertex(x, y);
  vertex(x + tileWidth, y - tileHeight / 2);
  vertex(x, y - tileHeight);
  vertex(x - tileWidth, y - tileHeight / 2);
  endShape(CLOSE);
}

// Draw the entire grid
function drawGrid() {
  for (let x = -5; x <= 5; x++) {
    for (let y = -5; y <= 5; y++) {
      let screenPos = isoToScreen(x, y, 0);
      fill(200);
      drawTile(screenPos.x, screenPos.y);
    }
  }
}

// Draw a building with windows and doors
function drawBuilding(x, y, w, h, d) {
  let screenPos = isoToScreen(x, y, 0);

  // Base (top face)
  fill(selectedPalette[0]);
  beginShape();
  vertex(screenPos.x, screenPos.y);
  vertex(screenPos.x + w * tileWidth, screenPos.y - w * tileHeight / 2);
  vertex(screenPos.x + w * tileWidth - d * tileWidth, screenPos.y - w * tileHeight / 2 - d * tileHeight / 2);
  vertex(screenPos.x - d * tileWidth, screenPos.y - d * tileHeight / 2);
  endShape(CLOSE);

  // Front face
  fill(selectedPalette[1]);
  beginShape();
  vertex(screenPos.x, screenPos.y);
  vertex(screenPos.x + w * tileWidth, screenPos.y - w * tileHeight / 2);
  vertex(screenPos.x + w * tileWidth, screenPos.y - w * tileHeight / 2 - h * heightPerUnit);
  vertex(screenPos.x, screenPos.y - h * heightPerUnit);
  endShape(CLOSE);

  // Add windows to the front face
  fill(selectedPalette[2]);
  let windowWidth = tileWidth * 0.2;
  let windowHeight = heightPerUnit * 0.4;
  let windowSpacingX = tileWidth * 0.25;
  let windowSpacingY = heightPerUnit * 0.5;

  for (let i = 0; i < w; i++) {
    for (let j = 0; j < h; j++) {
      let windowX = screenPos.x + (i + 0.25) * tileWidth;
      let windowY = screenPos.y - (j + 0.25) * heightPerUnit - w * tileHeight / 2;
      rect(windowX, windowY, windowWidth, windowHeight);
    }
  }

  // Add a door to the front face
  fill(selectedPalette[3]); // Brown color for the door
  let doorWidth = tileWidth * 0.4;
  let doorHeight = heightPerUnit * 0.8;
  let doorX = screenPos.x + (w / 2 - 0.2) * tileWidth;
  let doorY = screenPos.y - (h - 0.2) * heightPerUnit - w * tileHeight / 2;
  rect(doorX, doorY, doorWidth, doorHeight);

  // Side face
  fill(100);
  beginShape();
  vertex(screenPos.x + w * tileWidth, screenPos.y - w * tileHeight / 2);
  vertex(screenPos.x + w * tileWidth - d * tileWidth, screenPos.y - w * tileHeight / 2 - d * tileHeight / 2);
  vertex(screenPos.x + w * tileWidth - d * tileWidth, screenPos.y - w * tileHeight / 2 - d * tileHeight / 2 - h * heightPerUnit);
  vertex(screenPos.x + w * tileWidth, screenPos.y - w * tileHeight / 2 - h * heightPerUnit);
  endShape(CLOSE);

  // Add windows to the side face
  fill(selectedPalette[4]);
  for (let i = 0; i < d; i++) {
    for (let j = 0; j < h; j++) {
      let windowX = screenPos.x + w * tileWidth - (i + 0.25) * tileWidth;
      let windowY = screenPos.y - w * tileHeight / 2 - (j + 0.25) * heightPerUnit;
      rect(windowX, windowY, windowWidth, windowHeight);
    }
  }

  // Add a roof
  fill(selectedPalette[2]);
  beginShape();
  vertex(screenPos.x, screenPos.y - h * heightPerUnit);
  vertex(screenPos.x + w * tileWidth, screenPos.y - w * tileHeight / 2 - h * heightPerUnit);
  vertex(screenPos.x + w * tileWidth - d * tileWidth, screenPos.y - w * tileHeight / 2 - d * tileHeight / 2 - h * heightPerUnit);
  vertex(screenPos.x - d * tileWidth, screenPos.y - d * tileHeight / 2 - h * heightPerUnit);
  endShape(CLOSE);
}

// Draw a river crossing the entire grid
function drawRiver() {

  let riverColor = colorPalettes.length > 0 ? colorPalettes[0][0] : color(30, 144, 255);
  fill(riverColor); // Blue color for the river
  for (let x = -5; x <= 5; x++) {
    let screenPos = isoToScreen(x, 0, 0); // River runs along y = 0
    drawTile(screenPos.x, screenPos.y);
  }
}

// Check if a tile is part of the river
function isRiverTile(x, y) {
  return y === 0; // River runs along y = 0
}

// Check if a tile is blocked
function isTileBlocked(x, y) {
  return blockedTiles.has(`${x},${y}`);
}

// Check if a tile is within the grid boundaries
function isWithinGrid(x, y) {
  return x >= -5 && x <= 5 && y >= -5 && y <= 5;
}

// Draw a realistic tree with layered foliage and a detailed trunk
function drawTree(x, y) {
  // Trunk
  fill(selectedPalette[1]); // Brown color
  beginShape();
  vertex(x - tileWidth / 8, y - tileHeight / 2);
  vertex(x + tileWidth / 8, y - tileHeight / 2);
  vertex(x + tileWidth / 8, y);
  vertex(x - tileWidth / 8, y);
  endShape(CLOSE);

  // Foliage (layered ellipses for a natural look)
  let greenShade = map(environmentHealth, 0, 100, 50, 34); // Trees wilt as health decreases
  fill(greenShade, 139, 34); // Green color
  ellipse(x, y - tileHeight, tileWidth / 2, tileHeight); // Bottom layer
  ellipse(x, y - tileHeight * 1.2, tileWidth / 2.5, tileHeight * 0.8); // Middle layer
  ellipse(x, y - tileHeight * 1.4, tileWidth / 3, tileHeight * 0.6); // Top layer
}

// Draw pollution overlay when health is low
function drawPollutionOverlay() {
  fill(100, 100, 100, map(environmentHealth, 0, 50, 100, 0));
  rect(-width, -height, width * 2, height * 2);
}

// Draw UI (health bar and profit counter)
function drawUI() {
  // Reset transformations for UI
  push();
  resetMatrix();

  // Environmental health bar (below restart button)
  let uiX = 13; // X position (left-aligned)
  let uiY = 95; // Y position (below restart button)
  let barWidth = 200; // Width of the health bar
  let barHeight = 20; // Height of the health bar

  // Health bar background
  fill(0);
  rect(uiX, uiY, barWidth, barHeight);

  // Health bar fill (green)
  fill(34, 139, 34, map(environmentHealth, 0, 100, 100, 255));
  rect(uiX, uiY, map(environmentHealth, 0, 100, 0, barWidth), barHeight);

  // Health percentage text
  fill(255);
  textAlign(LEFT);
  textSize(16);
  text(`Health: ${environmentHealth}%`, uiX + barWidth + 10, uiY + barHeight / 2 + 5);

  // Profit counter (below the health bar)
  text(`Profit: $${profit}`, uiX, uiY + barHeight + 20);

  pop(); // Restore the transformation state
}

// Check for win condition
function checkWinCondition() {
  // Total occupied tiles = buildings + trees + river
  let occupiedTiles = tiles.length + trees.length + riverTiles;

  // Check if all tiles are occupied and environment health is above 60%
  return occupiedTiles === totalTiles && environmentHealth > 60;
}

// Display win message
function displayWinMessage() {
  background(0);
  fill(255);
  textAlign(CENTER);
  textSize(24);
  text("Well done! You understand how important nature is.", width / 2, height / 2);

  // Add restart button
  createRestartButton();
  noLoop(); // Stop the game
}

// Endgame condition
function endGame() {
  background(0);
  fill(255);
  textAlign(CENTER);
  textSize(24);

  // Check if the grid is filled but health is below 60%
  let occupiedTiles = tiles.length + trees.length + riverTiles;
  if (occupiedTiles === totalTiles && environmentHealth <= 60) {
    text("You filled the grid, but nature is too damaged. You lose!", width / 2, height / 2);
  } else if (environmentHealth <= 0) {
    text("Urban Collapse: You prioritized profit over nature.", width / 2, height / 2);
  }

  // Add restart button
  createRestartButton();
  noLoop(); // Stop the game
}

// Create an instructions button
function createInstructionsButton() {
  let button = createButton('Instructions');
  button.position(20, 20);
  button.mousePressed(() => {
    isButtonClicked = true;
    showInstructions();
  });
}

// Show instructions in a modal
function showInstructions() {
  let modal = createDiv();
  modal.style('position', 'absolute');
  modal.style('top', '50%');
  modal.style('left', '50%');
  modal.style('transform', 'translate(-50%, -50%)');
  modal.style('background', 'white');
  modal.style('padding', '20px');
  modal.style('border-radius', '10px');
  modal.style('box-shadow', '0 0 10px rgba(0, 0, 0, 0.5)');
  modal.style('z-index', '1000');

  let instructions = `
    <h2>How to Play</h2>
    <p><strong>Left Click:</strong> Place a building.</p>
    <p><strong>Ctrl + Left Click:</strong> Plant a tree.</p>
    <p><strong>Right Click + Drag:</strong> Move the screen.</p>
    <p><strong>Arrow Keys:</strong> Rotate the view.</p>
    <p><strong>+/- Keys:</strong> Zoom in/out.</p>
    <p><strong>Goal:</strong> Fill the grid with buildings and trees without destroying nature.</p>
  `;
  modal.html(instructions);

  let closeButton = createButton('Close');
  closeButton.parent(modal);
  closeButton.mousePressed(() => modal.remove());
}

// Create a restart button
function createRestartButton() {
  let button = createButton('Restart');
  button.position(20, 60); // Positioned below the instructions button
  button.mousePressed(() => {
    isButtonClicked = true;
    restartGame();
  });
}

// Restart the game
function restartGame() {
  tiles = [];
  trees = [];
  blockedTiles = new Set();
  environmentHealth = 100;
  profit = 0;
  offsetX = 0;
  offsetY = 0;
  angle = 0;
  zoomLevel = 0.5;
  loop(); // Restart the draw loop
}

// Convert isometric grid coordinates to screen coordinates
function isoToScreen(x, y, z) {
  let x_iso = (x - y) * tileWidth;
  let y_iso = (x + y) * tileHeight / 2 - z * heightPerUnit;
  return { x: x_iso, y: y_iso };
}

// Convert screen coordinates to isometric grid coordinates
function screenToIso(x, y) {
  let x_iso = (x / tileWidth + y / tileHeight) / 2;
  let y_iso = (y / tileHeight - x / tileWidth) / 2;
  return { x: round(x_iso), y: round(y_iso) };
}