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

    ctx.save();
    
    // Armored golem with mechanical parts
    const breathTime = Date.now() * 0.003;
    const breathing = Math.sin(breathTime) * 2 + 2;
    
    // Steam/energy vents
    for (let i = 0; i < 3; i++) {
      const steamX = this.x - 8 + i * 8;
      const steamY = this.y - this.height/2 - 5;
      ctx.fillStyle = `rgba(135, 206, 235, ${0.3 + Math.sin(breathTime + i) * 0.2})`;
      ctx.beginPath();
      ctx.arc(steamX, steamY, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Main armored body - hexagonal tank
    ctx.fillStyle = '#4444FF';
    ctx.beginPath();
    const angles = 6;
    const radius = this.width/2 + breathing;
    for (let i = 0; i < angles; i++) {
      const angle = (i * Math.PI * 2) / angles;
      const x = this.x + Math.cos(angle) * radius;
      const y = this.y + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    
    // Armor plating details
    ctx.fillStyle = '#6666FF';
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius - 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Energy core in center
    ctx.fillStyle = '#00FFFF';
    ctx.beginPath();
    ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Mechanical joints/rivets
    ctx.fillStyle = '#888888';
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const jointX = this.x + Math.cos(angle) * (radius - 2);
      const jointY = this.y + Math.sin(angle) * (radius - 2);
      ctx.beginPath();
      ctx.arc(jointX, jointY, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Warning lights
    ctx.fillStyle = Math.sin(breathTime * 2) > 0 ? '#FF0000' : '#440000';
    ctx.beginPath();
    ctx.arc(this.x - 6, this.y - 6, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x + 6, this.y - 6, 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();

    // Call parent for health bar and effects (no enemy body drawn in parent)
    super.render(ctx);
  }
}