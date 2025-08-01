import { Scene } from '../Game';
import type { Game } from '../Game';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';
import { AreaEffect } from '../entities/AreaEffect';
import { WeaponManager } from '../managers/WeaponManager';
import { GameUtils } from '../utils/GameUtils';
import { EnemyBase } from '../entities/enemies/EnemyBase';
import { Slime } from '../entities/enemies/Slime';
import { Bat } from '../entities/enemies/Bat';
import { SkeletonSoldier } from '../entities/enemies/SkeletonSoldier';
import { GoblinShaman } from '../entities/enemies/GoblinShaman';
import { Ogre } from '../entities/enemies/Ogre';
import { Reaper } from '../entities/enemies/Reaper';

export class GameScene implements Scene {
  private game: Game;
  private player: Player;
  private enemies: Enemy[] = [];
  private newEnemies: EnemyBase[] = [];
  private bullets: Bullet[] = [];
  private areaEffects: AreaEffect[] = [];
  private weaponManager: WeaponManager;
  private gameTime: number = 0;
  private spawnTimer: number = 0;
  private baseSpawnInterval: number = 2.0; // seconds
  private eliteSpawnTimer: number = 0;
  private bossSpawnTimer: number = 0;
  private playerLevel: number = 1;
  private experience: number = 0;
  private experienceToNext: number = 100;
  private reaperSpawned: boolean = false;

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
    this.eliteSpawnTimer = 0;
    this.bossSpawnTimer = 0;
    this.enemies = [];
    this.newEnemies = [];
    this.bullets = [];
    this.areaEffects = [];
    this.playerLevel = 1;
    this.experience = 0;
    this.experienceToNext = 100;
    this.reaperSpawned = false;
    
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

    // Spawn enemies based on time
    this.spawnTimer += deltaTime;
    this.eliteSpawnTimer += deltaTime;
    this.bossSpawnTimer += deltaTime;

    const currentSpawnInterval = this.getSpawnInterval();
    if (this.spawnTimer >= currentSpawnInterval) {
      this.spawnEnemiesByTime();
      this.spawnTimer = 0;
    }

    // Spawn elite enemies
    if (this.eliteSpawnTimer >= 30.0 && this.gameTime >= 15 * 60) { // Every 30 seconds after 15 minutes
      this.spawnEliteEnemy();
      this.eliteSpawnTimer = 0;
    }

    // Spawn reaper boss at 30 minutes
    if (this.gameTime >= 30 * 60 && !this.reaperSpawned) {
      this.spawnReaper();
      this.reaperSpawned = true;
    }

    // Update old enemies
    this.enemies.forEach(enemy => {
      enemy.update(deltaTime, this.player);
    });

    // Update new enemies
    const playerPos = this.player.getPosition();
    this.newEnemies.forEach(enemy => {
      if (enemy instanceof SkeletonSoldier) {
        const skeletonGroup = this.newEnemies.filter(e => e instanceof SkeletonSoldier) as SkeletonSoldier[];
        enemy.update(deltaTime, playerPos.x, playerPos.y, skeletonGroup);
      } else {
        enemy.update(deltaTime, playerPos.x, playerPos.y);
      }
    });

