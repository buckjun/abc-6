import { Scene } from '../Game';
import type { Game } from '../Game';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';
import { AreaEffect } from '../entities/AreaEffect';
import { WeaponManager } from '../managers/WeaponManager';
import { GameUtils } from '../utils/GameUtils';

export class GameScene implements Scene {
  private game: Game;
  private player: Player;
  private enemies: Enemy[] = [];
  private bullets: Bullet[] = [];
  private areaEffects: AreaEffect[] = [];
  private weaponManager: WeaponManager;
  private gameTime: number = 0;
  private spawnTimer: number = 0;
  private spawnInterval: number = 2.0; // seconds
  private playerLevel: number = 1;
  private experience: number = 0;
  private experienceToNext: number = 100;

  constructor(game: Game) {
    this.game = game;
    this.player = new Player(640, 360); // Center of screen
    this.weaponManager = new WeaponManager();
  }

  init(): void {
    console.log('GameScene initialized');
    
    // Initialize player
    this.player.init();
    
    // Reset game state
    this.gameTime = 0;
    this.spawnTimer = 0;
    this.enemies = [];
    this.bullets = [];
    this.areaEffects = [];
    this.playerLevel = 1;
    this.experience = 0;
    this.experienceToNext = 100;
    
    // Setup initial weapons
    this.weaponManager.addWeapon('마력 구체');
    this.weaponManager.addWeapon('수리검');
    this.weaponManager.addWeapon('신성한 영역');
    
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
      health: this.player.getHealth(),
      level: this.playerLevel,
      experience: this.experience,
      experienceToNext: this.experienceToNext
    });

    // Handle player movement
    this.handlePlayerMovement(deltaTime);

    // Update player
    this.player.update(deltaTime);

    // Spawn enemies
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnEnemy();
      this.spawnTimer = 0;
    }

    // Update enemies
    this.enemies.forEach(enemy => {
      enemy.update(deltaTime, this.player);
    });

    // Update bullets
    this.bullets.forEach(bullet => {
      bullet.update(deltaTime);
    });

    // Update area effects
    this.areaEffects.forEach(effect => {
      effect.update(deltaTime);
      const damagedEnemies = effect.applyDamage(this.enemies);
      // Award experience for area effect damage
      this.experience += damagedEnemies.length * 5;
    });

    // Update weapons and get new projectiles
    const mousePos = this.game.getInputManager().getMousePosition();
    const { bullets: newBullets, areaEffects: newAreaEffects } = this.weaponManager.update(
      deltaTime, 
      this.player, 
      this.enemies, 
      mousePos.x, 
      mousePos.y
    );
    
    // Add new projectiles to arrays
    this.bullets.push(...newBullets);
    this.areaEffects.push(...newAreaEffects);

    // Check bullet-enemy collisions
    this.checkBulletEnemyCollisions();

    // Check player-enemy collisions
    this.checkPlayerEnemyCollisions();

    // Check level up
    this.checkLevelUp();

    // Remove dead objects
    this.removeDeadObjects();

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

  private handlePlayerMovement(deltaTime: number): void {
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

  private checkLevelUp(): void {
    if (this.experience >= this.experienceToNext) {
      this.playerLevel++;
      this.experience -= this.experienceToNext;
      this.experienceToNext = Math.floor(this.experienceToNext * 1.2); // Increase requirement
      
      console.log(`Level up! Now level ${this.playerLevel}`);
      this.showLevelUpOptions();
    }
  }

  private showLevelUpOptions(): void {
    const options = this.weaponManager.getUpgradeOptions();
    if (options.length > 0) {
      // For now, auto-select the first option
      // TODO: Show UI for player to choose
      const selectedOption = options[0];
      
      if (['마력 구체', '수리검', '신성한 영역'].includes(selectedOption)) {
        this.weaponManager.addWeapon(selectedOption);
      } else {
        this.weaponManager.addPassiveItem(selectedOption);
      }
      
      console.log(`Auto-selected upgrade: ${selectedOption}`);
    }
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

  private checkBulletEnemyCollisions(): void {
    this.bullets.forEach(bullet => {
      if (!bullet.isAlive()) return;
      
      const bulletBounds = bullet.getBounds();
      
      this.enemies.forEach(enemy => {
        if (!enemy.isAlive()) return;
        
        const enemyBounds = enemy.getBounds();
        
        if (GameUtils.isColliding(bulletBounds, enemyBounds)) {
          // Damage enemy
          enemy.takeDamage(bullet.getDamage());
          this.experience += 10; // Award experience for hit
          
          // Destroy bullet unless it's penetrating
          if (!bullet.isPenetrating()) {
            bullet.destroy();
          }
          
          this.game.getAudioManager().playSound('/sounds/hit.mp3');
          console.log(`Enemy hit by bullet for ${bullet.getDamage()} damage`);
          
          // Check for chain lightning if evolved Magic Bolt
          if (bullet.getColor() === '#4A90E2') {
            this.checkChainLightning(enemy, bullet.getDamage());
          }
        }
      });
    });
  }

  private checkPlayerEnemyCollisions(): void {
    const playerBounds = this.player.getBounds();

    this.enemies.forEach(enemy => {
      if (!enemy.isAlive()) return;
      
      const enemyBounds = enemy.getBounds();
      
      if (GameUtils.isColliding(playerBounds, enemyBounds)) {
        // Player takes damage
        this.player.takeDamage(10);
        enemy.destroy();
        this.game.getAudioManager().playSound('/sounds/hit.mp3');
      }
    });
  }

  private checkChainLightning(hitEnemy: Enemy, damage: number): void {
    // Find nearby enemies for chain lightning
    const hitPos = hitEnemy.getPosition();
    const chainTargets: Enemy[] = [];
    
    this.enemies.forEach(enemy => {
      if (enemy === hitEnemy || !enemy.isAlive()) return;
      
      const enemyPos = enemy.getPosition();
      const distance = GameUtils.distance(hitPos.x, hitPos.y, enemyPos.x, enemyPos.y);
      
      if (distance <= 150 && chainTargets.length < 3) { // Chain to max 3 enemies within 150px
        chainTargets.push(enemy);
      }
    });
    
    // Apply chain damage
    chainTargets.forEach(enemy => {
      enemy.takeDamage(Math.floor(damage * 0.7)); // 70% of original damage
      this.experience += 5;
      console.log('Chain lightning hit enemy!');
    });
  }

  private removeDeadObjects(): void {
    this.enemies = this.enemies.filter(enemy => enemy.isAlive());
    this.bullets = this.bullets.filter(bullet => bullet.isAlive());
    this.areaEffects = this.areaEffects.filter(effect => effect.isActive());
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

    // Render area effects (behind everything)
    this.areaEffects.forEach(effect => {
      effect.render(ctx);
    });

    // Render player
    this.player.render(ctx);

    // Render enemies
    this.enemies.forEach(enemy => {
      enemy.render(ctx);
    });

    // Render bullets
    this.bullets.forEach(bullet => {
      bullet.render(ctx);
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
