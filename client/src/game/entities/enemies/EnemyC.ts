import { EnemyBase } from './EnemyBase';

export class EnemyC extends EnemyBase {
  constructor(x: number, y: number) {
    super(x, y, 25, 85); // Medium health, medium speed, high damage
    this.color = '#44FF44';
    this.damage = 20; // High damage for dangerous contact
    this.experienceValue = 12;
    this.width = 28;
    this.height = 28;
  }

  init(): void {
    console.log('Enemy C spawned - Dangerous attacker');
  }

  update(deltaTime: number, playerX: number, playerY: number): void {
    if (!this.alive) return;

    // Medium speed movement with slight unpredictability
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      const moveSpeed = this.speed * this.slowEffect * deltaTime;
      
      // Add slight random movement for unpredictability
      const randomOffset = Math.sin(Date.now() * 0.01) * 0.2;
      
      this.x += (dx / distance) * moveSpeed + randomOffset;
      this.y += (dy / distance) * moveSpeed + randomOffset;
    }

    // Recover from slow effect gradually
    this.slowEffect = Math.min(1, this.slowEffect + deltaTime * 0.5);
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.alive) return;

    // Draw C enemy as a diamond (aggressive look)
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - this.height/2); // Top
    ctx.lineTo(this.x + this.width/2, this.y); // Right
    ctx.lineTo(this.x, this.y + this.height/2); // Bottom
    ctx.lineTo(this.x - this.width/2, this.y); // Left
    ctx.closePath();
    ctx.fill();

    // Add spikes for dangerous look
    ctx.fillStyle = '#66FF66';
    const spikeSize = 4;
    ctx.fillRect(this.x - spikeSize/2, this.y - this.height/2 - spikeSize, spikeSize, spikeSize); // Top spike
    ctx.fillRect(this.x + this.width/2, this.y - spikeSize/2, spikeSize, spikeSize); // Right spike
    ctx.fillRect(this.x - spikeSize/2, this.y + this.height/2, spikeSize, spikeSize); // Bottom spike
    ctx.fillRect(this.x - this.width/2 - spikeSize, this.y - spikeSize/2, spikeSize, spikeSize); // Left spike

    // Pulsing effect for danger
    const pulse = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
    ctx.strokeStyle = `rgba(255, 0, 0, ${pulse})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('C', this.x, this.y + 4);

    // Call parent for health bar and effects
    super.render(ctx);
  }
}