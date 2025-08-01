import { EnemyBase } from './EnemyBase';

export class Bat extends EnemyBase {
  private waveOffset: number;
  private waveTime: number = 0;

  constructor(x: number, y: number) {
    super(x, y, 8, 80); // health: 8, speed: 80
    this.color = '#4A0080';
    this.damage = 6;
    this.experienceValue = 8;
    this.width = 30;  // Increased from 24 for better hit rate
    this.height = 26;  // Increased from 20 for better hit rate
    this.waveOffset = Math.random() * Math.PI * 2;
  }

  init(): void {
    console.log('Bat spawned');
  }

  update(deltaTime: number, playerX: number, playerY: number): void {
    if (!this.alive) return;

    this.waveTime += deltaTime;

    // Calculate direction to player
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      // Base movement towards player
      const moveSpeed = this.speed * this.slowEffect * deltaTime;
      const baseX = (dx / distance) * moveSpeed;
      const baseY = (dy / distance) * moveSpeed;

      // Add wave motion for erratic flight pattern
      const waveIntensity = 30;
      const waveX = Math.sin(this.waveTime * 5 + this.waveOffset) * waveIntensity * deltaTime;
      const waveY = Math.cos(this.waveTime * 3 + this.waveOffset) * waveIntensity * deltaTime;

      this.x += baseX + waveX;
      this.y += baseY + waveY;
    }

    // Recover from slow effect gradually
    this.slowEffect = Math.min(1, this.slowEffect + deltaTime * 0.5);
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.alive) return;

    // Draw bat wings
    ctx.fillStyle = this.color;
    ctx.beginPath();
    // Wing flap animation
    const flapOffset = Math.sin(this.waveTime * 15) * 3;
    
    // Left wing
    ctx.ellipse(this.x - 8, this.y - flapOffset, 6, 10, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Right wing
    ctx.beginPath();
    ctx.ellipse(this.x + 8, this.y - flapOffset, 6, 10, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = '#2A0040';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, 4, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(this.x - 2, this.y - 2, 1, 0, Math.PI * 2);
    ctx.arc(this.x + 2, this.y - 2, 1, 0, Math.PI * 2);
    ctx.fill();

    // Call parent for health bar and effects
    super.render(ctx);
  }
}