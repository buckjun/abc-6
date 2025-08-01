import { Player } from './Player';

export class Enemy {
  private x: number;
  private y: number;
  private width: number = 24;
  private height: number = 24;
  private speed: number = 50; // pixels per second
  private health: number = 1;
  private alive: boolean = true;
  private color: string;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    
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
}
