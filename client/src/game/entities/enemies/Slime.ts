import { EnemyBase } from './EnemyBase';

export class Slime extends EnemyBase {
  constructor(x: number, y: number) {
    super(x, y, 10, 50); // health: 10, speed: 50
    this.color = '#00AA00';
    this.damage = 8;
    this.experienceValue = 5;
    this.width = 35;  // Increased from 28 for better hit rate
    this.height = 35; // Increased from 28 for better hit rate
  }

  init(): void {
    console.log('Slime spawned');
  }

  update(deltaTime: number, playerX: number, playerY: number): void {
    if (!this.alive) return;

    // Simple direct movement towards player
    this.moveTowardsPlayer(deltaTime, playerX, playerY);
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.alive) return;

    // Draw slime with rounded corners for organic look
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.roundRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height, 8);
    ctx.fill();

    // Add shine effect
    ctx.fillStyle = '#66FF66';
    ctx.beginPath();
    ctx.ellipse(this.x - 6, this.y - 6, 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Call parent for health bar and effects
    super.render(ctx);
  }
}