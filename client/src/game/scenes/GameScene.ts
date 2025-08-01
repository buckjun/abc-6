import { Scene } from '../Game';
import type { Game } from '../Game';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { GameUtils } from '../utils/GameUtils';

export class GameScene implements Scene {
  private game: Game;
  private player: Player;
  private enemies: Enemy[] = [];
  private gameTime: number = 0;
  private spawnTimer: number = 0;
  private spawnInterval: number = 2.0; // seconds

  constructor(game: Game) {
    this.game = game;
    this.player = new Player(640, 360); // Center of screen
  }

  init(): void {
    console.log('GameScene initialized');
    
    // Initialize player
    this.player.init();
    
    // Reset game state
    this.gameTime = 0;
    this.spawnTimer = 0;
    this.enemies = [];
    
    // Initialize UI scene
    const uiScene = this.game.getScene('ui');
    if (uiScene) {
      uiScene.init();
    }
    
    // Set initial game data
    this.game.setGameData({
      health: 100,
      level: 1,
      time: 0,
      player: this.player
    });

    // Input handlers for game controls
    this.setupInputHandlers();
    
    // Start background music
    this.game.getAudioManager().playBackgroundMusic('/sounds/background.mp3');
  }

  private setupInputHandlers(): void {
    const inputManager = this.game.getInputManager();
    
    // Movement keys - these will be checked in update loop
    inputManager.onKeyPress('Escape', () => {
      this.game.switchScene('mainmenu');
    });
  }

  update(deltaTime: number): void {
    this.gameTime += deltaTime;
    this.spawnTimer += deltaTime;

    // Update game data
    this.game.setGameData({
      time: Math.floor(this.gameTime),
      health: this.player.getHealth()
    });

    // Handle player input and update
    this.handlePlayerInput();
    this.player.update(deltaTime);

    // Spawn enemies
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnEnemy();
      this.spawnTimer = 0;
      
      // Increase difficulty over time
      if (this.spawnInterval > 0.5) {
        this.spawnInterval *= 0.99;
      }
    }

    // Update enemies
    this.enemies.forEach(enemy => {
      enemy.update(deltaTime, this.player);
    });

    // Check collisions
    this.checkCollisions();

    // Remove dead enemies
    this.enemies = this.enemies.filter(enemy => enemy.isAlive());

    // Update UI scene
    const uiScene = this.game.getScene('ui');
    if (uiScene) {
      uiScene.update(deltaTime);
    }

    // Check game over
    if (this.player.getHealth() <= 0) {
      this.gameOver();
    }
  }

  private handlePlayerInput(): void {
    const inputManager = this.game.getInputManager();
    let moveX = 0;
    let moveY = 0;

    if (inputManager.isKeyDown('KeyW') || inputManager.isKeyDown('ArrowUp')) {
      moveY = -1;
    }
    if (inputManager.isKeyDown('KeyS') || inputManager.isKeyDown('ArrowDown')) {
      moveY = 1;
    }
    if (inputManager.isKeyDown('KeyA') || inputManager.isKeyDown('ArrowLeft')) {
      moveX = -1;
    }
    if (inputManager.isKeyDown('KeyD') || inputManager.isKeyDown('ArrowRight')) {
      moveX = 1;
    }

    // Normalize diagonal movement
    if (moveX !== 0 && moveY !== 0) {
      moveX *= 0.707; // 1/sqrt(2)
      moveY *= 0.707;
    }

    this.player.setMovement(moveX, moveY);
  }

  private spawnEnemy(): void {
    const canvas = this.game.getCanvas();
    const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    let x, y;

    switch (side) {
      case 0: // top
        x = Math.random() * canvas.width;
        y = -50;
        break;
      case 1: // right
        x = canvas.width + 50;
        y = Math.random() * canvas.height;
        break;
      case 2: // bottom
        x = Math.random() * canvas.width;
        y = canvas.height + 50;
        break;
      default: // left
        x = -50;
        y = Math.random() * canvas.height;
        break;
    }

    const enemy = new Enemy(x, y);
    enemy.init();
    this.enemies.push(enemy);
  }

  private checkCollisions(): void {
    const playerBounds = this.player.getBounds();

    this.enemies.forEach(enemy => {
      const enemyBounds = enemy.getBounds();
      
      if (GameUtils.isColliding(playerBounds, enemyBounds)) {
        // Player takes damage
        this.player.takeDamage(10);
        enemy.destroy();
        this.game.getAudioManager().playSound('/sounds/hit.mp3');
      }
    });
  }

  private gameOver(): void {
    console.log('Game Over!');
    this.game.getAudioManager().stopBackgroundMusic();
    this.game.switchScene('mainmenu');
  }

  render(ctx: CanvasRenderingContext2D): void {
    const canvas = this.game.getCanvas();
    
    // Background
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid pattern for visual reference
    ctx.strokeStyle = '#2F2F2F';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Render player
    this.player.render(ctx);

    // Render enemies
    this.enemies.forEach(enemy => {
      enemy.render(ctx);
    });

    // Render UI overlay
    const uiScene = this.game.getScene('ui');
    if (uiScene) {
      uiScene.render(ctx);
    }
  }

  destroy(): void {
    this.game.getAudioManager().stopBackgroundMusic();
    const uiScene = this.game.getScene('ui');
    if (uiScene) {
      uiScene.destroy();
    }
    console.log('GameScene destroyed');
  }
}
