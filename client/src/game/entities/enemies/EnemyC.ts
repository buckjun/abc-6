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

    ctx.save();
    
    // Bio-mechanical spider/scorpion hybrid
    const agitationTime = Date.now() * 0.008;
    const agitation = Math.sin(agitationTime) * 3;
    
    // Danger field (electrical discharge)
    ctx.strokeStyle = `rgba(68, 255, 68, ${Math.abs(Math.sin(agitationTime * 2)) * 0.6})`;
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const innerRadius = this.width/2 + 5;
      const outerRadius = innerRadius + 8;
      ctx.beginPath();
      ctx.moveTo(
        this.x + Math.cos(angle) * innerRadius,
        this.y + Math.sin(angle) * innerRadius
      );
      ctx.lineTo(
        this.x + Math.cos(angle) * outerRadius + agitation,
        this.y + Math.sin(angle) * outerRadius + agitation
      );
      ctx.stroke();
    }
    
    // Multiple organic tentacles/legs
    ctx.strokeStyle = '#44FF44';
    ctx.lineWidth = 3;
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const tentacleLength = 12;
      const wiggle = Math.sin(agitationTime + i) * 3;
      
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.quadraticCurveTo(
        this.x + Math.cos(angle) * (tentacleLength/2) + wiggle,
        this.y + Math.sin(angle) * (tentacleLength/2) + wiggle,
        this.x + Math.cos(angle) * tentacleLength,
        this.y + Math.sin(angle) * tentacleLength
      );
      ctx.stroke();
      
      // Tentacle tips
      ctx.fillStyle = '#66FF66';
      ctx.beginPath();
      ctx.arc(
        this.x + Math.cos(angle) * tentacleLength,
        this.y + Math.sin(angle) * tentacleLength,
        2, 0, Math.PI * 2
      );
      ctx.fill();
    }
    
    // Central bio-mass body
    ctx.fillStyle = '#44FF44';
    ctx.beginPath();
    // Organic blob shape
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const radius = this.width/2 + Math.sin(agitationTime + i * 0.5) * 2;
      const x = this.x + Math.cos(angle) * radius;
      const y = this.y + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    
    // Toxic core
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Multiple eyes
    ctx.fillStyle = '#FF0000';
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI * 2) / 4;
      const eyeX = this.x + Math.cos(angle) * 6;
      const eyeY = this.y + Math.sin(angle) * 6;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();

    // Call parent for health bar and effects (no enemy body drawn in parent)  
    super.render(ctx);
  }
}