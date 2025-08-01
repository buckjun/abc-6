export class Player {
  private x: number;
  private y: number;
  private width: number = 32;
  private height: number = 32;
  private speed: number = 200; // pixels per second
  private health: number = 100;
  private maxHealth: number = 100;
  private moveX: number = 0;
  private moveY: number = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  init(): void {
    this.health = this.maxHealth;
    console.log('Player initialized at', this.x, this.y);
  }

  update(deltaTime: number): void {
    // Update position based on movement
    this.x += this.moveX * this.speed * deltaTime;
    this.y += this.moveY * this.speed * deltaTime;

    // Keep player within canvas bounds
    this.x = Math.max(this.width / 2, Math.min(1280 - this.width / 2, this.x));
    this.y = Math.max(this.height / 2, Math.min(720 - this.height / 2, this.y));
  }

  setMovement(moveX: number, moveY: number): void {
    this.moveX = moveX;
    this.moveY = moveY;
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Player body
    ctx.fillStyle = '#DC143C';
    ctx.fillRect(
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );

    // Player border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );

    // Direction indicator (small arrow)
    if (this.moveX !== 0 || this.moveY !== 0) {
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      const arrowX = this.x + this.moveX * 20;
      const arrowY = this.y + this.moveY * 20;
      ctx.arc(arrowX, arrowY, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  takeDamage(damage: number): void {
    this.health = Math.max(0, this.health - damage);
    console.log(`Player took ${damage} damage. Health: ${this.health}`);
  }

  getHealth(): number {
    return this.health;
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
