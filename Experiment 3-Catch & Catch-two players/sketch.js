// Keeping track of our players, the map layout, and game state variables
let p1, p2;
let platforms = [];
let gameTimer = 45;
let lastTime;
let gameOver = false;
let winner = "";
let tagCooldown = 0; // Stop instant double-tagging right after a hit
let gameState = "START"; 
let zoom = 1; // For that sweet dynamic camera scale effect

function setup() {
  createCanvas(windowWidth, windowHeight); 
  resetGame();
}

// Clean slate for a fresh round
function resetGame() {
  // Flip a coin to see who has to chase first
  let p1StartsAsTagger = random() > 0.5;

  // Setup players with just ONE action key each (A for Player 1, L for Player 2)
  p1 = new Player(100, 650, color(255, 50, 50), 65, p1StartsAsTagger, "PLAYER 1 (A)");
  p2 = new Player(1100, 650, color(0, 100, 255), 76, !p1StartsAsTagger, "PLAYER 2 (L)");
  
  // Building the arena brick by brick (Tuned specifically for 1-key platforming flow)
  platforms = [];
  platforms.push(new Platform(-500, 800, 2500, 4000)); // The safety net/ground floor
  
  // --- BOTTOM LEVEL TRANSITIONS ---
  platforms.push(new Platform(0, 660, 350, 20));       // Low Left
  platforms.push(new Platform(850, 660, 350, 20));     // Low Right
  platforms.push(new Platform(400, 560, 400, 20));     // Center Stepping Stone
  
  // --- MID LEVEL BRIDGES ---
  platforms.push(new Platform(100, 440, 300, 20));     // Mid Left
  platforms.push(new Platform(800, 440, 300, 20));     // Mid Right
  platforms.push(new Platform(350, 320, 500, 20));     // Big Center Runway
  
  // --- HIGH LEVEL APEX ---
  platforms.push(new Platform(150, 190, 250, 20));     // High Left Escape
  platforms.push(new Platform(800, 190, 250, 20));     // High Right Escape
  platforms.push(new Platform(450, 70, 300, 20));      // The High Roof

  gameTimer = 45;
  lastTime = millis();
  gameOver = false;
  tagCooldown = 0;
}

function draw() {
  background(135, 206, 235); // Nice, calm sky blue to contrast the chaos

  // Figure out which screen the players should be looking at
  if (gameState === "START") {
    drawStartScreen();
  } else if (gameState === "PLAY") {
    if (!gameOver) {
      updateGame();
    } else {
      drawGameOver();
    }
  }
}

// Handle all the physics, inputs, and camera positioning mid-match
function updateGame() {
  updateTimer();
  
  // Find the exact middle point between both players to center the screen
  let midX = (p1.x + p2.x) / 2;
  let midY = (p1.y + p2.y) / 2;
  
  // Camera zoom magic: dynamically pull back when they scatter, zoom in when they get close
  let distPad = 150; 
  let dx = abs(p1.x - p2.x) + distPad;
  let dy = abs(p1.y - p2.y) + distPad;
  let zoomX = width / dx;
  let zoomY = height / dy;
  zoom = lerp(zoom, min(zoomX, zoomY, 1.0), 0.1); 
  
  // Shift and scale everything into the camera's perspective
  push();
  translate(width/2, height/2);
  scale(zoom);
  translate(-midX, -midY);

  for (let plat of platforms) plat.show();
  p1.update();
  p2.update();
  p1.show();
  p2.show();
  checkTag();
  pop();
  
  drawUI();
}