    // Collect projectiles from Goblin Shamans
    this.newEnemies.forEach(enemy => {
      if (enemy instanceof GoblinShaman) {
        const shamanProjectiles = enemy.getProjectiles();
        shamanProjectiles.forEach(projectile => {
          if (!this.bullets.includes(projectile)) {
            this.bullets.push(projectile);
          }
        });
      }
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

  private getSpawnInterval(): number {
    // Decrease spawn interval over time for increasing difficulty
    const timeMinutes = this.gameTime / 60;
    let interval = this.baseSpawnInterval;
    
    if (timeMinutes >= 20) {
      interval = 0.3; // Very fast spawning after 20 minutes
    } else if (timeMinutes >= 15) {
      interval = 0.5; // Fast spawning after 15 minutes
    } else if (timeMinutes >= 10) {
      interval = 0.8; // Medium-fast spawning after 10 minutes
    } else if (timeMinutes >= 5) {
      interval = 1.2; // Medium spawning after 5 minutes
    }
    
    return interval;
  }

  private spawnEnemiesByTime(): void {
    const timeMinutes = this.gameTime / 60;
    const canvas = this.game.getCanvas();
    
    // Determine spawn count based on time
    let spawnCount = 1;
    if (timeMinutes >= 10) spawnCount = 3;
    else if (timeMinutes >= 5) spawnCount = 2;
    
    for (let i = 0; i < spawnCount; i++) {
      const spawnPos = this.getRandomSpawnPosition(canvas);
      
      if (timeMinutes < 5) {
        // Early game: Slimes and Bats
        if (Math.random() < 0.7) {
          this.spawnSlime(spawnPos.x, spawnPos.y);
        } else {
          this.spawnBat(spawnPos.x, spawnPos.y);
        }
      } else if (timeMinutes < 15) {
        // Mid game: Add Skeleton Soldiers and Goblin Shamans
        const rand = Math.random();
        if (rand < 0.3) {
          this.spawnSlime(spawnPos.x, spawnPos.y);
        } else if (rand < 0.5) {
          this.spawnBat(spawnPos.x, spawnPos.y);
        } else if (rand < 0.8) {
          this.spawnSkeletonSoldier(spawnPos.x, spawnPos.y);
        } else {
          this.spawnGoblinShaman(spawnPos.x, spawnPos.y);
        }
      } else {
        // Late game: All enemy types
        const rand = Math.random();
        if (rand < 0.2) {
          this.spawnSlime(spawnPos.x, spawnPos.y);
        } else if (rand < 0.35) {
          this.spawnBat(spawnPos.x, spawnPos.y);
        } else if (rand < 0.6) {
          this.spawnSkeletonSoldier(spawnPos.x, spawnPos.y);
        } else {
          this.spawnGoblinShaman(spawnPos.x, spawnPos.y);
        }
      }
    }
  }

  private getRandomSpawnPosition(canvas: HTMLCanvasElement): { x: number; y: number } {
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

    return { x, y };
  }

  private spawnSlime(x: number, y: number): void {
    const slime = new Slime(x, y);
    slime.init();
    this.newEnemies.push(slime);
  }

  private spawnBat(x: number, y: number): void {
    const bat = new Bat(x, y);
    bat.init();
    this.newEnemies.push(bat);
  }

  private spawnSkeletonSoldier(x: number, y: number): void {
    const skeleton = new SkeletonSoldier(x, y, this.newEnemies.filter(e => e instanceof SkeletonSoldier).length);
    skeleton.init();
    this.newEnemies.push(skeleton);
  }

  private spawnGoblinShaman(x: number, y: number): void {
    const shaman = new GoblinShaman(x, y);
    shaman.init();
    this.newEnemies.push(shaman);
  }

  private spawnEliteEnemy(): void {
    const canvas = this.game.getCanvas();
    const spawnPos = this.getRandomSpawnPosition(canvas);
    
    const ogre = new Ogre(spawnPos.x, spawnPos.y);
    ogre.init();
    this.newEnemies.push(ogre);
    
    console.log('Elite Ogre spawned!');
  }

  private spawnReaper(): void {
    const canvas = this.game.getCanvas();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const reaper = new Reaper(centerX, centerY - 100, this.playerLevel, canvas.width, canvas.height);
    reaper.init();
    this.newEnemies.push(reaper);
    
    console.log('THE REAPER HAS AWAKENED!');
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
      
      // Check collisions with old enemies
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

      // Check collisions with new enemies
      this.newEnemies.forEach(enemy => {
        if (!enemy.isAlive()) return;
        
        const enemyBounds = enemy.getBounds();
        
        if (GameUtils.isColliding(bulletBounds, enemyBounds)) {
          // Damage enemy
          enemy.takeDamage(bullet.getDamage());
          this.experience += enemy.getExperienceValue() / 2; // Award experience for hit
          
          // Destroy bullet unless it's penetrating
          if (!bullet.isPenetrating()) {
            bullet.destroy();
          }
          
          this.game.getAudioManager().playSound('/sounds/hit.mp3');
          console.log(`${enemy.constructor.name} hit by bullet for ${bullet.getDamage()} damage`);
          
          // Check for treasure drop from Ogre
          if (enemy instanceof Ogre && !enemy.isAlive()) {
            if (enemy.shouldDropTreasure()) {
              console.log('Ogre dropped treasure!');
              this.experience += 50; // Bonus experience
            }
          }
        }
      });
    });
  }

  private checkPlayerEnemyCollisions(): void {
    const playerBounds = this.player.getBounds();

    // Check collisions with old enemies
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

    // Check collisions with new enemies
    this.newEnemies.forEach(enemy => {
      if (!enemy.isAlive()) return;
      
      const enemyBounds = enemy.getBounds();
      
      if (GameUtils.isColliding(playerBounds, enemyBounds)) {
        // Player takes damage based on enemy type
        this.player.takeDamage(enemy.getDamage());
        
        // Don't destroy bosses and elites on contact
        if (!(enemy instanceof Ogre) && !(enemy instanceof Reaper)) {
          enemy.destroy();
        }
        
        this.game.getAudioManager().playSound('/sounds/hit.mp3');
      }
    });

    // Special check for Reaper scythe attack
    this.newEnemies.forEach(enemy => {
      if (enemy instanceof Reaper && enemy.isPerformingScytheAttack()) {
        const scytheArea = enemy.getScytheAttackArea();
        if (scytheArea && GameUtils.isColliding(playerBounds, scytheArea)) {
          this.player.takeDamage(enemy.getDamage());
          console.log('Player hit by Reaper scythe attack!');
        }
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
    this.newEnemies = this.newEnemies.filter(enemy => enemy.isAlive());
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

    // Render old enemies
    this.enemies.forEach(enemy => {
      enemy.render(ctx);
    });

    // Render new enemies
    this.newEnemies.forEach(enemy => {
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
