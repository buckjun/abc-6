import { Scene } from '../Game';
import type { Game } from '../Game';
import { Player } from '../entities/Player';
import { WeaponManager } from '../managers/WeaponManager';
import { EnemyA } from '../entities/enemies/EnemyA';
import { EnemyB } from '../entities/enemies/EnemyB';
import { EnemyC } from '../entities/enemies/EnemyC';
import { Boot } from '../entities/enemies/Boot';
import { EnemyBase } from '../entities/enemies/EnemyBase';
import { ExperienceGem } from '../entities/ExperienceGem';
import { Bullet } from '../entities/Bullet';
import { AreaEffect } from '../entities/AreaEffect';
import { GameUtils } from '../utils/GameUtils';

interface LevelUpOption {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'passive' | 'special';
}

export class TutorialScene implements Scene {
  private game: Game;
  private player: Player;
  private weaponManager: WeaponManager;
  private enemies: EnemyBase[] = [];
  private experienceGems: ExperienceGem[] = [];
  private bullets: Bullet[] = [];
  private areaEffects: AreaEffect[] = [];
  
  // Game state
  private gameTime: number = 0;
  private experience: number = 0;
  private level: number = 1;
  private experienceToNext: number = 100;
  
  // Tutorial specific
  private tutorialTime: number = 300; // 5 minutes = 300 seconds
  private bossSpawned: boolean = false;
  private tutorialComplete: boolean = false;
  private gameWon: boolean = false;
  
  // Spawning
  private lastSpawnTime: number = 0;
  private baseSpawnInterval: number = 2.0; // Spawn enemies every 2 seconds (slower than infinite mode)
  
  // Level up UI
  private showLevelUpMenu: boolean = false;
  private levelUpOptions: LevelUpOption[] = [];
  private selectedOptionIndex: number = 0;
  
  constructor(game: Game) {
    this.game = game;
    this.player = new Player(640, 360); // Center of 1280x720 canvas
    this.weaponManager = new WeaponManager();
    
    // Set up mouse click handler for level up menu
    this.game.getInputManager().onCanvasClick((x, y) => {
      if (this.showLevelUpMenu) {
        this.handleLevelUpMenuClick(x, y);
      }
    });
  }

  init(): void {
    console.log('TutorialScene initialized');
    this.player.init();
    
    // Start with Magic Orb only
    this.weaponManager.addWeapon('마력 구체');
    
    // Reset all game state
    this.gameTime = 0;
    this.experience = 0;
    this.level = 1;
    this.experienceToNext = 100;
    this.bossSpawned = false;
    this.tutorialComplete = false;
    this.gameWon = false;
    this.enemies = [];
    this.experienceGems = [];
    this.bullets = [];
    this.areaEffects = [];
    
    console.log('Tutorial started - defeat the boss before 5 minutes!');
  }

  update(deltaTime: number): void {
    if (this.tutorialComplete) return;
    
    this.gameTime += deltaTime;
    
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
      return; // Pause game during level up
    }

    // Handle player movement using WASD + Arrow keys (from GameScene)
    this.handlePlayerMovement(deltaTime);
    
    // Update player
    this.player.update(deltaTime);
    
    // Spawn boss at 4:30 (30 seconds before end)
    if (!this.bossSpawned && this.gameTime >= 270) { // 4.5 minutes
      this.spawnBoss();
      this.bossSpawned = true;
    }
    
    // Check tutorial time limit
    if (this.gameTime >= this.tutorialTime) {
      this.endTutorial(false); // Time's up, failed
      return;
    }
    
    // Spawn enemies (reduced rate for tutorial)
    this.lastSpawnTime += deltaTime;
    if (this.lastSpawnTime >= this.baseSpawnInterval) {
      this.spawnEnemiesByTime();
      this.lastSpawnTime = 0;
    }
    
    // Update weapons and get projectiles
    const playerPos = this.player.getPosition();
    const mousePos = this.game.getInputManager().getMousePosition();
    const weaponResults = this.weaponManager.update(deltaTime, this.player, this.enemies, mousePos.x, mousePos.y);
    
    // Add new bullets and area effects
    this.bullets.push(...weaponResults.bullets);
    this.areaEffects.push(...weaponResults.areaEffects);
    
    // Update bullets
    this.bullets.forEach(bullet => bullet.update(deltaTime));
    this.bullets = this.bullets.filter(bullet => bullet.isAlive());
    
