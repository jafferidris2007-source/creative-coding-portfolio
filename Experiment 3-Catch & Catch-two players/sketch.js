// Declarations for players, environment, and other variables
let p1, p2;
let platforms = [];
let gameTimer = 45;
let lastTime;
let gameOver = false;
let winner = "";
let tagCooldown = 0; // Prevent double tag
let gameState = "START"; 
let zoom = 1; // Used for dynamic camera

function setup() {
  createCanvas(windowWidth, windowHeight); 
  resetGame();
}

// Reset all variables and positions
function resetGame() {
  // Decide randomly who starts as the Tagger
  let p1StartsAsTagger = random() > 0.5;

  p1 = new Player(100, 600, color(255, 50, 50), {up: 87, left: 65, right: 68}, p1StartsAsTagger);
  p2 = new Player(1400, 600, color(0, 100, 255), {up: 38, left: 37, right: 39}, !p1StartsAsTagger);
  
  // Define the platforms' positions and sizes
  platforms = [];
  platforms.push(new Platform(-500, 800, 2500, 4000)); // Ground floor
  platforms.push(new Platform(0, 600, 300, 20));
  platforms.push(new Platform(1200, 600, 300, 20));
  platforms.push(new Platform(500, 650, 500, 20));
  platforms.push(new Platform(200, 400, 250, 20));
  platforms.push(new Platform(1050, 400, 250, 20));
  platforms.push(new Platform(600, 300, 300, 20));
  platforms.push(new Platform(0, 210, 250, 20));
  platforms.push(new Platform(1300, 210, 250, 20));
  platforms.push(new Platform(500, 50, 500, 20));

  gameTimer = 45;
  lastTime = millis();
  gameOver = false;
  tagCooldown = 0;
}

function draw() {
  background(135, 206, 235); // Sky blue background

  // Screen routing based on current game state
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

// Move characters and handle dynamic camera
function updateGame() {
  updateTimer();
  
  // Midpoint between players for camera positioning
  let midX = (p1.x + p2.x) / 2;
  let midY = (p1.y + p2.y) / 2;
  
  // Zoom based on distance: zoom out when far, zoom in when near
  let distPad = 150; 
  let dx = abs(p1.x - p2.x) + distPad;
  let dy = abs(p1.y - p2.y) + distPad;
  let zoomX = width / dx;
  let zoomY = height / dy;
  zoom = lerp(zoom, min(zoomX, zoomY, 1.0), 0.1); 
  
  // Camera transformations
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
  fill(0, 150); // Dark overlay
  rectMode(CORNER);
  rect(0, 0, width, height);

  textAlign(CENTER);
  fill(255);
  textSize(50);
  text("SUPER TAG", width / 2, height / 2 - 150);

  // Render characters on start screen
  let p1MenuX = width / 2 - 150;
  let p2MenuX = width / 2 + 150;
  let menuY = height / 2;

  let oldP1 = {x: p1.x, y: p1.y};
  let oldP2 = {x: p2.x, y: p2.y};
  p1.x = p1MenuX; p1.y = menuY;
  p2.x = p2MenuX; p2.y = menuY;

  p1.show();
  p2.show();

  // Fix positions to not disrupt the logic
  p1.x = oldP1.x; p1.y = oldP1.y;
  p2.x = oldP2.x; p2.y = oldP2.y;

  fill(255);
  textSize(20);
  text("PLAYER ONE", p1MenuX, menuY + 60);
  text("PLAYER TWO", p2MenuX, menuY + 60);

  // Button play functionality and styles
  let btnW = 200;
  let btnH = 60;
  let btnX = width / 2 - btnW / 2;
  let btnY = height / 2 + 120;

  if (mouseX > btnX && mouseX < btnX + btnW && mouseY > btnY && mouseY < btnY + btnH) {
    fill(100, 255, 100); // Green hover for button
    cursor(HAND);
  } else {
    fill(0, 180, 0); // Green default for button
    cursor(ARROW);
  }

  rectMode(CORNER);
  rect(btnX, btnY, btnW, btnH, 10);
  fill(255);
  textSize(30);
  text("PLAY", width / 2, btnY + 42);
}

function mousePressed() {
  // Starts game when play button is clicked
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
    // Jump function for P1 and P2
    if (p1 && keyCode === p1.controls.up && p1.onGround) {
      p1.vy = p1.jumpForce;
      p1.onGround = false;
    }
    if (p2 && keyCode === p2.controls.up && p2.onGround) {
      p2.vy = p2.jumpForce;
      p2.onGround = false;
    }
    // Restart logic
    if (gameOver && (key === 'r' || key === 'R')) {
      resetGame();
    }
  }
}

