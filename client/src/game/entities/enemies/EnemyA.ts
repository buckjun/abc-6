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

    ctx.save();
    
    // Swift demon with flame effects
    const flickerTime = Date.now() * 0.01;
    const flicker = Math.sin(flickerTime) * 0.2 + 0.8;
    
    // Shadow/trail effect for speed
    ctx.globalAlpha = 0.3;
    for (let i = 1; i <= 3; i++) {
      ctx.fillStyle = `rgba(255, 68, 68, ${0.3 / i})`;
      ctx.beginPath();
      ctx.moveTo(this.x - i * 3, this.y - this.height/2);
      ctx.lineTo(this.x - this.width/2 - i * 2, this.y + this.height/2);
      ctx.lineTo(this.x + this.width/2 - i * 2, this.y + this.height/2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    
    // Main demonic body - organic shape
    ctx.fillStyle = `rgba(255, 68, 68, ${flicker})`;
    ctx.beginPath();
    // Asymmetric demonic form
    ctx.moveTo(this.x, this.y - this.height/2); // Head
    ctx.quadraticCurveTo(this.x + 8, this.y - 6, this.x + 6, this.y + 4); // Right shoulder/arm
    ctx.quadraticCurveTo(this.x + 4, this.y + 8, this.x, this.y + this.height/2); // Right leg
    ctx.quadraticCurveTo(this.x - 4, this.y + 8, this.x - 6, this.y + 4); // Left leg
    ctx.quadraticCurveTo(this.x - 8, this.y - 6, this.x, this.y - this.height/2); // Left shoulder/arm
    ctx.fill();
    
    // Demonic horns
    ctx.fillStyle = '#8B0000';
    ctx.beginPath();
    ctx.moveTo(this.x - 4, this.y - this.height/2);
    ctx.lineTo(this.x - 6, this.y - this.height/2 - 6);
    ctx.lineTo(this.x - 2, this.y - this.height/2 - 3);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(this.x + 4, this.y - this.height/2);
    ctx.lineTo(this.x + 6, this.y - this.height/2 - 6);
    ctx.lineTo(this.x + 2, this.y - this.height/2 - 3);
    ctx.fill();
    
    // Glowing eyes
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    ctx.arc(this.x - 3, this.y - 4, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x + 3, this.y - 4, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Flame aura
    ctx.strokeStyle = `rgba(255, 165, 0, ${flicker * 0.5})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width/2 + 2, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();

    // Call parent for health bar and effects
    super.render(ctx);
  }
}