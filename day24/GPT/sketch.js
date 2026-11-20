let cols, rows;
    let triangleSize = 40;
    let timeOffset = 0;

    function setup() {
      createCanvas(windowWidth, windowHeight);
      cols = width / triangleSize;
      rows = height / (triangleSize * 0.75);
      noStroke();
    }

    function draw() {
      background(15);

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          let noiseVal = noise(x * 0.1, y * 0.1, timeOffset);
          let angle = noiseVal * TWO_PI * 2; 
          let centerX = x * triangleSize;
          let centerY = y * triangleSize * 0.75;

          let sizeMod = map(noiseVal, 0, 1, 0.6, 1.4);
          let s = triangleSize * sizeMod;

          let hueVal = (noiseVal * 360) % 360;
          fill(hueVal, 100, 100, 180);

          drawTriangle(centerX, centerY, s, angle);
        }
      }
      
      timeOffset += 0.01;
    }

    function drawTriangle(x, y, s, angle) {
      let points = [
        createVector(x, y - s / 2),
        createVector(x - s / 2, y + s / 2),
        createVector(x + s / 2, y + s / 2)
      ];

      for (let i = 0; i < points.length; i++) {
        let p = points[i];
        let rotatedX = cos(angle) * (p.x - x) - sin(angle) * (p.y - y) + x;
        let rotatedY = sin(angle) * (p.x - x) + cos(angle) * (p.y - y) + y;
        points[i] = createVector(rotatedX, rotatedY);
      }

      triangle(points[0].x, points[0].y, points[1].x, points[1].y, points[2].x, points[2].y);
    }

    function windowResized() {
      resizeCanvas(windowWidth, windowHeight);
      cols = width / triangleSize;
      rows = height / (triangleSize * 0.75);
    }