function updateTimer() {
  // Timer decreases by one each second
  if (millis() - lastTime >= 1000) {
    gameTimer--;
    lastTime = millis();
  }
  // Game ends if timer expires, Tagger lost the game
  if (gameTimer <= 0) {
    gameOver = true;
    winner = p1.isTagger ? "PLAYER 2" : "PLAYER 1";
  }
}

function drawUI() {
  // Render Heads Up Display
  fill(0, 100);
  noStroke();
  rectMode(CORNER);
  rect(20, 20, 200, 80, 10);
  fill(255);
  textAlign(LEFT);
  textSize(24);
  text("TIME: " + gameTimer, 40, 55);
  textSize(12);
  text("P1: WASD | P2: ARROWS", 40, 85);
  
  // If recently tagged, display cooldown bar
  if (tagCooldown > 0) {
    fill(255);
    rect(20, 110, map(tagCooldown, 0, 60, 0, 200), 5);
  }
}

function checkTag() {
  let d = dist(p1.x, p1.y, p2.x, p2.y);
  if (tagCooldown > 0) tagCooldown--;

  // Detect collision between characters
  if (d < 35 && tagCooldown === 0) {
    p1.isTagger = !p1.isTagger;
    p2.isTagger = !p2.isTagger;
    tagCooldown = 60; // 60 frame buffer 
  }
}

class Player {
  constructor(x, y, col, controls, tagger) {
    this.x = x; this.y = y;
    this.w = 35; this.h = 35;
    this.col = col;
    this.controls = controls;
    this.isTagger = tagger;
    this.vy = 0; this.vx = 0;
    this.gravity = 0.6;
    this.jumpForce = -16; 
    this.baseSpeed = 7;
    this.onGround = false;
  }

  update() {
    // Tagger moves 15% faster than other character
    let currentSpeed = this.isTagger ? this.baseSpeed * 1.15 : this.baseSpeed;
    
    // Horizontal movement
    if (keyIsDown(this.controls.left)) this.vx = -currentSpeed;
    else if (keyIsDown(this.controls.right)) this.vx = currentSpeed;
    else this.vx = 0;

    // Vertical physics
    this.vy += this.gravity;
    this.x += this.vx;
    this.x = constrain(this.x, -450, 1950); // Bound players to arena
  // Separately check if there is a collision for x or y axis, to avoid sticking
    this.resolveCollisions(true);
    this.y += this.vy;
    this.onGround = false;
    this.resolveCollisions(false);
  }

  resolveCollisions(isHorizontal) {
    for (let plat of platforms) {
      // Standard AABB (Axis-Aligned Bounding Box) collision detection
      if (this.x + this.w/2 > plat.x && 
          this.x - this.w/2 < plat.x + plat.w &&
          this.y + this.h/2 > plat.y && 
          this.y - this.h/2 < plat.y + plat.h) {
        
        if (isHorizontal) {
          // Horizontal collision detection
          if (this.vx > 0) this.x = plat.x - this.w/2;
          if (this.vx < 0) this.x = plat.x + plat.w + this.w/2;
          this.vx = 0;
        } else {
          // Vertical collision detection
          if (this.vy > 0) { // Falling
            this.y = plat.y - this.h/2;
            this.vy = 0;
            this.onGround = true;
          } else if (this.vy < 0) { // Jumping into ceiling
            this.y = plat.y + plat.h + this.h/2;
            this.vy = 0;
          }
        }
      }
    }
  }

  show() {
    rectMode(CENTER);
    // Indicator for cooldown of tags
    let alpha = (tagCooldown > 0) ? 150 : 255;
    let c = color(red(this.col), green(this.col), blue(this.col), alpha);
    fill(c);
    noStroke();
    rect(this.x, this.y, this.w, this.h, 5);

    // White triangle on the head of the "IT" player
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
    fill(255, 100, 150); // Body of platform with a pinkish hue
    rectMode(CORNER);
    noStroke();
    rect(this.x, this.y, this.w, this.h, 5);
    fill(50, 220, 50); // Grass layer with green color at the top
    rect(this.x, this.y, this.w, 8, 2);
  }
}

function drawGameOver() {
  fill(0, 180); // Semi-transparent dark overlay
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

// Full screen responsiveness of the game
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}