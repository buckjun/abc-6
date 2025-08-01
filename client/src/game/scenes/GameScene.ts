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
import { ExperienceGem } from '../entities/ExperienceGem';
import { TreasureChest } from '../entities/TreasureChest';
import { LevelUpOption } from '../ui/LevelUpUI';
import { WaveManager } from '../managers/WaveManager';
import { ExperienceBar } from '../ui/ExperienceBar';

export class GameScene implements Scene {
  private game: Game;
  private player: Player;
  private enemies: Enemy[] = [];
  private newEnemies: EnemyBase[] = [];
  private bullets: Bullet[] = [];
  private areaEffects: AreaEffect[] = [];
  private experienceGems: ExperienceGem[] = [];
  private treasureChests: TreasureChest[] = [];
  private weaponManager: WeaponManager;
  private waveManager: WaveManager;
  private experienceBar: ExperienceBar;
  private gameTime: number = 0;
  private spawnTimer: number = 0;
  private baseSpawnInterval: number = 2.0; // seconds
  private eliteSpawnTimer: number = 0;
  private bossSpawnTimer: number = 0;
  private playerLevel: number = 1;
  private experience: number = 0;
  private experienceToNext: number = 100;
  private reaperSpawned: boolean = false;
  private gamePaused: boolean = false;
  private hasExperienceMagnet: boolean = false;
  
  // Level up UI
  private showLevelUpMenu: boolean = false;
  private levelUpOptions: LevelUpOption[] = [];
  private selectedOptionIndex: number = 0;
  
  // Score system
  private score: number = 0;
  private enemiesKilled: number = 0;
  private gameOver: boolean = false;
  private showGameOverMenu: boolean = false;

  constructor(game: Game) {
    this.game = game;
    this.player = new Player(640, 360); // Center of screen
    this.weaponManager = new WeaponManager();
    this.waveManager = new WaveManager();
    this.experienceBar = new ExperienceBar();
    
    // Set up mouse click handler for level up menu
    this.game.getInputManager().onCanvasClick((x, y) => {
      if (this.showLevelUpMenu) {
        this.handleLevelUpMenuClick(x, y);
      }
    });
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
    this.experienceGems = [];
    this.treasureChests = [];
    this.playerLevel = 1;
    this.experience = 0;
    this.experienceToNext = 100;
    this.reaperSpawned = false;
    this.gamePaused = false;
    this.hasExperienceMagnet = false;
    this.score = 0;
    this.enemiesKilled = 0;
    this.gameOver = false;
    this.showGameOverMenu = false;
    this.waveManager.reset();
    
    // Clear all weapons and add only Magic Orb
    this.weaponManager = new WeaponManager();
    this.weaponManager.addWeapon('마력 구체');
    
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

    // Level up UI input handlers - removed LevelUpUI dependency
  }