function drawStartScreen() {
  fill(0, 150); // Dim the background to make the text pop
  rectMode(CORNER);
  rect(0, 0, width, height);

  textAlign(CENTER);
  fill(255);
  textSize(50);
  text("1-KEY SUPER TAG", width / 2, height / 2 - 150);

  // Set up dummy coordinate targets to draw the menu previews
  let p1MenuX = width / 2 - 200;
  let p2MenuX = width / 2 + 200;
  let menuY = height / 2;

  fill(255);
  textSize(24);
  text("PLAYER ONE", p1MenuX, menuY - 40);
  textSize(16);
  text("Press [ A ] to Jump\nPress in Air to Flip Dir", p1MenuX, menuY + 20);

  text("PLAYER TWO", p2MenuX, menuY - 40);
  text("Press [ L ] to Jump\nPress in Air to Flip Dir", p2MenuX, menuY + 20);

  // Play button hover effects and boundary checks
  let btnW = 200;
  let btnH = 60;
  let btnX = width / 2 - btnW / 2;
  let btnY = height / 2 + 120;

  if (mouseX > btnX && mouseX < btnX + btnW && mouseY > btnY && mouseY < btnY + btnH) {
    fill(100, 255, 100); // Light up green when hovered
    cursor(HAND);
  } else {
    fill(0, 180, 0); // Solid green idle state
    cursor(ARROW);
  }

  rectMode(CORNER);
  rect(btnX, btnY, btnW, btnH, 10);
  fill(255);
  textSize(30);
  text("PLAY", width / 2, btnY + 42);
}

function mousePressed() {
  // Let them click the play button to start the action
  if (gameState === "START") {
    let btnW = 200;
    let btnH = 60;
    let btnX = width / 2 - btnW / 2;
    let btnY = height / 2 + 120;

    if (mouseX > btnX && mouseX < btnX + btnW && mouseY > btnY && mouseY < btnY + btnH) {
      gameState = "PLAY";
      resetGame(); 
      lastTime = millis();
    }
  }
}

function keyPressed() {
  if (gameState === "PLAY") {
    // Listen for the specific player keys and fire off their actions
    if (p1 && keyCode === p1.controlKey) {
      p1.handleSingleKeyPress();
    }
    if (p2 && keyCode === p2.controlKey) {
      p2.handleSingleKeyPress();
    }
    
    // Restart logic: checking specifically for the 'R' key to clear the game over state
    if (gameOver && (key === 'r' || key === 'R')) {
      resetGame();
    }
  }
}

function updateTimer() {
  // Simple 1-second interval clock ticking down
  if (millis() - lastTime >= 1000) {
    gameTimer--;
    lastTime = millis();
  }
  // Time's up! If you're still it, you lose.
  if (gameTimer <= 0) {
    gameOver = true;
    winner = p1.isTagger ? "PLAYER 2" : "PLAYER 1";
  }
}

function drawUI() {
  // Draw the HUD box in the corner
  fill(0, 100);
  noStroke();
  rectMode(CORNER);
  rect(20, 20, 240, 80, 10);
  fill(255);
  textAlign(LEFT);
  textSize(24);
  text("TIME: " + gameTimer, 40, 55);
  textSize(12);
  text("P1: Key [ A ]  |  P2: Key [ L ]", 40, 85);
  
  // Draw a shrinking timer bar while the tag immunity is active
  if (tagCooldown > 0) {
    fill(255);
    rect(20, 110, map(tagCooldown, 0, 60, 0, 240), 5);
  }
}

function checkTag() {
  let d = dist(p1.x, p1.y, p2.x, p2.y);
  if (tagCooldown > 0) tagCooldown--;

  // If they run into each other and the cooldown is clear, swap roles!
  if (d < 35 && tagCooldown === 0) {
    p1.isTagger = !p1.isTagger;
    p2.isTagger = !p2.isTagger;
    tagCooldown = 60; // Give them a 60-frame breathing room window to escape 
  }
}

class Player {
  constructor(x, y, col, controlKey, tagger, name) {
    this.x = x; this.y = y;
    this.w = 35; this.h = 35;
    this.col = col;
    this.controlKey = controlKey;
    this.isTagger = tagger;
    this.name = name;
    this.vy = 0; 
    this.dir = random() > 0.5 ? 1 : -1; // Coin flip for initial running direction (1 = Right, -1 = Left)
    this.gravity = 0.6;
    this.jumpForce = -15; 
    this.baseSpeed = 6;
    this.onGround = false;
  }

