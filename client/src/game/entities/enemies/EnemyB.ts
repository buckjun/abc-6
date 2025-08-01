import { EnemyBase } from './EnemyBase';

export class EnemyB extends EnemyBase {
  constructor(x: number, y: number) {
    super(x, y, 50, 60); // High health, low speed
    this.color = '#4444FF';
    this.damage = 12;
    this.experienceValue = 15;
    this.width = 32;
    this.height = 32;
  }

  init(): void {
    console.log('Enemy B spawned - Tanky but slow');
  }

  update(deltaTime: number, playerX: number, playerY: number): void {
    if (!this.alive) return;

    // Slow, steady movement towards player
    this.moveTowardsPlayer(deltaTime, playerX, playerY);
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.alive) return;

    // Draw B enemy as a thick square (tanky look)
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);

    // Add armor-like border
    ctx.strokeStyle = '#6666FF';
    ctx.lineWidth = 3;
    ctx.strokeRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);

    // Inner detail for armor look
    ctx.strokeStyle = '#8888FF';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x - this.width/2 + 4, this.y - this.height/2 + 4, this.width - 8, this.height - 8);

    // Label
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('B', this.x, this.y + 5);

    // Call parent for health bar and effects
    super.render(ctx);
  }
}