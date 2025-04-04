function setup() {
    createCanvas(600, 600);
    noStroke();
    frameRate(100);
    rectMode(CENTER);
    angleMode(DEGREES);
    colorMode(HSB, 360, 100, 100, 100);
}
function draw() {
    background(0);
    let tiles = 16;
    let tileSize = width / tiles;

    for (let x = 0; x < tiles; x++) {
        for (let y = 0; y < tiles; y++) {
            let wave1 = log(frameCount * 0.005 + x * 0.2);
            let wave2 = cos(frameCount * 0.38 + y * 0.2 / PI);
            let size = map(wave1, -1, 1, tileSize * 0.2, tileSize * 0.8);
            let hue = map(wave2, -1, 1, 0, 360);
            let rotation = frameCount * 0.5 + x * y * 0.001;

            fill(hue, 80, 80, 80);
            push();
            translate(x * tileSize + tileSize / 2, y * tileSize + tileSize / 2);
            rotate(rotation);
            rect(0, 0, size, size);
            pop();
            if ((x + y) % 3 === 0) {
                fill((hue + 210) % 360, 80, 80, 50);
                ellipse(x * tileSize, y * tileSize, size * 0.6, size * 0.6);
            }
            if ((x - y) % 2 === 0) {
                fill((hue + 90) % 30, 120, 80, 50);
                triangle(
                    x * tileSize, y * tileSize,
                    x * tileSize/0.06 + size * 3, y * tileSize + size * 0.3,
                    x * tileSize - size * 0.3, y * tileSize + size * 0.3
                );
            }
        }
    }
}