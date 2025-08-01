import { Player } from './Player';

export class Enemy {
  private x: number;
  private y: number;
  private width: number = 24;
  private height: number = 24;
  private speed: number = 50; // pixels per second
  private baseSpeed: number = 50;
  private health: number = 1;
  private maxHealth: number = 1;
  private alive: boolean = true;
  private color: string;
  private slowEffect: { multiplier: number; duration: number } | null = null;

  constructor(x: number, y: number, health: number = 1) {
    this.x = x;
    this.y = y;
    this.health = health;
    this.maxHealth = health;
    this.baseSpeed = 50;
    this.speed = this.baseSpeed;
    
    // Random enemy color variation
    const colors = ['#8B4513', '#654321', '#A0522D'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  init(): void {
    this.alive = true;
    console.log('Enemy spawned at', this.x, this.y);
  }

  update(deltaTime: number, player: Player): void {
    if (!this.alive) return;

    // Update slow effect
    if (this.slowEffect) {
      this.slowEffect.duration -= deltaTime;
      if (this.slowEffect.duration <= 0) {
        this.slowEffect = null;
        this.speed = this.baseSpeed;
      }
    }

    // Calculate current speed with slow effect
    const currentSpeed = this.slowEffect ? this.baseSpeed * this.slowEffect.multiplier : this.baseSpeed;
    this.speed = currentSpeed;

    // Move towards player
    const playerPos = player.getPosition();
    const dx = playerPos.x - this.x;
    const dy = playerPos.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      // Normalize direction and apply speed
      const dirX = dx / distance;
      const dirY = dy / distance;
      
      this.x += dirX * this.speed * deltaTime;
      this.y += dirY * this.speed * deltaTime;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.alive) return;

    // Enemy body
    ctx.fillStyle = this.color;
    ctx.fillRect(
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );

    // Enemy border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );

    // Simple "eye" dots
    ctx.fillStyle = '#DC143C';
    ctx.fillRect(this.x - 6, this.y - 4, 3, 3);
    ctx.fillRect(this.x + 3, this.y - 4, 3, 3);

    // Health bar if damaged
    if (this.health < this.maxHealth) {
      const barWidth = this.width;
      const barHeight = 4;
      const barX = this.x - barWidth / 2;
      const barY = this.y - this.height / 2 - 8;

      // Background
      ctx.fillStyle = '#800000';
      ctx.fillRect(barX, barY, barWidth, barHeight);

      // Health
      const healthPercent = this.health / this.maxHealth;
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    }

    // Slow effect indicator
    if (this.slowEffect) {
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#87CEEB';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width / 2 + 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  takeDamage(damage: number): void {
    this.health -= damage;
    if (this.health <= 0) {
      this.alive = false;
    }
  }

  destroy(): void {
    this.alive = false;
  }

  isAlive(): boolean {
    return this.alive;
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      width: this.width,
      height: this.height
    };
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  applySlow(multiplier: number, duration: number): void {
    this.slowEffect = { multiplier, duration };
    console.log(`Enemy slowed by ${(1 - multiplier) * 100}% for ${duration}s`);
  }

  getHealth(): number {
    return this.health;
  }

  getMaxHealth(): number {
    return this.maxHealth;
  }
}