    // Update area effects
    this.areaEffects.forEach(effect => effect.update(deltaTime));
    this.areaEffects = this.areaEffects.filter(effect => effect.isAlive());
    
    // Update enemies
    this.enemies.forEach(enemy => {
      enemy.update(deltaTime, playerPos.x, playerPos.y);
    });
    this.enemies = this.enemies.filter(enemy => enemy.isAlive());
    
    // Update experience gems
    this.experienceGems.forEach(gem => gem.update(deltaTime, playerPos.x, playerPos.y));
    this.experienceGems = this.experienceGems.filter(gem => gem.isAlive());
    
    // Check collisions
    this.checkBulletEnemyCollisions();
    this.checkAreaEffectCollisions();
    this.checkPlayerEnemyCollisions();
    this.checkExperienceGemCollisions();
    
    // Check experience and level up
    this.checkLevelUp();
  }

  private handlePlayerMovement(deltaTime: number): void {
    const inputManager = this.game.getInputManager();
    let moveX = 0;
    let moveY = 0;

    // WASD and Arrow key movement (synchronized with GameScene)
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

  private spawnBoss(): void {
    const canvas = this.game.getCanvas();
    const spawnPos = this.getRandomSpawnPosition(canvas);
    
    const boss = new Boot(spawnPos.x, spawnPos.y);
    boss.init();
    this.enemies.push(boss);
    
    console.log('BOSS BOOT SPAWNED! Defeat it to complete the tutorial!');
  }

  private spawnEnemiesByTime(): void {
    const timeMinutes = this.gameTime / 60;
    const canvas = this.game.getCanvas();
    
    // Reduced spawn rate for tutorial
    let spawnCount = 1;
    if (timeMinutes >= 3) spawnCount = 2;
    else if (timeMinutes >= 1.5) spawnCount = 1;
    
    for (let i = 0; i < spawnCount; i++) {
      const spawnPos = this.getRandomSpawnPosition(canvas);
      const rand = Math.random();
      
      if (timeMinutes < 1.5) {
        // Early tutorial: Only A enemies (fast)
        const enemyA = new EnemyA(spawnPos.x, spawnPos.y);
        enemyA.init();
        this.enemies.push(enemyA);
      } else if (timeMinutes < 3) {
        // Mid tutorial: A and B enemies
        if (rand < 0.6) {
          const enemyA = new EnemyA(spawnPos.x, spawnPos.y);
          enemyA.init();
          this.enemies.push(enemyA);
        } else {
          const enemyB = new EnemyB(spawnPos.x, spawnPos.y);
          enemyB.init();
          this.enemies.push(enemyB);
        }
      } else {
        // Late tutorial: All enemy types before boss
        if (rand < 0.4) {
          const enemyA = new EnemyA(spawnPos.x, spawnPos.y);
          enemyA.init();
          this.enemies.push(enemyA);
        } else if (rand < 0.7) {
          const enemyB = new EnemyB(spawnPos.x, spawnPos.y);
          enemyB.init();
          this.enemies.push(enemyB);
        } else {
          const enemyC = new EnemyC(spawnPos.x, spawnPos.y);
          enemyC.init();
          this.enemies.push(enemyC);
        }
      }
    }
  }

  private getRandomSpawnPosition(canvas: HTMLCanvasElement): { x: number; y: number } {
    const playerPos = this.player.getPosition();
    const minDistance = 200;
    const maxDistance = 400;
    
    let x, y;
    do {
      const angle = Math.random() * Math.PI * 2;
      const distance = minDistance + Math.random() * (maxDistance - minDistance);
      x = playerPos.x + Math.cos(angle) * distance;
      y = playerPos.y + Math.sin(angle) * distance;
      
      // Keep within canvas bounds
      x = Math.max(50, Math.min(canvas.width - 50, x));
      y = Math.max(50, Math.min(canvas.height - 50, y));
    } while (Math.sqrt((x - playerPos.x) ** 2 + (y - playerPos.y) ** 2) < minDistance);
    
    return { x, y };
  }



  private checkBulletEnemyCollisions(): void {
    this.bullets.forEach(bullet => {
      if (!bullet.isAlive()) return;
      
      this.enemies.forEach(enemy => {
        if (!enemy.isAlive()) return;
        
        const bulletBounds = bullet.getBounds();
        const enemyBounds = enemy.getBounds();
        
        if (GameUtils.isColliding(bulletBounds, enemyBounds)) {
          enemy.takeDamage(bullet.getDamage());
          console.log(`${enemy.constructor.name} hit by bullet for ${bullet.getDamage()} damage`);
          
          if (!bullet.isPenetrating()) {
            bullet.destroy();
          }
          
          if (!enemy.isAlive()) {
            this.dropExperienceGem(enemyBounds.x + enemyBounds.width/2, enemyBounds.y + enemyBounds.height/2, 25);
            
            // Check if boss was defeated
            if (enemy instanceof Boot && this.bossSpawned) {
              this.endTutorial(true); // Victory!
            }
          }
        }
      });
    });
  }

  private checkAreaEffectCollisions(): void {
    this.areaEffects.forEach(effect => {
      this.enemies.forEach(enemy => {
        if (!enemy.isAlive()) return;
        
        const enemyBounds = enemy.getBounds();
        if (effect.isInArea(enemyBounds.x + enemyBounds.width/2, enemyBounds.y + enemyBounds.height/2)) {
          enemy.takeDamage(effect.getDamage());
          
          if (!enemy.isAlive()) {
            this.dropExperienceGem(enemyBounds.x + enemyBounds.width/2, enemyBounds.y + enemyBounds.height/2, 25);
            
            // Check if boss was defeated
            if (enemy instanceof Boot && this.bossSpawned) {
              this.endTutorial(true); // Victory!
            }
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
        // Player takes damage when touching enemies (synchronized with GameScene)
        this.player.takeDamage(6); // 6 damage per collision
        console.log(`Player took 6 damage. Health: ${this.player.getHealth()}`);
        
        // Enemy disappears after touching player (synchronized with GameScene)
        enemy.destroy();
        
        // Check if player died
        if (this.player.getHealth() <= 0) {
          this.endTutorial(false); // Game over
        }
      }
    });
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

  private dropExperienceGem(x: number, y: number, baseValue: number): void {
    let gemValue = baseValue;
    if (baseValue >= 50) {
      gemValue = 100; // Blue gem
    } else if (baseValue >= 25) {
      gemValue = 50; // Purple gem
    } else {
      gemValue = 25; // Yellow gem
    }
    
    const gem = new ExperienceGem(x, y, gemValue);
    gem.init();
    this.experienceGems.push(gem);
  }

  private checkLevelUp(): void {
    if (this.experience >= this.experienceToNext && !this.showLevelUpMenu) {
      this.levelUp();
    }
  }

  private levelUp(): void {
    this.level++;
    this.experience -= this.experienceToNext;
    this.experienceToNext = Math.floor(this.experienceToNext * 1.2);
    
    console.log(`Level up! Now level ${this.level}`);
    
    this.levelUpOptions = this.generateLevelUpOptions();
    this.showLevelUpMenu = true;
    this.selectedOptionIndex = 0;
  }

  private generateLevelUpOptions(): LevelUpOption[] {
    const options: LevelUpOption[] = [];
    const weapons = this.weaponManager.getWeapons();
    
    // Add weapon upgrades
    weapons.forEach(weapon => {
      if (weapon.canLevelUp()) {
        options.push({
          id: `upgrade_${weapon.getName()}`,
          name: `${weapon.getName()} 강화`,
          description: `${weapon.getName()}을(를) 레벨 ${weapon.getLevel() + 1}로 강화합니다`,
          type: 'weapon'
        });
      }
    });
    
    // Add new weapons if slots available
    if (this.weaponManager.getAvailableWeaponSlots() > 0) {
      const availableWeapons = ['수리검', '신성한 영역'];
      availableWeapons.forEach(weaponType => {
        if (!weapons.some(w => w.getName().includes(weaponType))) {
          options.push({
            id: `new_${weaponType}`,
            name: weaponType,
            description: `새로운 무기: ${weaponType}`,
            type: 'weapon'
          });
        }
      });
    }
    
    // Add passive options
    const passiveOptions = [
      { id: 'passive_체력 증가', name: '체력 증가', description: '최대 체력이 증가하고 체력을 회복합니다' },
      { id: 'passive_이동속도', name: '이동속도 증가', description: '이동 속도가 증가합니다' },
      { id: 'passive_공격력', name: '공격력 증가', description: '모든 무기의 공격력이 증가합니다' }
    ];
    
    passiveOptions.forEach(passive => options.push({ ...passive, type: 'passive' }));
    
    // Special options
    if (this.player.getHealth() < 70) {
      options.push({
        id: 'special_heal',
        name: '완전 회복',
        description: '체력을 완전히 회복합니다',
        type: 'special'
      });
    }
    
    const shuffled = options.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(4, shuffled.length));
  }

  private handleLevelUpMenuClick(x: number, y: number): void {
    const canvas = this.game.getCanvas();
    
    // Use card-based layout like GameScene
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

  private applyLevelUpReward(option: LevelUpOption): void {
    console.log(`Selected reward: ${option.name}`);
    
    if (option.id.startsWith('upgrade_')) {
      const weaponName = option.id.replace('upgrade_', '');
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
    } else if (option.id === 'special_heal') {
      const currentHealth = this.player.getHealth();
      const healAmount = 100 - currentHealth;
      this.player.heal(healAmount);
      console.log('Player healed to full health!');
    }
  }

  private endTutorial(victory: boolean): void {
    this.tutorialComplete = true;
    this.gameWon = victory;
    
    if (victory) {
      console.log('TUTORIAL COMPLETE! Boss defeated!');
    } else {
      console.log('Tutorial failed. Try again!');
    }
    
    // Wait a moment then return to menu
    setTimeout(() => {
      this.game.switchScene('mainmenu');
    }, 3000);
  }

  render(ctx: CanvasRenderingContext2D): void {
    const canvas = this.game.getCanvas();
    
    // Modern battlefield background
    ctx.fillStyle = '#2C1810'; // Dark brown base
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Battle-worn terrain pattern
    ctx.strokeStyle = '#4A3B2F';
    ctx.lineWidth = 2;
    for (let x = 0; x < canvas.width; x += 80) {
      for (let y = 0; y < canvas.height; y += 80) {
        // Random battle scars/cracks
        if (Math.sin(x * 0.01) * Math.cos(y * 0.01) > 0.3) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 20 + Math.sin(x) * 10, y + 20 + Math.cos(y) * 10);
          ctx.stroke();
        }
      }
    }

    // Ambient lighting effect
    const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width/2);
    gradient.addColorStop(0, 'rgba(255, 165, 0, 0.1)'); // Orange glow center
    gradient.addColorStop(0.5, 'rgba(139, 69, 19, 0.05)'); // Brown mid
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)'); // Dark edges
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Battle debris (rocks/stones)
    ctx.fillStyle = '#696969';
    for (let i = 0; i < 15; i++) {
      const x = (i * 137 + 50) % canvas.width;
      const y = (i * 97 + 100) % canvas.height;
      ctx.fillRect(x, y, 8 + (i % 4), 6 + (i % 3));
    }
    
    // Render game objects
    this.areaEffects.forEach(effect => effect.render(ctx));
    this.experienceGems.forEach(gem => gem.render(ctx));
    this.enemies.forEach(enemy => enemy.render(ctx));
    this.bullets.forEach(bullet => bullet.render(ctx));
    this.player.render(ctx);
    
    // Tutorial UI
    this.renderTutorialUI(ctx);
    
    // Level up menu
    if (this.showLevelUpMenu) {
      this.renderLevelUpMenu(ctx);
    }
    
    // End screen
    if (this.tutorialComplete) {
      this.renderEndScreen(ctx);
    }
  }

  private renderTutorialUI(ctx: CanvasRenderingContext2D): void {
    const canvas = this.game.getCanvas();
    
    // Tutorial timer at top
    const timeLeft = Math.max(0, this.tutorialTime - this.gameTime);
    const minutes = Math.floor(timeLeft / 60);
    const seconds = Math.floor(timeLeft % 60);
    
    ctx.fillStyle = timeLeft < 60 ? '#FF4444' : '#FFFFFF';
    ctx.font = 'bold 24px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`TIME: ${minutes}:${seconds.toString().padStart(2, '0')}`, canvas.width / 2, 40);
    
    // Tutorial objective
    if (!this.bossSpawned) {
      ctx.fillStyle = '#FFAA00';
      ctx.font = '18px "Courier New", monospace';
      ctx.fillText('목표: 보스가 나타날 때까지 생존하세요!', canvas.width / 2, 70);
    } else {
      ctx.fillStyle = '#FF4444';
      ctx.font = 'bold 20px "Courier New", monospace';
      ctx.fillText('보스를 처치하세요!', canvas.width / 2, 70);
    }
    
    // Player status gauges (top left)
    this.renderPlayerStatusGauges(ctx);
    
    // Player stats (bottom left)
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px "Courier New", monospace';
    ctx.fillText(`레벨: ${this.level}`, 20, canvas.height - 80);
    ctx.fillText(`체력: ${this.player.getHealth()}/100`, 20, canvas.height - 60);
    ctx.fillText(`경험치: ${this.experience}/${this.experienceToNext}`, 20, canvas.height - 40);
    ctx.fillText(`적 수: ${this.enemies.length}`, 20, canvas.height - 20);
    
    // Weapon inventory display (bottom right - matching GameScene)
    this.renderWeaponInventoryUI(ctx);
  }

  private renderPlayerStatusGauges(ctx: CanvasRenderingContext2D): void {
    const gaugeWidth = 200;
    const gaugeHeight = 20;
    const gaugeX = 20;
    const healthY = 100;
    const expY = 130;

    // Health gauge
    const healthPercent = this.player.getHealth() / 100;
    
    // Health gauge background
    ctx.fillStyle = '#333333';
    ctx.fillRect(gaugeX, healthY, gaugeWidth, gaugeHeight);
    
    // Health gauge border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(gaugeX, healthY, gaugeWidth, gaugeHeight);
    
    // Health fill
    ctx.fillStyle = healthPercent > 0.6 ? '#00FF00' : healthPercent > 0.3 ? '#FFFF00' : '#FF0000';
    ctx.fillRect(gaugeX + 2, healthY + 2, (gaugeWidth - 4) * healthPercent, gaugeHeight - 4);
    
    // Health text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`체력: ${this.player.getHealth()}/100`, gaugeX + gaugeWidth / 2, healthY + 14);

    // Experience gauge
    const expPercent = this.experience / this.experienceToNext;
    
    // Experience gauge background
    ctx.fillStyle = '#333333';
    ctx.fillRect(gaugeX, expY, gaugeWidth, gaugeHeight);
    
    // Experience gauge border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(gaugeX, expY, gaugeWidth, gaugeHeight);
    
    // Experience fill
    ctx.fillStyle = '#00AAFF';
    ctx.fillRect(gaugeX + 2, expY + 2, (gaugeWidth - 4) * expPercent, gaugeHeight - 4);
    
    // Experience text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`경험치: ${this.experience}/${this.experienceToNext}`, gaugeX + gaugeWidth / 2, expY + 14);
    
    // Level display
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`레벨: ${this.level}`, gaugeX, healthY - 10);
  }

  private renderLevelUpMenu(ctx: CanvasRenderingContext2D): void {
    const canvas = this.game.getCanvas();
    
    // Light semi-transparent backdrop (matching GameScene style)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Use card-based layout like GameScene
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

    // Render options as cards (matching GameScene style)
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

      // Enhanced card border
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(cardX, startY, cardWidth, cardHeight);

      // Option number with enhanced visibility
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px "Courier New", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`${index + 1}`, cardX + 10, startY + 25);
      
      // Type indicator
      ctx.fillStyle = borderColor;
      ctx.font = 'bold 10px "Courier New", monospace';
      ctx.textAlign = 'right';
      let typeText = '';
      if (option.type === 'weapon') typeText = '새 무기';
      else if (option.id && option.id.startsWith('upgrade_')) typeText = '강화';
      else if (option.type === 'passive') typeText = '패시브';
      else if (option.type === 'special') typeText = '특수';
      ctx.fillText(typeText, cardX + cardWidth - 10, startY + 15);
      
      // Option title with enhanced readability
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px "Courier New", monospace';
      ctx.textAlign = 'center';
      const words = option.name.split(' ');
      words.forEach((word, wordIndex) => {
        ctx.fillText(word, cardX + cardWidth / 2, startY + 45 + wordIndex * 16);
      });
      
      // Option description with better formatting
      ctx.fillStyle = '#F0F0F0';
      ctx.font = '10px "Courier New", monospace';
      const descWords = option.description.split(' ');
      let line = '';
      let lineY = startY + 85;
      
      for (let i = 0; i < descWords.length; i++) {
        const testLine = line + descWords[i] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > cardWidth - 20 && i > 0) {
          ctx.fillText(line, cardX + cardWidth / 2, lineY);
          line = descWords[i] + ' ';
          lineY += 12;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, cardX + cardWidth / 2, lineY);
    });

    // Instructions with improved visibility
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('카드를 클릭하거나 숫자 키(1-4)를 눌러 선택하세요', canvas.width / 2, startY + cardHeight + 40);
  }

  private renderWeaponInventoryUI(ctx: CanvasRenderingContext2D): void {
    const canvas = this.game.getCanvas();
    const weapons = this.weaponManager.getWeapons();
    
    if (weapons.length === 0) return;
    
    const inventoryX = canvas.width - 220;
    const inventoryY = canvas.height - 200;
    const slotWidth = 60;
    const slotHeight = 60;
    const spacing = 10;
    
    // Inventory background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(inventoryX - 10, inventoryY - 40, 200, weapons.length * (slotHeight + spacing) + 30);
    
    // Inventory title
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('무기', inventoryX, inventoryY - 20);
    
    // Render weapon slots
    weapons.forEach((weapon, index) => {
      const slotX = inventoryX;
      const slotY = inventoryY + index * (slotHeight + spacing);
      
      // Weapon slot background
      ctx.fillStyle = '#333333';
      ctx.fillRect(slotX, slotY, slotWidth, slotHeight);
      
      // Weapon slot border
      ctx.strokeStyle = '#666666';
      ctx.lineWidth = 2;
      ctx.strokeRect(slotX, slotY, slotWidth, slotHeight);
      
      // Weapon icon/placeholder
      ctx.fillStyle = '#4682B4'; // Blue for weapons
      ctx.fillRect(slotX + 5, slotY + 5, slotWidth - 10, slotHeight - 10);
      
      // Weapon level indicator
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(weapon.getLevel().toString(), slotX + slotWidth / 2, slotY + slotHeight - 5);
      
      // Weapon name
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px "Courier New", monospace';
      ctx.textAlign = 'left';
      const weaponName = weapon.getName();
      const shortName = weaponName.length > 8 ? weaponName.substring(0, 6) + '..' : weaponName;
      ctx.fillText(shortName, slotX + slotWidth + 5, slotY + 15);
      
      // Weapon level text
      ctx.fillStyle = '#CCCCCC';
      ctx.font = '10px "Courier New", monospace';
      ctx.fillText(`Lv.${weapon.getLevel()}`, slotX + slotWidth + 5, slotY + 30);
      
      // Weapon type indicator
      ctx.fillStyle = '#AAAAAA';
      ctx.font = '10px "Courier New", monospace';
      ctx.fillText(`무기`, slotX + slotWidth + 5, slotY + 45);
    });
  }

  private renderEndScreen(ctx: CanvasRenderingContext2D): void {
    const canvas = this.game.getCanvas();
    
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (this.gameWon) {
      ctx.fillStyle = '#00FF00';
      ctx.font = 'bold 48px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('튜토리얼 완료!', canvas.width / 2, canvas.height / 2 - 50);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '24px "Courier New", monospace';
      ctx.fillText('보스를 성공적으로 처치했습니다!', canvas.width / 2, canvas.height / 2);
      ctx.fillText('이제 무한 모드에 도전해보세요!', canvas.width / 2, canvas.height / 2 + 40);
    } else {
      ctx.fillStyle = '#FF4444';
      ctx.font = 'bold 48px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('튜토리얼 실패', canvas.width / 2, canvas.height / 2 - 50);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '24px "Courier New", monospace';
      if (this.player.getHealth() <= 0) {
        ctx.fillText('플레이어가 사망했습니다', canvas.width / 2, canvas.height / 2);
      } else {
        ctx.fillText('시간이 초과되었습니다', canvas.width / 2, canvas.height / 2);
      }
      ctx.fillText('다시 시도해보세요!', canvas.width / 2, canvas.height / 2 + 40);
    }
    
    ctx.fillStyle = '#AAAAAA';
    ctx.font = '18px "Courier New", monospace';
    ctx.fillText('메인 메뉴로 돌아갑니다...', canvas.width / 2, canvas.height / 2 + 100);
  }

  destroy(): void {
    console.log('TutorialScene destroyed');
  }
}