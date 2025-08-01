import { EnemyBase } from './EnemyBase';
import { Bullet } from '../Bullet';

export class GoblinShaman extends EnemyBase {
  private shootTimer: number = 0;
  private shootInterval: number = 2.0; // Shoot every 2 seconds
  private optimalDistance: number = 150; // Preferred distance from player
  private lastPlayerX: number = 0;
  private lastPlayerY: number = 0;
  private projectiles: Bullet[] = [];

  constructor(x: number, y: number) {
    super(x, y, 50, 45); // health: 50 (increased from 30), speed: 45
    this.color = '#228B22';
    this.damage = 12;
    this.experienceValue = 75; // Very high value gem
    this.width = 28;
    this.height = 32;
  }

  init(): void {
    console.log('Goblin Shaman spawned');
  }

  update(deltaTime: number, playerX: number, playerY: number): void {
    if (!this.alive) return;

    this.lastPlayerX = playerX;
    this.lastPlayerY = playerY;
    this.shootTimer += deltaTime;

    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const distanceToPlayer = Math.sqrt(dx * dx + dy * dy);

    // Maintain optimal distance from player
    if (distanceToPlayer < this.optimalDistance - 20) {
      // Too close, move away
      const moveSpeed = this.speed * this.slowEffect * deltaTime;
      this.x -= (dx / distanceToPlayer) * moveSpeed;
      this.y -= (dy / distanceToPlayer) * moveSpeed;
    } else if (distanceToPlayer > this.optimalDistance + 50) {
      // Too far, move closer
      const moveSpeed = this.speed * 0.7 * this.slowEffect * deltaTime;
      this.x += (dx / distanceToPlayer) * moveSpeed;
      this.y += (dy / distanceToPlayer) * moveSpeed;
    }

    // Shoot at player
    if (this.shootTimer >= this.shootInterval && distanceToPlayer <= 200) {
      this.shootAtPlayer();
      this.shootTimer = 0;
    }

    // Update projectiles
    this.projectiles.forEach(projectile => {
      projectile.update(deltaTime);
    });

    // Remove dead projectiles
    this.projectiles = this.projectiles.filter(p => p.isAlive());

    // Recover from slow effect gradually
    this.slowEffect = Math.min(1, this.slowEffect + deltaTime * 0.5);
  }

  private shootAtPlayer(): void {
    const dx = this.lastPlayerX - this.x;
    const dy = this.lastPlayerY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      // Create magic projectile
      const projectile = new Bullet(this.x, this.y, this.lastPlayerX, this.lastPlayerY);
      projectile.setColor('#9932CC'); // Dark orchid
      projectile.setSpeed(120);
      projectile.setDamage(12);
      projectile.init();
      this.projectiles.push(projectile);
      
      console.log('Goblin Shaman fired projectile');
    }
  }

  getProjectiles(): Bullet[] {
    return this.projectiles;
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.alive) return;

    // Draw robe
    ctx.fillStyle = '#4B0082';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + 4, this.width/2, this.height/2 - 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw body
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.width/3, this.y - this.height/2 + 4, this.width/1.5, this.height/2);

    // Draw head
    ctx.fillStyle = '#32CD32';
    ctx.beginPath();
    ctx.arc(this.x, this.y - this.height/2 + 8, 8, 0, Math.PI * 2);
    ctx.fill();

    // Draw pointed ears
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.moveTo(this.x - 12, this.y - this.height/2 + 8);
    ctx.lineTo(this.x - 8, this.y - this.height/2 + 4);
    ctx.lineTo(this.x - 8, this.y - this.height/2 + 12);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(this.x + 12, this.y - this.height/2 + 8);
    ctx.lineTo(this.x + 8, this.y - this.height/2 + 4);
    ctx.lineTo(this.x + 8, this.y - this.height/2 + 12);
    ctx.fill();

    // Draw staff
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.x + 12, this.y + this.height/2 - 4);
    ctx.lineTo(this.x + 8, this.y - this.height/2 - 4);
    ctx.stroke();

    // Draw staff orb
    ctx.fillStyle = '#FF69B4';
    ctx.beginPath();
    ctx.arc(this.x + 8, this.y - this.height/2 - 4, 4, 0, Math.PI * 2);
    ctx.fill();

    // Draw magical aura when shooting
    if (this.shootTimer > this.shootInterval - 0.3) {
      ctx.strokeStyle = '#9932CC';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width/2 + 5, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Render projectiles
    this.projectiles.forEach(projectile => {
      projectile.render(ctx);
    });

    // Call parent for health bar and effects
    super.render(ctx);
  }
}