  update(deltaTime: number): void {
    // Handle game over menu
    if (this.showGameOverMenu) {
      // Check for restart input - check both key codes and key names
      if (this.game.getInputManager().isKeyPressed('r') || this.game.getInputManager().isKeyPressed('R') || 
          this.game.getInputManager().isKeyDown('KeyR')) {
        this.restart();
        return;
      } else if (this.game.getInputManager().isKeyPressed('Escape') || 
                 this.game.getInputManager().isKeyDown('Escape')) {
        this.game.switchScene('mainmenu');
        return;
      }
      
      // Handle mouse clicks on game over menu
      if (this.game.getInputManager().isMousePressed()) {
        this.handleGameOverMenuClick();
      }
      
      return;
    }

    // Handle level up menu interactions
    if (this.showLevelUpMenu) {
      // Check for number key inputs
      if (this.game.getInputManager().isKeyPressed('1') && this.levelUpOptions.length >= 1) {
        this.selectLevelUpOption(0);
      } else if (this.game.getInputManager().isKeyPressed('2') && this.levelUpOptions.length >= 2) {
        this.selectLevelUpOption(1);
      } else if (this.game.getInputManager().isKeyPressed('3') && this.levelUpOptions.length >= 3) {
        this.selectLevelUpOption(2);
      } else if (this.game.getInputManager().isKeyPressed('4') && this.levelUpOptions.length >= 4) {
        this.selectLevelUpOption(3);
      }
      return; // Game is paused during level up
    }

    if (this.gamePaused || this.gameOver) return;

    this.gameTime += deltaTime;
    this.waveManager.update(deltaTime);

    // Update game data
    this.game.setGameData({
      time: Math.floor(this.gameTime),
      health: this.player.getHealth(),
      level: this.playerLevel,
      experience: this.experience,
      experienceToNext: this.experienceToNext
    });

    // Update experience bar
    this.experienceBar.update(this.experience, this.experienceToNext, this.playerLevel);

    // Handle player movement
    this.handlePlayerMovement(deltaTime);

    // Update player
    this.player.update(deltaTime);

    // Time-based enemy spawning with increasing difficulty
    this.spawnTimer += deltaTime;
    const currentSpawnInterval = this.getSpawnInterval();
    if (this.spawnTimer >= currentSpawnInterval) {
      this.spawnEnemiesByTime();
      this.spawnTimer = 0;
    }

    // Check for boss spawns
    const bossSpawn = this.waveManager.shouldSpawnBoss();
    if (bossSpawn.shouldSpawn) {
      this.spawnBoss(bossSpawn.bossType);
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

    // Update experience gems
    this.experienceGems.forEach(gem => {
      gem.update(deltaTime, playerPos.x, playerPos.y, this.hasExperienceMagnet);
    });

    // Update treasure chests  
    this.treasureChests.forEach(chest => {
      chest.update(deltaTime);
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
    // Combine old enemies and new enemies for weapon targeting
    const allEnemies = [...this.enemies, ...this.newEnemies];
    const { bullets: newBullets, areaEffects: newAreaEffects } = this.weaponManager.update(
      deltaTime, 
      this.player, 
      allEnemies, 
      mousePos.x, 
      mousePos.y
    );
    
    // Add new projectiles to arrays
    this.bullets.push(...newBullets);
    this.areaEffects.push(...newAreaEffects);

    // Check collisions
    this.checkBulletEnemyCollisions();
    this.checkPlayerEnemyCollisions();
    this.checkAreaEffectCollisions();
    this.checkExperienceGemCollisions();
    this.checkTreasureChestCollisions();

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
    if (this.player.getHealth() <= 0 && !this.gameOver) {
      this.handleGameOver();
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
      this.experienceToNext = Math.floor(100 * Math.pow(this.playerLevel, 1.5)); // Level formula: 100 * level^1.5
      
      console.log(`Level up! Now level ${this.playerLevel}`);
      this.game.getAudioManager().playSound('/sounds/success.mp3');
      
      // Show level up UI
      this.showLevelUpOptions();
    }
  }

  private showLevelUpOptions(): void {
    this.levelUpOptions = this.generateLevelUpOptions();
    this.showLevelUpMenu = true;
    this.selectedOptionIndex = 0;
  }

  private generateLevelUpOptions(): LevelUpOption[] {
    const options: LevelUpOption[] = [];
    
    // Available weapons
    const allWeapons = ['마력 구체', '수리검', '신성한 영역', '화염탄', '얼음 화살'];
    const currentWeapons = this.weaponManager.getWeaponNames();
    
    // Available passive items
    const allPassives = ['체력 증가', '이동속도', '공격력', '경험치 획득', '쿨타임 감소', '관통력'];
    
    // TEST MODE: For first level up, always provide new weapons
    if (this.playerLevel === 2) {
      // Force new weapons for testing
      const availableNewWeapons = allWeapons.filter(weapon => !currentWeapons.includes(weapon));
      availableNewWeapons.forEach(weapon => {
        options.push({
          id: `new_${weapon}`,
          name: weapon,
          description: `새로운 무기를 획득합니다`,
          type: 'weapon'
        });
      });
      
      // Return only new weapon options for testing
      return options.slice(0, 4);
    }
    
    // Normal level up options for higher levels
    // Add weapon upgrades
    currentWeapons.forEach(weapon => {
      if (this.weaponManager.getWeaponLevel(weapon) < 8) {
        options.push({
          id: `upgrade_${weapon}`,
          name: `${weapon} 강화`,
          description: `${weapon}의 위력을 증가시킵니다 (Lv${this.weaponManager.getWeaponLevel(weapon)} → ${this.weaponManager.getWeaponLevel(weapon) + 1})`,
          type: 'upgrade'
        });
      }
    });
    
    // Add new weapons
    const availableNewWeapons = allWeapons.filter(weapon => !currentWeapons.includes(weapon));
    availableNewWeapons.slice(0, 2).forEach(weapon => {
      options.push({
        id: `new_${weapon}`,
        name: weapon,
        description: `새로운 무기를 획득합니다`,
        type: 'weapon'
      });
    });
    
    // Add passive items
    allPassives.slice(0, 2).forEach(passive => {
      options.push({
        id: `passive_${passive}`,
        name: passive,
        description: `${passive} 능력을 향상시킵니다`,
        type: 'passive'
      });
    });
    
    // Add special rewards (low chance)
    if (Math.random() < 0.3) {
      options.push({
        id: 'special_heal',
        name: '체력 회복',
        description: '체력을 최대치로 회복합니다',
        type: 'special'
      });
    }
    
    if (Math.random() < 0.2) {
      options.push({
        id: 'special_magnet',
        name: '경험치 자석',
        description: '경험치 보석 수집 범위가 크게 증가합니다',
        type: 'special'
      });
    }
    
    // Return up to 4 random options
    const shuffled = options.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(4, shuffled.length));
  }

  private applyLevelUpReward(option: LevelUpOption): void {
    console.log(`Selected reward: ${option.name}`);
    
    if (option.id.startsWith('upgrade_')) {
      const weaponName = option.id.replace('upgrade_', '');
      // Find and upgrade existing weapon
      const weapons = this.weaponManager.getWeapons();
      const weapon = weapons.find(w => w.getName() === weaponName);
      if (weapon) {
        weapon.levelUp();
        console.log(`${weaponName} upgraded to level ${weapon.getLevel()}`);
      }
    } else if (option.id.startsWith('new_')) {
      const weaponName = option.id.replace('new_', '');
      this.weaponManager.addWeapon(weaponName);
      console.log(`New weapon added: ${weaponName}`);
    } else if (option.id.startsWith('passive_')) {
      const passiveName = option.id.replace('passive_', '');
      this.applyPassiveBonus(passiveName);
      console.log(`Passive applied: ${passiveName}`);
    } else if (option.id === 'special_heal') {
      // Heal player to full health
      const currentHealth = this.player.getHealth();
      const healAmount = 100 - currentHealth; // Assuming max health is 100
      this.player.heal(healAmount);
      console.log('Player healed to full health!');
    } else if (option.id === 'special_magnet') {
      this.hasExperienceMagnet = true;
      console.log('Experience magnet activated!');
    }
  }

  private handleLevelUpMenuClick(x: number, y: number): void {
    const canvas = this.game.getCanvas();
    
    // Use card-based layout like TutorialScene
    const cardWidth = 200;
    const cardHeight = 120;
    const spacing = 20;
    const totalWidth = this.levelUpOptions.length * cardWidth + (this.levelUpOptions.length - 1) * spacing;
    const startX = (canvas.width - totalWidth) / 2;
    const startY = (canvas.height - cardHeight) / 2;
    
    // Check which card was clicked
    for (let i = 0; i < this.levelUpOptions.length; i++) {
      const cardX = startX + i * (cardWidth + spacing);
      
      if (x >= cardX && x <= cardX + cardWidth &&
          y >= startY && y <= startY + cardHeight) {
        this.selectLevelUpOption(i);
        break;
      }
    }
  }

  private selectLevelUpOption(index: number): void {
    if (index >= 0 && index < this.levelUpOptions.length) {
      const option = this.levelUpOptions[index];
      this.applyLevelUpReward(option);
      this.showLevelUpMenu = false;
      this.levelUpOptions = [];
    }
  }

  private applyPassiveBonus(passiveName: string): void {
    switch (passiveName) {
      case '체력 증가':
        // Heal player as a simple health increase
        this.player.heal(20);
        console.log('Max health increased!');
        break;
      case '이동속도':
        // Speed increase would need to be implemented in Player class
        console.log('Movement speed increased!');
        break;
      case '공격력':
        // This would be handled by weapon manager
        console.log('Attack power increased!');
        break;
      case '경험치 획득':
        // This would modify experience gain multiplier
        console.log('Experience gain increased!');
        break;
      case '쿨타임 감소':
        // This would be handled by weapon manager
        console.log('Cooldown reduced!');
        break;
      case '관통력':
        // This would be handled by weapon manager  
        console.log('Penetration increased!');
        break;
    }
  }

  private checkExperienceGemCollisions(): void {
    const playerBounds = this.player.getBounds();
    
    this.experienceGems.forEach(gem => {
      if (!gem.isAlive()) return;
      
      const gemBounds = gem.getBounds();
      
      if (GameUtils.isColliding(playerBounds, gemBounds)) {
        this.experience += gem.getValue();
        gem.destroy();
        console.log(`Collected ${gem.getValue()} experience`);
      }
    });
  }

  private checkTreasureChestCollisions(): void {
    const playerBounds = this.player.getBounds();
    
    this.treasureChests.forEach(chest => {
      if (!chest.isAlive()) return;
      
      const chestBounds = chest.getBounds();
      
      if (GameUtils.isColliding(playerBounds, chestBounds)) {
        const rewards = chest.getRewards();
        chest.open();
        chest.destroy();
        
        // Apply treasure rewards
        rewards.forEach(reward => {
          this.applyTreasureReward(reward);
        });
        
        console.log('Treasure chest opened!', rewards);
      }
    });
  }

  private applyTreasureReward(reward: string): void {
    switch (reward) {
      case '체력 회복':
        this.player.heal(50);
        break;
      case '경험치 자석':
        this.hasExperienceMagnet = true;
        break;
      case '공격력 증가':
        // Would be handled by weapon manager
        console.log('Attack power bonus from treasure!');
        break;
      case '이동속도 증가':
        // Speed increase would need to be implemented in Player class
        console.log('Movement speed bonus from treasure!');
        break;
      case '무기 강화':
        // Upgrade a random weapon
        const weapons = this.weaponManager.getWeapons();
        if (weapons.length > 0) {
          const randomWeapon = weapons[Math.floor(Math.random() * weapons.length)];
          randomWeapon.levelUp();
          console.log(`${randomWeapon.getName()} upgraded from treasure!`);
        }
        break;
      case '패시브 아이템':
        // Give experience bonus
        this.experience += 100;
        break;
    }
  }

  private dropExperienceGem(x: number, y: number, baseValue: number): void {
    // Use updated gem values based on enemy type
    let gemValue = baseValue;
    if (baseValue >= 50) {
      gemValue = 100; // Blue gem (updated from 50 to 100)
    } else if (baseValue >= 25) {
      gemValue = 50; // Purple gem (updated from 25 to 50)
    } else {
      gemValue = 25; // Yellow gem (updated from 10 to 25)
    }
    
    const gem = new ExperienceGem(x, y, gemValue);
    gem.init();
    this.experienceGems.push(gem);
  }

  private dropTreasureChest(x: number, y: number): void {
    const chest = new TreasureChest(x, y, 3);
    chest.init();
    this.treasureChests.push(chest);
  }

  private checkAreaEffectCollisions(): void {
    this.areaEffects.forEach(effect => {
      // Apply damage to old enemies
      const damagedOldEnemies = effect.applyDamage(this.enemies);
      // No experience from area effects, only from gems
      
      // Apply damage to new enemies directly without conversion
      this.newEnemies.forEach(enemy => {
        if (!enemy.isAlive()) return;
        
        const enemyBounds = enemy.getBounds();
        if (effect.isInArea(enemyBounds.x + enemyBounds.width/2, enemyBounds.y + enemyBounds.height/2)) {
          enemy.takeDamage(effect.getDamage());
          
          // Drop experience gem when enemy dies
          if (!enemy.isAlive()) {
            this.dropExperienceGem(enemyBounds.x + enemyBounds.width/2, enemyBounds.y + enemyBounds.height/2, enemy.getExperienceValue());
          }
        }
      });
    });
  }

  private getSpawnInterval(): number {
    // Decrease spawn interval over time for increasing difficulty
    const timeMinutes = this.gameTime / 60;
    let interval = this.baseSpawnInterval;
    
    if (timeMinutes >= 15) {
      interval = 0.3; // Very fast spawning after 15 minutes
    } else if (timeMinutes >= 10) {
      interval = 0.5; // Fast spawning after 10 minutes
    } else if (timeMinutes >= 6) {
      interval = 0.8; // Medium-fast spawning after 6 minutes
    } else if (timeMinutes >= 3) {
      interval = 1.2; // Medium spawning after 3 minutes
    } else if (timeMinutes >= 1) { // Start difficulty increase at 1 minute
      interval = 1.6; // Slightly faster spawning after 1 minute
    }
    
    return interval;
  }

  private spawnEnemiesByTime(): void {
    const timeMinutes = this.gameTime / 60;
    const canvas = this.game.getCanvas();
    
    // Determine spawn count based on time - more aggressive scaling
    let spawnCount = 1;
    if (timeMinutes >= 8) spawnCount = 4;
    else if (timeMinutes >= 5) spawnCount = 3;
    else if (timeMinutes >= 2) spawnCount = 2;
    
    for (let i = 0; i < spawnCount; i++) {
      const spawnPos = this.getRandomSpawnPosition(canvas);
      
      if (timeMinutes < 3) {
        // Early game: Slimes and Bats (increased difficulty earlier)
        if (Math.random() < 0.6) {
          this.spawnSlime(spawnPos.x, spawnPos.y);
        } else {
          this.spawnBat(spawnPos.x, spawnPos.y);
        }
      } else if (timeMinutes < 8) {
        // Mid game: Add stronger enemies earlier
        const rand = Math.random();
        if (rand < 0.25) {
          this.spawnSlime(spawnPos.x, spawnPos.y);
        } else if (rand < 0.45) {
          this.spawnBat(spawnPos.x, spawnPos.y);
        } else if (rand < 0.75) {
          this.spawnSkeletonSoldier(spawnPos.x, spawnPos.y);
        } else {
          this.spawnGoblinShaman(spawnPos.x, spawnPos.y);
        }
      } else {
        // Late game: Heavily weighted towards strong enemies
        const rand = Math.random();
        if (rand < 0.15) {
          this.spawnSlime(spawnPos.x, spawnPos.y);
        } else if (rand < 0.25) {
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

  private spawnEnemiesFromWave(): void {
    const enemyTypes = this.waveManager.getEnemyTypesToSpawn();
    const maxEnemies = this.waveManager.getMaxEnemies();
    const currentEnemyCount = this.newEnemies.length + this.enemies.length;
    
    if (currentEnemyCount >= maxEnemies) return;
    
    const canvas = this.game.getCanvas();
    const spawnPos = this.getRandomSpawnPosition(canvas);
    
    // Select random enemy type from current wave
    const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    
    switch (randomType) {
      case 'slime':
        this.spawnSlime(spawnPos.x, spawnPos.y);
        break;
      case 'bat':
        this.spawnBat(spawnPos.x, spawnPos.y);
        break;
      case 'skeleton':
        this.spawnSkeletonSoldier(spawnPos.x, spawnPos.y);
        break;
      case 'goblin':
        this.spawnGoblinShaman(spawnPos.x, spawnPos.y);
        break;
      case 'ogre':
        this.spawnEliteEnemy();
        break;
    }
  }

  private spawnBoss(bossType: string): void {
    const canvas = this.game.getCanvas();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    console.log(`Spawning boss: ${bossType}`);
    
    switch (bossType) {
      case 'mini_boss':
        // Spawn multiple elite enemies
        for (let i = 0; i < 2; i++) {
          const spawnPos = this.getRandomSpawnPosition(canvas);
          this.spawnEliteEnemy();
        }
        break;
      case 'boss':
      case 'elite_boss':
        // Spawn Ogre boss
        const ogre = new Ogre(centerX, centerY - 100);
        ogre.init();
        this.newEnemies.push(ogre);
        break;
      case 'reaper':
        // Spawn the ultimate boss
        if (!this.reaperSpawned) {
          const reaper = new Reaper(centerX, centerY - 100, this.playerLevel, canvas.width, canvas.height);
          reaper.init();
          this.newEnemies.push(reaper);
          this.reaperSpawned = true;
        }
        break;
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
      
      // Check collisions with old enemies
      this.enemies.forEach(enemy => {
        if (!enemy.isAlive()) return;
        
        const enemyBounds = enemy.getBounds();
        
        if (GameUtils.isColliding(bulletBounds, enemyBounds)) {
          // Damage enemy
          enemy.takeDamage(bullet.getDamage());
          // No experience for hitting, only from gems
          
          // Destroy bullet unless it's penetrating
          if (!bullet.isPenetrating()) {
            bullet.destroy();
          }
          
          this.game.getAudioManager().playSound('/sounds/hit.mp3');
          console.log(`Enemy hit by bullet for ${bullet.getDamage()} damage`);
          
          // Check if enemy died and add score  
          if (!enemy.isAlive()) {
            this.dropExperienceGem(enemy.getPosition().x, enemy.getPosition().y, enemy.getExperienceValue());
            this.addScore(enemy.getScoreValue());
            this.enemiesKilled++;
            console.log(`Enemy killed! Score: +${enemy.getScoreValue()}, Total kills: ${this.enemiesKilled}`);
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
          // No experience for hitting, only from gems
          
          // Destroy bullet unless it's penetrating
          if (!bullet.isPenetrating()) {
            bullet.destroy();
          }
          
          this.game.getAudioManager().playSound('/sounds/hit.mp3');
          console.log(`${enemy.constructor.name} hit by bullet for ${bullet.getDamage()} damage`);
          
          // Drop experience gem when enemy dies
          if (!enemy.isAlive()) {
            this.dropExperienceGem(enemy.getPosition().x, enemy.getPosition().y, enemy.getExperienceValue());
            this.addScore(enemy.getScoreValue());
            this.enemiesKilled++;
            console.log(`Enemy killed! Score: +${enemy.getScoreValue()}, Total kills: ${this.enemiesKilled}`);
            
            // Check for treasure drop from Ogre
            if (enemy instanceof Ogre && enemy.shouldDropTreasure()) {
              this.dropTreasureChest(enemy.getPosition().x, enemy.getPosition().y);
              console.log('Ogre dropped treasure!');
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



  private removeDeadObjects(): void {
    this.enemies = this.enemies.filter(enemy => enemy.isAlive());
    this.newEnemies = this.newEnemies.filter(enemy => enemy.isAlive());
    this.bullets = this.bullets.filter(bullet => bullet.isAlive());
    this.areaEffects = this.areaEffects.filter(effect => effect.isActive());
    this.experienceGems = this.experienceGems.filter(gem => gem.isAlive());
    this.treasureChests = this.treasureChests.filter(chest => chest.isAlive());
  }

  private addScore(points: number): void {
    this.score += points;
  }

  private calculateFinalScore(): number {
    const timeBonus = Math.floor(this.gameTime * 10); // 10 points per second
    const killBonus = this.enemiesKilled * 50; // 50 points per kill
    const levelBonus = (this.playerLevel - 1) * 100; // 100 points per level
    return this.score + timeBonus + killBonus + levelBonus;
  }

  private handleGameOver(): void {
    this.gameOver = true;
    this.showGameOverMenu = true;
    this.game.getAudioManager().stopBackgroundMusic();
    console.log('Game Over!');
  }

  private restart(): void {
    this.init();
  }

  private renderGameOverMenu(ctx: CanvasRenderingContext2D): void {
    const canvas = this.game.getCanvas();
    
    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Game Over title
    ctx.fillStyle = '#FF4444';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('게임 오버', canvas.width / 2, canvas.height / 2 - 150);
    
    // Calculate final score
    const finalScore = this.calculateFinalScore();
    const survivalTime = Math.floor(this.gameTime);
    const timeBonus = Math.floor(this.gameTime * 10);
    const killBonus = this.enemiesKilled * 50;
    const levelBonus = (this.playerLevel - 1) * 100;
    
    // Score breakdown
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px Arial';
    ctx.fillText(`생존 시간: ${survivalTime}초 (보너스: ${timeBonus}점)`, canvas.width / 2, canvas.height / 2 - 80);
    ctx.fillText(`적 처치: ${this.enemiesKilled}마리 (보너스: ${killBonus}점)`, canvas.width / 2, canvas.height / 2 - 40);
    ctx.fillText(`레벨: ${this.playerLevel} (보너스: ${levelBonus}점)`, canvas.width / 2, canvas.height / 2);
    
    // Final score
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 32px Arial';
    ctx.fillText(`최종 점수: ${finalScore}점`, canvas.width / 2, canvas.height / 2 + 60);
    
    // Instructions
    ctx.fillStyle = '#CCCCCC';
    ctx.font = '20px Arial';
    ctx.fillText('R키를 눌러 다시 시작', canvas.width / 2, canvas.height / 2 + 120);
    ctx.fillText('ESC키를 눌러 메인 메뉴로', canvas.width / 2, canvas.height / 2 + 150);
  }

  private handleGameOverMenuClick(): void {
    const mousePos = this.game.getInputManager().getMousePosition();
    const canvas = this.game.getCanvas();
    
    // Check if clicked on restart area (around the restart text)
    const restartTextY = canvas.height / 2 + 120;
    if (mousePos.y >= restartTextY - 20 && mousePos.y <= restartTextY + 20) {
      this.restart();
      return;
    }
    
    // Check if clicked on menu area (around the menu text)
    const menuTextY = canvas.height / 2 + 150;
    if (mousePos.y >= menuTextY - 20 && mousePos.y <= menuTextY + 20) {
      this.game.switchScene('mainmenu');
      return;
    }
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

    // Render experience gems
    this.experienceGems.forEach(gem => {
      gem.render(ctx);
    });

    // Render treasure chests
    this.treasureChests.forEach(chest => {
      chest.render(ctx);
    });

    // Render experience bar first (at very top)
    this.experienceBar.render(ctx);

    // Render UI (moved further down to avoid overlap with experience bar)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Level: ${this.playerLevel}`, 10, 50);
    ctx.fillText(`Health: ${this.player.getHealth()}`, 10, 70);
    ctx.fillText(`Time: ${Math.floor(this.gameTime)}s`, 10, 90);
    ctx.fillText(`Enemies: ${this.enemies.length + this.newEnemies.length}`, 10, 110);

    // Render weapon images (synchronized with TutorialScene)
    this.renderWeaponImages(ctx);

    // Level up UI is now handled in renderLevelUpMenu

    // Render bullets
    this.bullets.forEach(bullet => {
      bullet.render(ctx);
    });

    // Render UI overlay
    const uiScene = this.game.getScene('ui');
    if (uiScene) {
      uiScene.render(ctx);
    }

    // Render level up menu if active
    if (this.showLevelUpMenu) {
      this.renderLevelUpMenu(ctx);
    }

    // Render game over menu if active
    if (this.showGameOverMenu) {
      this.renderGameOverMenu(ctx);
    }
  }

  private renderWeaponImages(ctx: CanvasRenderingContext2D): void {
    const canvas = this.game.getCanvas();
    const weapons = this.weaponManager.getWeapons();
    
    // Weapon image container (bottom right)
    const containerX = canvas.width - 250;
    const containerY = canvas.height - 120;
    const imageSize = 40;
    const spacing = 50;
    
    // Background for weapon container
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(containerX - 10, containerY - 10, 240, 80);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.strokeRect(containerX - 10, containerY - 10, 240, 80);
    
    // Title
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('무기:', containerX, containerY - 15);
    
    // Render weapon images
    weapons.forEach((weapon, index) => {
      if (index >= 4) return; // Limit to 4 weapons displayed
      
      const weaponX = containerX + index * spacing;
      const weaponY = containerY;
      
      // Weapon icon background
      ctx.fillStyle = '#333333';
      ctx.fillRect(weaponX, weaponY, imageSize, imageSize);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.strokeRect(weaponX, weaponY, imageSize, imageSize);
      
      // Simple weapon icon representation
      ctx.fillStyle = this.getWeaponColor(weapon.getName());
      ctx.fillRect(weaponX + 5, weaponY + 5, imageSize - 10, imageSize - 10);
      
      // Weapon level
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${weapon.getLevel()}`, weaponX + imageSize / 2, weaponY + imageSize + 15);
    });
  }
  
  private getWeaponColor(weaponName: string): string {
    switch (weaponName) {
      case '마력 구체': return '#4A90E2'; // Blue
      case '수리검': return '#8B4513'; // Brown
      case '신성한 영역': return '#FFD700'; // Gold
      case '화염구': return '#FF4500'; // Orange
      case '냉기 창': return '#00FFFF'; // Cyan
      case '번개': return '#FFFF00'; // Yellow
      default: return '#FFFFFF'; // White
    }
  }

  private renderLevelUpMenu(ctx: CanvasRenderingContext2D): void {
    const canvas = this.game.getCanvas();
    
    // Light semi-transparent backdrop
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Use card-based layout like TutorialScene
    const cardWidth = 200;
    const cardHeight = 120;
    const spacing = 20;
    const totalWidth = this.levelUpOptions.length * cardWidth + (this.levelUpOptions.length - 1) * spacing;
    const startX = (canvas.width - totalWidth) / 2;
    const startY = (canvas.height - cardHeight) / 2;

    // Title
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 32px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('LEVEL UP!', canvas.width / 2, startY - 40);

    // Subtitle
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '18px "Courier New", monospace';
    ctx.fillText('업그레이드를 선택하세요:', canvas.width / 2, startY - 10);

    // Render options as cards
    this.levelUpOptions.forEach((option, index) => {
      const cardX = startX + index * (cardWidth + spacing);
      
      // Color-coded card background based on type
      let bgColor = 'rgba(51, 51, 51, 0.9)';
      let borderColor = '#666666';
      if (option.type === 'weapon') {
        bgColor = 'rgba(70, 130, 180, 0.8)'; // Steel blue for weapons
        borderColor = '#4682B4';
      } else if (option.id && option.id.startsWith('upgrade_')) {
        bgColor = 'rgba(255, 165, 0, 0.8)'; // Orange for upgrades
        borderColor = '#FFA500';
      } else if (option.type === 'passive') {
        bgColor = 'rgba(50, 205, 50, 0.8)'; // Lime green for passives
        borderColor = '#32CD32';
      } else if (option.type === 'special') {
        bgColor = 'rgba(218, 165, 32, 0.8)'; // Gold for special items
        borderColor = '#DAA520';
      }
      
      // Card background
      ctx.fillStyle = bgColor;
      ctx.fillRect(cardX, startY, cardWidth, cardHeight);
      
      // Card border
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(cardX, startY, cardWidth, cardHeight);
      
      // Card number indicator
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px "Courier New", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`${index + 1}`, cardX + 10, startY + 20);
      
      // Option name
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(option.name, cardX + cardWidth / 2, startY + 45);
      
      // Option description (word wrap)
      ctx.font = '12px "Courier New", monospace';
      const words = option.description.split(' ');
      let line = '';
      let lineY = startY + 65;
      
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > cardWidth - 20 && n > 0) {
          ctx.fillText(line, cardX + cardWidth / 2, lineY);
          line = words[n] + ' ';
          lineY += 15;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, cardX + cardWidth / 2, lineY);
    });

    // Instructions
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('카드를 클릭하거나 숫자 키(1-4)를 눌러 선택하세요', canvas.width / 2, startY + cardHeight + 40);
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
