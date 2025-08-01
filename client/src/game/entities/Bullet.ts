export class Bullet {
  private x: number;
  private y: number;
  private width: number = 6;
  private height: number = 6;
  private speed: number = 400; // pixels per second
  private directionX: number;
  private directionY: number;
  private alive: boolean = true;
  private id: string;

  constructor(x: number, y: number, targetX: number, targetY: number) {
    this.x = x;
    this.y = y;
    this.id = `bullet_${Date.now()}_${Math.random()}`;
    
    // Calculate normalized direction vector
    const dx = targetX - x;
    const dy = targetY - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      this.directionX = dx / distance;
      this.directionY = dy / distance;
    } else {
      this.directionX = 1;
      this.directionY = 0;
    }
    
    console.log(`Bullet created at (${x}, ${y}) targeting (${targetX}, ${targetY})`);
  }

  init(): void {
    this.alive = true;
  }

  update(deltaTime: number): void {
    if (!this.alive) return;

    // Move bullet in direction
    this.x += this.directionX * this.speed * deltaTime;
    this.y += this.directionY * this.speed * deltaTime;

    // Remove bullet if it goes off screen (with some buffer)
    if (this.x < -50 || this.x > 1330 || this.y < -50 || this.y > 770) {
      this.alive = false;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.alive) return;

    // Bullet body - bright yellow projectile
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );

    // Bullet border for visibility
    ctx.strokeStyle = '#FFA500';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );

    // Add a small glow effect
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(
      this.x - 2,
      this.y - 2,
      4,
      4
    );
  }

  destroy(): void {
    this.alive = false;
  }

  isAlive(): boolean {
    return this.alive;
  }

  getId(): string {
    return this.id;
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
}