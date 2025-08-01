import type { Enemy } from './Enemy';

export class Bullet {
  private x: number;
  private y: number;
  private width: number = 10;  // Increased from 6 for better hit rate
  private height: number = 10; // Increased from 6 for better hit rate
  private speed: number = 400; // pixels per second
  private directionX: number;
  private directionY: number;
  private alive: boolean = true;
  private id: string;
  private damage: number = 10;
  private color: string = '#FFD700';
  private penetrating: boolean = false;
  private homing: boolean = false;
  private target: Enemy | null = null;

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

    // Homing behavior
    if (this.homing && this.target && this.target.isAlive()) {
      const targetPos = this.target.getPosition();
      const dx = targetPos.x - this.x;
      const dy = targetPos.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0) {
        this.directionX = dx / distance;
        this.directionY = dy / distance;
      }
    }

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

    // Bullet body
    ctx.fillStyle = this.color;
    ctx.fillRect(
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );

    // Bullet border for visibility
    ctx.strokeStyle = this.getBorderColor();
    ctx.lineWidth = 1;
    ctx.strokeRect(
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );

    // Add a small glow effect
    ctx.fillStyle = this.getGlowColor();
    ctx.fillRect(
      this.x - 2,
      this.y - 2,
      4,
      4
    );
  }

  private getBorderColor(): string {
    switch (this.color) {
      case '#4A90E2': return '#2171B5'; // Magic bolt
      case '#C0C0C0': return '#808080'; // Shuriken
      case '#FFD700': return '#FFA500'; // Golden blade
      default: return '#FFA500';
    }
  }

  private getGlowColor(): string {
    switch (this.color) {
      case '#4A90E2': return '#87CEEB'; // Light blue
      case '#C0C0C0': return '#FFFFFF'; // White
      case '#FFD700': return '#FFFF00'; // Bright yellow
      default: return '#FFFF00';
    }
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

  // Weapon system methods
  setDamage(damage: number): void {
    this.damage = damage;
  }

  getDamage(): number {
    return this.damage;
  }

  setSpeed(speed: number): void {
    this.speed = speed;
  }

  setColor(color: string): void {
    this.color = color;
  }

  getColor(): string {
    return this.color;
  }

  setPenetrating(penetrating: boolean): void {
    this.penetrating = penetrating;
  }

  isPenetrating(): boolean {
    return this.penetrating;
  }

  setHoming(homing: boolean): void {
    this.homing = homing;
  }

  isHoming(): boolean {
    return this.homing;
  }

  setTarget(target: Enemy): void {
    this.target = target;
  }

  getTarget(): Enemy | null {
    return this.target;
  }
}