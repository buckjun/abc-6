export class ExperienceGem {
  private x: number;
  private y: number;
  private width: number = 12;
  private height: number = 12;
  private value: number;
  private color: string;
  private alive: boolean = true;
  private magnetRange: number = 80;
  private magnetSpeed: number = 200;
  private attractedToPlayer: boolean = false;
  private pulseTime: number = 0;

  constructor(x: number, y: number, value: number) {
    this.x = x;
    this.y = y;
    this.value = value;
    
    // Set color and size based on value
    if (value >= 50) {
      this.color = '#0066FF'; // Blue for high value
      this.width = 16;
      this.height = 16;
    } else if (value >= 25) {
      this.color = '#9932CC'; // Purple for medium value
      this.width = 14;
      this.height = 14;
    } else {
      this.color = '#FFD700'; // Yellow for low value
      this.width = 12;
      this.height = 12;
    }
  }

  init(): void {
    // Initialization logic if needed
  }

  update(deltaTime: number, playerX: number, playerY: number, hasExperienceMagnet: boolean = false): void {
    if (!this.alive) return;

    this.pulseTime += deltaTime;

    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Magnet effect - either from player proximity or experience magnet item
    const effectiveRange = hasExperienceMagnet ? this.magnetRange * 3 : this.magnetRange;
    
    if (distance <= effectiveRange) {
      this.attractedToPlayer = true;
    }

    if (this.attractedToPlayer && distance > 0) {
      const moveSpeed = this.magnetSpeed * deltaTime;
      const moveX = (dx / distance) * moveSpeed;
      const moveY = (dy / distance) * moveSpeed;
      
      this.x += moveX;
      this.y += moveY;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.alive) return;

    ctx.save();

    // Pulse effect
    const pulseScale = 1 + Math.sin(this.pulseTime * 8) * 0.1;
    ctx.translate(this.x, this.y);
    ctx.scale(pulseScale, pulseScale);

    // Outer glow
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;

    // Draw gem as diamond shape
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(0, -this.height/2);
    ctx.lineTo(this.width/2, 0);
    ctx.lineTo(0, this.height/2);
    ctx.lineTo(-this.width/2, 0);
    ctx.closePath();
    ctx.fill();

    // Inner highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.moveTo(0, -this.height/2 + 2);
    ctx.lineTo(this.width/2 - 2, 0);
    ctx.lineTo(0, this.height/2 - 2);
    ctx.lineTo(-this.width/2 + 2, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x - this.width/2,
      y: this.y - this.height/2,
      width: this.width,
      height: this.height
    };
  }

  getValue(): number {
    return this.value;
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
}