let myFont;

function preload() {
  // Load external font file before starting the code execution
  myFont = loadFont('Crashnumberingserif-KVjW.ttf');
}

function setup() {
  // Define 3D sketch by setting the mode as WEBGL
  createCanvas(710, 400, WEBGL);
 // Use degrees (from 0 to 360) instead of radians (from 0 to TWO_PI) for rotation calculations
  angleMode(DEGREES);
  
  // Apply typeface styling
  textFont(myFont);
  textSize(40);
  textAlign(CENTER, CENTER);
}

function draw() {
  background(240, 235, 220); 
  
  // Allows rotating and zooming the canvas with a mouse
  orbitControl();

  // Acquire system date/time value
  let s = second();
  let m = minute();
  let h = hour() % 12; // Convert from 24 hours format to 12-hour format

  // Map time to degrees (e.g., 30 seconds is mapped as 180 degrees)
  let secondAngle = map(s, 0, 60, 0, 360);
  let minuteAngle = map(m, 0, 60, 0, 360);
  let hourAngle = map(h, 0, 12, 0, 360);

  // --- DRAW THE NUMBERS (Clock Face) ---
  fill(40, 45, 50);
  noStroke();
  for (let i = 1; i <= 12; i++) {
    push();
    // Mapping 1-12 to degrees - subtract 90 degrees so "12" starts at the top
    let angle = map(i, 0, 12, 0, 360) - 90;
    let r = 260; // Radius distance from the center
    
    // Placing numbers using polar coordinates (cos for X, sin for Y)
    translate(cos(angle) * r, sin(angle) * r, 0);
    
    // Wave effect in depth (Z-axis) according to time
    translate(0, 0, sin(frameCount + i * 20) * 5); 
    
    text(i, 0, 0);
    pop();
  }
  
  // --- DRAW THE TIME RINGS ---
  // Parameters: rotation, radius, box size, spacing, color, speed
  
  // SECONDS (Outer ring - Teal)
  drawTimeRing(secondAngle, 300, 15, 10, color(0, 120, 130), 1.5);

  // MINUTES (Middle ring - Orange)
  drawTimeRing(minuteAngle, 200, 35, 30, color(200, 85, 40), 1.0);

  // HOURS (Inner ring - Blue)
  drawTimeRing(hourAngle, 120, 51, 60, color(70, 90, 140), 0.5);
}

// Custom function for drawing rotating ring of boxes representing time
function drawTimeRing(rotationAngle, distance, size, step, handColor, speedMult) {
  push();
  // Rotate ring so the "active" box coincides with the current time
  rotateZ(rotationAngle - 90); 
  
  // For loop for creating ring layout
  for (let angle = 0; angle < 360; angle += step) {
    push();
    rotateZ(angle);
    
    // Determining oscillation for breathing effect
    let zOff = sin(frameCount * speedMult + angle) * 30;
    let pulse = 1 + sin(frameCount * speedMult + angle) * 0.2;
    
    // Placing the box itself on the circle
    translate(distance, 0, zOff);
    
    // Add continuous rotation to each individual box
    rotateX(frameCount * speedMult * 0.5);
    rotateY(angle);

    // If box on 0-degree mark of the ring (current time)
    if (angle === 0) {
      fill(handColor);           // Solid filling for hand
      stroke(40, 45, 50);  
      strokeWeight(2);
      box(size * 1 * pulse);     // Drawing an active box
    } else {
      noFill();                  // Wireframe style for the rest of the ring
      stroke(handColor);
      strokeWeight(2);
      box(size * pulse);         // Drawing background boxes
    }
    pop();
  }
  pop();
}