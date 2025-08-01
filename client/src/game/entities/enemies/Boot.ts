import { EnemyBase } from './EnemyBase';
import { Bullet } from '../Bullet';

export class Boot extends EnemyBase {
  private attackTimer: number = 0;
  private attackInterval: number = 2.5;
  private isCharging: boolean = false;
  private chargeDuration: number = 1.0;
  private chargeTimer: number = 0;
  private originalSpeed: number;
  private phase: number = 1; // Boss phases
  private patternTimer: number = 0;
  private projectiles: Bullet[] = [];

  constructor(x: number, y: number) {
    super(x, y, 150, 40); // High health, medium speed
    this.color = '#8B0000';
    this.damage = 25;
    this.experienceValue = 50;
    this.width = 48;
    this.height = 48;
    this.originalSpeed = this.speed;
  }

  init(): void {
    console.log('BOSS BOOT spawned - Defeat it to win!');
  }

  update(deltaTime: number, playerX: number, playerY: number): void {
    if (!this.alive) return;

    this.attackTimer += deltaTime;
    this.patternTimer += deltaTime;

    // Change phases based on health
    if (this.health <= this.maxHealth * 0.5 && this.phase === 1) {
      this.phase = 2;
      this.attackInterval = 1.8; // Faster attacks
      console.log('Boot entered Phase 2 - More aggressive!');
    }

    // Pattern 1: Charging attack (every 4 seconds)
    if (this.patternTimer >= 4.0 && !this.isCharging) {
      this.startCharge();
      this.patternTimer = 0;
    }

    // Handle charging behavior
    if (this.isCharging) {
      this.chargeTimer += deltaTime;
      this.speed = this.originalSpeed * 3; // Triple speed during charge
      
      if (this.chargeTimer >= this.chargeDuration) {
        this.isCharging = false;
        this.chargeTimer = 0;
        this.speed = this.originalSpeed;
      }
    }

    // Pattern 2: Projectile attack
    if (this.attackTimer >= this.attackInterval) {
      this.shootProjectile(playerX, playerY);
      this.attackTimer = 0;
    }

    // Movement pattern
    if (!this.isCharging) {
      // Circular movement around player in phase 2
      if (this.phase === 2) {
        this.circularMovement(deltaTime, playerX, playerY);
      } else {
        // Direct movement in phase 1
        this.moveTowardsPlayer(deltaTime, playerX, playerY);
      }
    } else {
      // Direct charge towards player
      this.moveTowardsPlayer(deltaTime, playerX, playerY);
    }

    // Update projectiles
    this.projectiles.forEach(projectile => projectile.update(deltaTime));
    this.projectiles = this.projectiles.filter(projectile => projectile.isAlive());
  }

  private startCharge(): void {
    this.isCharging = true;
    this.chargeTimer = 0;
    console.log('Boot is charging!');
  }

  private shootProjectile(playerX: number, playerY: number): void {
    // Shoot multiple projectiles in phase 2
    const projectileCount = this.phase === 2 ? 3 : 1;
    
    for (let i = 0; i < projectileCount; i++) {
      const angle = Math.atan2(playerY - this.y, playerX - this.x);
      const spread = this.phase === 2 ? (i - 1) * 0.3 : 0; // Spread in phase 2
      
      const projectile = new Bullet(
        this.x, this.y,
        Math.cos(angle + spread), Math.sin(angle + spread),
        200, 15, false, '#FF0000'
      );
      
      this.projectiles.push(projectile);
    }
    
    console.log(`Boot fired ${projectileCount} projectile(s)`);
  }

  private circularMovement(deltaTime: number, playerX: number, playerY: number): void {
    const distance = 100; // Desired distance from player
    const circleSpeed = 2; // Speed of circular movement
    
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const currentDistance = Math.sqrt(dx * dx + dy * dy);
    
    if (currentDistance > distance + 20) {
      // Move closer to player
      this.moveTowardsPlayer(deltaTime, playerX, playerY);
    } else if (currentDistance < distance - 20) {
      // Move away from player
      const moveSpeed = this.speed * deltaTime;
      this.x -= (dx / currentDistance) * moveSpeed;
      this.y -= (dy / currentDistance) * moveSpeed;
    } else {
      // Circle around player
      const angle = Math.atan2(dy, dx) + circleSpeed * deltaTime;
      this.x = playerX + Math.cos(angle) * distance;
      this.y = playerY + Math.sin(angle) * distance;
    }
  }

  public getProjectiles(): Bullet[] {
    return this.projectiles;
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.alive) return;

    // Phase-based appearance
    const phaseColor = this.phase === 2 ? '#FF0000' : this.color;
    
    // Charging effect
    if (this.isCharging) {
      ctx.shadowColor = '#FF0000';
      ctx.shadowBlur = 20;
    }

    // Draw Boot as a large intimidating shape
    ctx.fillStyle = phaseColor;
    
    // Main body - boot shape
    ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height/2);
    ctx.fillRect(this.x - this.width/3, this.y, this.width/3 * 2, this.height/2);
    
    // Boot details
    ctx.fillStyle = '#444444';
    ctx.fillRect(this.x - this.width/2 + 4, this.y - this.height/2 + 4, this.width - 8, this.height/2 - 8);
    
    // Spikes/studs
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 3; i++) {
      const studX = this.x - this.width/2 + 8 + i * 12;
      const studY = this.y - this.height/4;
      ctx.fillRect(studX, studY, 4, 4);
    }

    ctx.shadowBlur = 0;

    // Boss label
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('BOOT', this.x, this.y + this.height/2 + 20);

    // Phase indicator
    if (this.phase === 2) {
      ctx.fillStyle = '#FF0000';
      ctx.font = 'bold 10px "Courier New", monospace';
      ctx.fillText('ENRAGED', this.x, this.y + this.height/2 + 35);
    }

    // Render projectiles
    this.projectiles.forEach(projectile => projectile.render(ctx));

    // Call parent for health bar and effects
    super.render(ctx);
    
    // Boss health bar (larger)
    const barWidth = 80;
    const barHeight = 8;
    const barX = this.x - barWidth/2;
    const barY = this.y - this.height/2 - 20;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
    
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    const healthPercent = this.health / this.maxHealth;
    const healthColor = this.phase === 2 ? '#FF4444' : '#00FF00';
    ctx.fillStyle = healthColor;
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    
    // Health text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '10px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.health}/${this.maxHealth}`, this.x, barY - 5);
  }
}