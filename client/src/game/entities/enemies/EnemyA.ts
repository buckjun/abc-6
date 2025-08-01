import { EnemyBase } from './EnemyBase';

export class EnemyA extends EnemyBase {
  constructor(x: number, y: number) {
    super(x, y, 15, 120); // Low health, high speed
    this.color = '#FF4444';
    this.damage = 6;
    this.experienceValue = 8;
    this.width = 24;
    this.height = 24;
  }

  init(): void {
    console.log('Enemy A spawned - Fast but fragile');
  }

  update(deltaTime: number, playerX: number, playerY: number): void {
    if (!this.alive) return;

    // Fast, direct movement towards player
    this.moveTowardsPlayer(deltaTime, playerX, playerY);
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.alive) return;

    // Draw A enemy as a triangle (fast/agile look)
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - this.height/2); // Top point
    ctx.lineTo(this.x - this.width/2, this.y + this.height/2); // Bottom left
    ctx.lineTo(this.x + this.width/2, this.y + this.height/2); // Bottom right
    ctx.closePath();
    ctx.fill();

    // Add glow effect for speed
    ctx.shadowColor = '#FF4444';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - this.height/2);
    ctx.lineTo(this.x - this.width/2, this.y + this.height/2);
    ctx.lineTo(this.x + this.width/2, this.y + this.height/2);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Label
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('A', this.x, this.y + 4);

    // Call parent for health bar and effects
    super.render(ctx);
  }
}