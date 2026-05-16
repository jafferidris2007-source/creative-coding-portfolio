// --- GLOBAL STATE ---
let currentBrush = 1;   // Tracks which brush tool is active
let brushSize = 25;     // Diameter of the brush
let brushTexture;       // Off-screen graphics buffer for the 'Paint' brush
let currentColor;       // Currently selected drawing color
let palette = [];       // Array to store the color options

function setup() {
  // Define full-window canvas dimensions dynamically
  createCanvas(windowWidth, windowHeight);
  background(255);
  currentColor = color(0); // Initialize with black
  
  // Define available colors for the palette
  palette = [
    color(0), color(255, 50, 50), color(50, 200, 50), 
    color(0, 150, 255), color(255, 200, 0), color(255)
  ];

  // Create a custom texture for the "Paint" brush (Brush 3)
  brushTexture = createGraphics(40, 40);
  brushTexture.fill(255); 
  brushTexture.noStroke();
  for(let i = 0; i < 40; i++) {
    brushTexture.ellipse(random(40), random(40), random(1, 5));
  }
}

function draw() {
  // --- PAINTING LOGIC ---
  // Only paint if mouse is held down and is below the toolbar area (y > 70)
  if (mouseIsPressed && mouseY > 70) {
    if (currentBrush === 1) hardBrush();
    if (currentBrush === 2) airBrush();
    if (currentBrush === 3) texturedBrush();
    if (currentBrush === 4) symmetryBrush();
  }

  // --- UI HEADER ---
  // Rendered after drawing logic so the brush strokes slide neatly underneath the toolbar
  noStroke(); 
  fill(240);
  rect(0, 0, width, 70); // Light gray background for the toolbar spanning the entire screen width
  
  // Render Tool Buttons
  drawBrushButton(15, 10, 1, "Hard");
  drawBrushButton(75, 10, 2, "Soft");
  drawBrushButton(135, 10, 3, "Paint");
  drawBrushButton(195, 10, 4, "Sym"); 

  // Render Control Panels
  drawSizeUI(270, 10);      // Brush size +/- controls
  drawPaletteUI(450, 10);   // Color selection boxes
  
  // Dynamically pin action buttons to the right side of the responsive window
  drawActionButtons(width - 170, 10); 
}

// --- BRUSH ENGINES ---

// 1. Basic solid line using stroke
function hardBrush() {
  push(); 
  stroke(currentColor);
  strokeWeight(brushSize);
  strokeCap(ROUND);
  line(pmouseX, pmouseY, mouseX, mouseY); 
  pop();
}

// 2. Layered circles with decreasing alpha to create a feathered edge
function airBrush() {
  push();
  for (let r = brushSize; r > 0; r -= 4) {
    let alpha = map(r, 0, brushSize, 15, 2); 
    let c = color(red(currentColor), green(currentColor), blue(currentColor), alpha);
    stroke(c);
    strokeWeight(r);
    strokeCap(ROUND);
    line(pmouseX, pmouseY, mouseX, mouseY);
  }
  pop();
}

// 3. Uses the brushTexture buffer as a stamp with a tint
function texturedBrush() {
  push();
  imageMode(CENTER);
  tint(red(currentColor), green(currentColor), blue(currentColor), 100);
  image(brushTexture, mouseX, mouseY, brushSize * 1.5, brushSize * 1.5);
  pop();
}

// 4. Horizontal symmetry: draws at mouseX and at (Width - mouseX) across the full viewport
function symmetryBrush() {
  push();
  stroke(currentColor);
  strokeWeight(brushSize);
  strokeCap(ROUND);
  line(pmouseX, pmouseY, mouseX, mouseY); 
  line(width - pmouseX, pmouseY, width - mouseX, mouseY); // Uses fluid width boundaries
  pop();
}

// --- UI COMPONENTS ---

