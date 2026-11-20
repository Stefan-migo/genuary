// Genuary Day 12: Subdivision - Recursive Voronoi
// Using p5.js and d3-delaunay

let maxDepth = 5; // How many levels of recursion
let initialPoints = 5; // Number of points for the first level
let pointsPerLevel = 3; // Number of points for subsequent levels
let minCellArea = 100; // Stop subdividing if cell area is too small (optional)

let baseHue;

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 360, 100, 100, 100);
    baseHue = random(360); // Base hue for the color palette
    background(baseHue, 10, 98); // Light background

    // Define the initial boundary (the canvas)
    let initialVertices = [
        [0, 0],
        [width, 0],
        [width, height],
        [0, height]
    ];

    // Start the recursive subdivision process
    subdivide(initialVertices, 0);

    noLoop(); // Generate a static image
}

function subdivide(parentVertices, depth) {
    // --- Stopping Conditions ---
    if (depth >= maxDepth) {
        drawCell(parentVertices, depth, true); // Draw final cell
        return;
    }

    // Calculate parent area (optional - use if minCellArea is desired)
    // let area = polygonArea(parentVertices);
    // if (area < minCellArea) {
    //     drawCell(parentVertices, depth, true); // Draw final cell
    //     return;
    // }

    // --- Calculate Bounding Box for d3 ---
    // This is the boundary within which d3.voronoi will operate.
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const v of parentVertices) {
        if (v[0] < minX) minX = v[0];
        if (v[0] > maxX) maxX = v[0];
        if (v[1] < minY) minY = v[1];
        if (v[1] > maxY) maxY = v[1];
    }
    // Add a tiny buffer to avoid points exactly on the edge if needed
    minX = max(0, minX + 0.1);
    minY = max(0, minY + 0.1);
    maxX = min(width, maxX - 0.1);
    maxY = min(height, maxY - 0.1);

    let bounds = [minX, minY, maxX, maxY];

    // Avoid degenerate bounds
    if (bounds[2] <= bounds[0] || bounds[3] <= bounds[1]) {
        drawCell(parentVertices, depth, true); // Cannot subdivide, draw parent
        return;
    }

    // --- Generate Seed Points ---
    // Generate points strictly within the calculated bounds
    let numPoints = (depth === 0) ? initialPoints : pointsPerLevel;
    let points = [];
    for (let i = 0; i < numPoints; i++) {
        // Generate points, ensuring they are within the bounds
        let px = random(bounds[0], bounds[2]);
        let py = random(bounds[1], bounds[3]);
        
        // Simple check: ensure points are not *exactly* on parent vertices (helps d3)
        let tooClose = false;
        for(const pv of parentVertices) {
            if (dist(px, py, pv[0], pv[1]) < 0.01) {
                tooClose = true;
                break;
            }
        }
        if (!tooClose) {
             points.push([px, py]);
        } else {
             i--; // Retry generating this point
        }
    }

    // Need at least 3 non-collinear points for Voronoi
    if (points.length < 3) {
        drawCell(parentVertices, depth, true); // Cannot create Voronoi, draw parent
        return;
    }

    // --- Compute Voronoi ---
    try {
        const delaunay = d3.Delaunay.from(points);
        // Calculate Voronoi diagram clipped to the 'bounds'
        const voronoi = delaunay.voronoi(bounds);

        // --- Recurse on Child Cells ---
        for (let i = 0; i < points.length; i++) {
            // voronoi.cellPolygon returns the vertices of the i-th cell,
            // already clipped to the bounding box 'bounds'.
            const cellPolygon = voronoi.cellPolygon(i);

            if (cellPolygon && cellPolygon.length > 2) {
                 // Check if cell has non-zero area before recursing
                 if (polygonArea(cellPolygon) > 1) { // Avoid tiny slivers
                    // Draw the current cell boundary *before* recursing deeper
                    // This creates a layered effect
                    drawCell(cellPolygon, depth, false);

                    // Recurse
                    subdivide(cellPolygon, depth + 1);
                } else {
                    // Draw small slivers differently or just draw them as final
                     drawCell(cellPolygon, depth, true);
                }
            } else {
                // Handle cases where cellPolygon is null or invalid (rare with bounds)
                 console.warn("Invalid cell polygon at depth", depth, "cell index", i);
                 // Optionally draw something as fallback
            }
        }
    } catch (error) {
        console.error("Error during d3.Delaunay/Voronoi computation:", error);
        console.log("Depth:", depth, "Points:", points, "Bounds:", bounds);
        // Draw the parent cell as a fallback if Voronoi fails
        drawCell(parentVertices, depth, true);
    }
}

// --- Drawing Function ---
function drawCell(vertices, depth, isFinal) {
    // Style based on depth and perhaps randomness/noise
    let hue = (baseHue + depth * 30 + random(-10, 10)) % 360;
    let saturation = map(depth, 0, maxDepth, 50, 85); // Increase saturation with depth
    let brightness = map(depth, 0, maxDepth, 95, 60); // Decrease brightness with depth
    let alpha = isFinal ? map(depth, 0, maxDepth, 50, 80) : 0; // Fill only final cells? Or adjust alpha

    // Use subtle fill for intermediate levels, stronger for final
    if (isFinal) {
        fill(hue, saturation, brightness, 70); // Semi-transparent fill for final cells
    } else {
         // noFill(); // Or a very faint fill for intermediate levels
         fill(hue, saturation * 0.6, brightness * 1.05, 15); // Faint fill
    }

    // Stroke style based on depth
    strokeWeight(map(depth, 0, maxDepth, 2.5, 0.5)); // Thicker lines for shallower depths
    let strokeBrightness = brightness * 0.5; // Darker stroke
    let strokeAlpha = map(depth, 0, maxDepth, 90, 60);
    stroke(hue, saturation, strokeBrightness, strokeAlpha);

    // Draw the polygon
    beginShape();
    for (const v of vertices) {
        vertex(v[0], v[1]);
    }
    endShape(CLOSE);
}

// --- Helper Function: Polygon Area (Shoelace Formula) ---
// Used for optional minCellArea check and sliver filtering
function polygonArea(vertices) {
    let area = 0;
    let n = vertices.length;
    for (let i = 0; i < n; i++) {
        let j = (i + 1) % n;
        if (vertices[i] && vertices[j]) { // Ensure vertices are valid points/arrays
             area += vertices[i][0] * vertices[j][1];
             area -= vertices[j][0] * vertices[i][1];
        } else {
             console.warn("Invalid vertex found in polygonArea calculation:", vertices[i], vertices[j]);
             return 0; // Invalid polygon data
        }
    }
    return Math.abs(area / 2);
}


// Optional: Regenerate on click
function mousePressed() {
    // Clear previous drawing
    background(baseHue, 10, 98);

    // Update base hue for variation
    baseHue = random(360);

     // Redefine the initial boundary (the canvas)
    let initialVertices = [
        [0, 0],
        [width, 0],
        [width, height],
        [0, height]
    ];
    
    // Restart the subdivision process
    subdivide(initialVertices, 0);
}

// Optional: Resize canvas
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
     // Clear previous drawing
    background(baseHue, 10, 98);
    
     // Redefine the initial boundary (the canvas)
    let initialVertices = [
        [0, 0],
        [width, 0],
        [width, height],
        [0, height]
    ];
    
    // Restart the subdivision process
    subdivide(initialVertices, 0);
}