  handleSingleKeyPress() {
    if (this.onGround) {
      this.vy = this.jumpForce;
      this.onGround = false;
    } else {
      this.dir *= -1; // The secret sauce: tapping in mid-air instantly flips your direction
    }
  }

  update() {
    // Give the tagger a 15% speed buff so they can actually catch up
    let currentSpeed = this.isTagger ? this.baseSpeed * 1.15 : this.baseSpeed;
    
    // Constant auto-running velocity application
    let vx = this.dir * currentSpeed;

    // Standard gravity math
    this.vy += this.gravity;
    this.x += vx;
    this.x = constrain(this.x, -450, 1950); // Keep them contained inside our world boundaries
    
    // Check X and Y axis collisions independently so the cubes don't awkwardly glue to walls
    this.resolveCollisions(true, vx);
    this.y += this.vy;
    this.onGround = false;
    this.resolveCollisions(false, vx);
  }

  resolveCollisions(isHorizontal, vx) {
    for (let plat of platforms) {
      // Classic box-to-box overlap boundary check
      if (this.x + this.w/2 > plat.x && 
          this.x - this.w/2 < plat.x + plat.w &&
          this.y + this.h/2 > plat.y && 
          this.y - this.h/2 < plat.y + plat.h) {
        
        if (isHorizontal) {
          // Hit a side wall? Instantly bounce back the other way so they don't get stuck running into a wall.
          if (vx > 0) {
            this.x = plat.x - this.w/2;
            this.dir = -1; 
          }
          if (vx < 0) {
            this.x = plat.x + plat.w + this.w/2;
            this.dir = 1;  
          }
        } else {
          // Handle ceiling bumps and floor landings
          if (this.vy > 0) { // Landing soundly on top of a platform
            this.y = plat.y - this.h/2;
            this.vy = 0;
            this.onGround = true;
          } else if (this.vy < 0) { // Bonking head on the bottom of a platform
            this.y = plat.y + plat.h + this.h/2;
            this.vy = 0;
          }
        }
      }
    }
  }

  show() {
    rectMode(CENTER);
    // Fade the color alpha out a bit if they are currently immune to being tagged
    let alpha = (tagCooldown > 0) ? 150 : 255;
    let c = color(red(this.col), green(this.col), blue(this.col), alpha);
    fill(c);
    noStroke();
    rect(this.x, this.y, this.w, this.h, 5);

    // Give them a little white eye indicator so players can see which way they're facing
    fill(255);
    rect(this.x + (this.dir * 10), this.y - 5, 6, 6);

    // Render the "IT" spike crown above the tagger's head
    if (this.isTagger) {
      fill(255, alpha);
      noStroke();
      beginShape();
      vertex(this.x - 15, this.y - 55); 
      vertex(this.x + 15, this.y - 55); 
      vertex(this.x, this.y - 35);      
      endShape(CLOSE);
    }
  }
}

class Platform {
  constructor(x, y, w, h) {
    this.x = x; this.y = y; this.w = w; this.h = h;
  }
  show() {
    fill(255, 100, 150); // Give the platform base a pinkish block look
    rectMode(CORNER);
    noStroke();
    rect(this.x, this.y, this.w, this.h, 5);
    fill(50, 220, 50); // Top it off with a bright green grass trim layer
    rect(this.x, this.y, this.w, 8, 2);
  }
}

function drawGameOver() {
  fill(0, 180); // Darken the scene on game over
  rectMode(CORNER);
  rect(0, 0, width, height);
  textAlign(CENTER);
  fill(255);
  textSize(60);
  text("GAME OVER", width/2, height/2);
  textSize(30);
  text(winner + " WINS!", width/2, height/2 + 60);
  textSize(15);
  text("PRESS 'R' TO RESTART", width/2, height/2 + 100);
}

// Keep the game crisp and fitting correctly if the browser window size changes
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}