// Draws the Trash (Clear) and Save buttons
function drawActionButtons(x, y) {
  let overTrash = mouseX > x && mouseX < x + 50 && mouseY > y && mouseY < y + 50;
  
  // Clear Canvas Button
  stroke(150);
  fill(overTrash && mouseIsPressed ? 200 : 255);
  rect(x, y, 50, 50, 5);
  
  push();
  translate(x + 25, y + 25);
  stroke(0); noFill();
  rect(-8, -5, 16, 15); 
  line(-10, -5, 10, -5); 
  line(-3, -8, 3, -8);   
  pop();
  
  if (overTrash && mouseIsPressed) {
    // Redraw white canvas below the toolbar bounds
    push();
    fill(255); noStroke();
    rect(0, 70, width, height - 70);
    pop();
  }

  // Save Image Button
  let saveX = x + 60;
  let overSave = mouseX > saveX && mouseX < saveX + 50 && mouseY > y && mouseY < y + 50;
  
  stroke(150);
  fill(overSave && mouseIsPressed ? 200 : 255);
  rect(saveX, y, 50, 50, 5);
  
  push();
  translate(saveX + 25, y + 25);
  stroke(0); noFill();
  beginShape();
  vertex(-8, 10); vertex(8, 10); vertex(8, -5); vertex(3, -10); vertex(-8, -10); 
  endShape(CLOSE);
  line(3, -10, 3, -5); line(3, -5, 8, -5); 
  pop();
}

// Handle image downloading accurately relative to responsive position
function mouseReleased() {
  let saveX = (width - 170) + 60;
  if (mouseX > saveX && mouseX < saveX + 50 && mouseY > 10 && mouseY < 60) {
    // Save current frame artwork
    saveCanvas('myPainting', 'png');
  }
}

// Draws the selection buttons for the 4 brush types
function drawBrushButton(x, y, num, label) {
  if (mouseIsPressed && mouseX > x && mouseX < x+50 && mouseY > y && mouseY < y+50) {
    currentBrush = num;
  }
  
  stroke(150);
  fill(currentBrush === num ? 200 : 255); 
  rect(x, y, 50, 50, 5);
  
  push();
  translate(x + 25, y + 22);
  fill(0); noStroke();
  if (num === 1) ellipse(0, 0, 15, 15); 
  if (num === 2) { for(let r=18; r>0; r-=2) { fill(0, 15); ellipse(0, 0, r); } } 
  if (num === 3) { rotate(PI/4); fill(0); rect(-2, -5, 4, 15); fill(200); rect(-3, -8, 6, 4); } 
  if (num === 4) { stroke(0); strokeWeight(2); ellipse(-8, 0, 6, 6); ellipse(8, 0, 6, 6); } 
  pop();
  
  fill(0); noStroke(); textAlign(CENTER); textSize(10);
  text(num, x + 25, y + 45); 
}

// Handles the Plus and Minus buttons to change brushSize
function drawSizeUI(x, y) {
  stroke(150);
  fill(255); 
  rect(x, y, 40, 50, 5);      // Minus button
  rect(x + 90, y, 40, 50, 5); // Plus button
  
  if (mouseIsPressed) {
    if (mouseX > x && mouseX < x+40 && mouseY > y && mouseY < y+50) brushSize = max(2, brushSize - 1);
    if (mouseX > x+90 && mouseX < x+130 && mouseY > y && mouseY < y+50) brushSize = min(150, brushSize + 1);
  }
  
  fill(0); noStroke(); textAlign(CENTER);
  textSize(22); text("-", x + 20, y + 32); text("+", x + 110, y + 32);
  textSize(12); text("Size: " + floor(brushSize), x + 65, y + 30);
}

// Draws the color rectangles and updates currentColor on click
function drawPaletteUI(x, y) {
  for (let i = 0; i < palette.length; i++) {
    let px = x + (i * 45);
    if (mouseIsPressed && mouseX > px && mouseX < px+35 && mouseY > y && mouseY < y+50) {
      currentColor = palette[i];
    }
    
    fill(palette[i]); 
    stroke(currentColor === palette[i] ? 0 : 200); 
    strokeWeight(currentColor === palette[i] ? 2 : 1);
    rect(px, y + 5, 35, 40, 5);
  }
}

// Hotkey support for power users
function keyPressed() {
  if (key === '1') currentBrush = 1;
  if (key === '2') currentBrush = 2;
  if (key === '3') currentBrush = 3;
  if (key === '4') currentBrush = 4;
  if (key === 'c' || key === 'C') {
    push();
    fill(255); noStroke();
    rect(0, 70, width, height - 70);
    pop();
  }
  if (key === 's' || key === 'S') saveCanvas('myPainting', 'png');
}

// Window resizing adjustments to stretch drawing area smoothly
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}