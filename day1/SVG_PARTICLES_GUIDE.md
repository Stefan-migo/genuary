# 🎨 Custom SVG Particles Guide

## Overview
Your project now supports custom particle shapes! Currently, it uses built-in SVG-style graphics (star, heart, diamond), but you can easily add your own SVG illustrations.

## Current Implementation
The system automatically creates 3 custom particle shapes:
- **Star**: 5-pointed star with alternating radius points
- **Heart**: Bezier curve-based heart shape  
- **Diamond**: Simple 4-pointed crystal shape

## How to Add Your Own SVG Files

### Step 1: Prepare Your SVG Files
1. Create 3 SVG files with your custom illustrations
2. Recommended size: 20x20 pixels for best performance
3. Keep designs simple with solid fills (avoid complex gradients)
4. Name them: `particle1.svg`, `particle2.svg`, `particle3.svg`

### Step 2: Place SVG Files
Put your SVG files in the same directory as your `index.html` file:
```
day1/
├── index.html
├── sketch.js
├── colors.csv
├── day-1-genuary.mp3
├── particle1.svg    ← Your first custom shape
├── particle2.svg    ← Your second custom shape
└── particle3.svg    ← Your third custom shape
```

### Step 3: Update the Loading Code
Replace the `loadSVGParticles()` function in `sketch.js` with this version:

```javascript
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
  // Your existing custom graphics code here
  // (star, heart, diamond shapes)
}
```

### Step 4: SVG Design Tips
- **Simple shapes**: Avoid complex paths for better performance
- **Solid colors**: Use single fills rather than gradients
- **Small file size**: Keep SVGs under 5KB each
- **Consistent style**: Make all 3 particles visually cohesive

### Example SVG Files

**particle1.svg** (Star):
```xml
<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
  <path d="M10,2 L12,8 L18,8 L13,12 L15,18 L10,14 L5,18 L7,12 L2,8 L8,8 Z" fill="white"/>
</svg>
```

**particle2.svg** (Triangle):
```xml
<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
  <path d="M10,2 L18,16 L2,16 Z" fill="white"/>
</svg>
```

**particle3.svg** (Circle with inner pattern):
```xml
<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
  <circle cx="10" cy="10" r="8" fill="white"/>
  <circle cx="10" cy="10" r="4" fill="none" stroke="black" stroke-width="1"/>
</svg>
```

## Controls
- **Enable SVG Particles**: Toggle in dat.GUI under "Phase 4: Advanced"
- **Automatic fallback**: If SVGs don't load, uses built-in shapes
- **Real-time switching**: Can toggle between SVG and basic shapes anytime

## Performance Notes
- SVG particles have slightly more overhead than basic shapes
- Recommended to keep particle count under 200 when using SVGs
- The system automatically scales and colors your SVG designs
- Each particle can rotate independently for dynamic effects

## Troubleshooting
- **SVGs not showing**: Check browser console for loading errors
- **Performance issues**: Reduce particle count or simplify SVG designs
- **Wrong colors**: SVGs should use white fill for proper color inheritance
- **Size issues**: SVGs are automatically scaled, but start with 20x20px

Your custom SVG particles will automatically inherit colors from the current palette and respond to audio with rotation and movement effects! 