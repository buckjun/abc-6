export abstract class EnemyBase {
  protected x: number;
  protected y: number;
  protected width: number = 32;
  protected height: number = 32;
  protected maxHealth: number;
  protected health: number;
  protected speed: number;
  protected alive: boolean = true;
  protected color: string = '#FF0000';
  protected damage: number = 10;
  protected experienceValue: number = 10;
  protected slowEffect: number = 1; // 1 = normal speed, 0.5 = half speed

  constructor(x: number, y: number, health: number, speed: number) {
    this.x = x;
    this.y = y;
    this.maxHealth = health;
    this.health = health;
    this.speed = speed;
  }

  abstract init(): void;
  abstract update(deltaTime: number, playerX: number, playerY: number): void;

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.alive) return;

    // Draw enemy body
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);

    // Draw health bar
    const barWidth = this.width;
    const barHeight = 6;
    const healthPercent = this.health / this.maxHealth;

    // Background
    ctx.fillStyle = '#000000';
    ctx.fillRect(this.x - barWidth/2, this.y - this.height/2 - 12, barWidth, barHeight);

    // Health
    ctx.fillStyle = healthPercent > 0.5 ? '#00FF00' : healthPercent > 0.25 ? '#FFFF00' : '#FF0000';
    ctx.fillRect(this.x - barWidth/2, this.y - this.height/2 - 12, barWidth * healthPercent, barHeight);

    // Slow effect indicator
    if (this.slowEffect < 1) {
      ctx.strokeStyle = '#0066FF';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x - this.width/2 - 2, this.y - this.height/2 - 2, this.width + 4, this.height + 4);
    }
  }

  takeDamage(damage: number): void {
    this.health -= damage;
    if (this.health <= 0) {
      this.destroy();
    }
  }

  applySlow(slowFactor: number, duration: number): void {
    this.slowEffect = Math.min(this.slowEffect, slowFactor);
    // Slow effect will naturally recover over time in update
  }

  destroy(): void {
    this.alive = false;
  }

  isAlive(): boolean {
    return this.alive;
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x - this.width/2,
      y: this.y - this.height/2,
      width: this.width,
      height: this.height
    };
  }

  getDamage(): number {
    return this.damage;
  }

  getExperienceValue(): number {
    return this.experienceValue;
  }

  protected moveTowardsPlayer(deltaTime: number, playerX: number, playerY: number): void {
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      const moveSpeed = this.speed * this.slowEffect * deltaTime;
      this.x += (dx / distance) * moveSpeed;
      this.y += (dy / distance) * moveSpeed;
    }

    // Recover from slow effect gradually
    this.slowEffect = Math.min(1, this.slowEffect + deltaTime * 0.5);
  }
}