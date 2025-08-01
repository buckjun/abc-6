import { EnemyBase } from './EnemyBase';

export class Reaper extends EnemyBase {
  private attackTimer: number = 0;
  private attackInterval: number = 4.0;
  private scytheAttackPhase: number = 0; // 0: normal, 1: charging, 2: sweeping
  private scytheChargeTime: number = 1.5;
  private playerLevel: number;
  private screenWidth: number;
  private screenHeight: number;

  constructor(x: number, y: number, playerLevel: number, screenWidth: number, screenHeight: number) {
    super(x, y, playerLevel * 100, 40); // health scales with player level
    this.color = '#1C1C1C';
    this.damage = 50;
    this.experienceValue = 500;
    this.width = 64;
    this.height = 80;
    this.playerLevel = playerLevel;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
  }

  init(): void {
    console.log('REAPER has awakened! The 30-minute boss appears!');
  }

  update(deltaTime: number, playerX: number, playerY: number): void {
    if (!this.alive) return;

    this.attackTimer += deltaTime;

    if (this.scytheAttackPhase === 1) {
      // Charging scythe attack
      this.scytheChargeTime -= deltaTime;
      if (this.scytheChargeTime <= 0) {
        this.scytheAttackPhase = 2;
        this.scytheChargeTime = 1.0; // Sweep duration
      }
    } else if (this.scytheAttackPhase === 2) {
      // Sweeping scythe attack
      this.scytheChargeTime -= deltaTime;
      if (this.scytheChargeTime <= 0) {
        this.scytheAttackPhase = 0;
        this.scytheChargeTime = 1.5;
      }
    } else {
      // Normal movement and attack timing
      if (this.attackTimer >= this.attackInterval) {
        this.initiateScytheAttack();
        this.attackTimer = 0;
      } else {
        // Slow movement towards player
        this.moveTowardsPlayer(deltaTime, playerX, playerY);
      }
    }
  }

  private initiateScytheAttack(): void {
    this.scytheAttackPhase = 1;
    this.scytheChargeTime = 1.5;
    console.log('Reaper charges massive scythe attack!');
  }

  isPerformingScytheAttack(): boolean {
    return this.scytheAttackPhase === 2;
  }

  getScytheAttackArea(): { x: number; y: number; width: number; height: number } | null {
    if (this.scytheAttackPhase !== 2) return null;

    // Scythe sweeps across entire screen width
    return {
      x: 0,
      y: this.y - 40,
      width: this.screenWidth,
      height: 80
    };
  }

  getDamage(): number {
    return this.scytheAttackPhase === 2 ? this.damage * 2 : this.damage;
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.alive) return;

    // Draw warning for scythe attack
    if (this.scytheAttackPhase === 1) {
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 10]);
      ctx.strokeRect(0, this.y - 40, this.screenWidth, 80);
      ctx.setLineDash([]);
      
      // Warning text
      ctx.fillStyle = '#FF0000';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('SCYTHE ATTACK INCOMING!', this.screenWidth / 2, this.y - 50);
    }

    // Draw scythe sweep effect
    if (this.scytheAttackPhase === 2) {
      const gradient = ctx.createLinearGradient(0, this.y - 40, this.screenWidth, this.y + 40);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, this.y - 40, this.screenWidth, 80);
    }

    // Draw reaper body (floating)
    const floatOffset = Math.sin(Date.now() * 0.003) * 8;
    const bodyY = this.y + floatOffset;

    // Draw shadow beneath
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + this.height/2, this.width/2, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw dark robe
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.ellipse(this.x, bodyY + 10, this.width/2, this.height/2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw hood/head
    ctx.fillStyle = '#0A0A0A';
    ctx.beginPath();
    ctx.arc(this.x, bodyY - this.height/2 + 20, 20, 0, Math.PI * 2);
    ctx.fill();

    // Draw glowing red eyes
    ctx.fillStyle = '#FF0000';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#FF0000';
    ctx.beginPath();
    ctx.arc(this.x - 8, bodyY - this.height/2 + 16, 3, 0, Math.PI * 2);
    ctx.arc(this.x + 8, bodyY - this.height/2 + 16, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw scythe
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.x + 20, bodyY + this.height/2);
    ctx.lineTo(this.x + 15, bodyY - this.height/2 - 20);
    ctx.stroke();

    // Scythe blade
    ctx.fillStyle = '#C0C0C0';
    ctx.beginPath();
    ctx.arc(this.x + 25, bodyY - this.height/2 - 15, 15, Math.PI * 0.2, Math.PI * 1.2);
    ctx.fill();

    // Charge effect
    if (this.scytheAttackPhase === 1) {
      ctx.strokeStyle = '#FF4444';
      ctx.lineWidth = 3;
      const pulseSize = this.width + Math.sin(Date.now() * 0.01) * 20;
      ctx.beginPath();
      ctx.arc(this.x, bodyY, pulseSize, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Boss health bar (larger)
    const barWidth = 200;
    const barHeight = 12;
    const healthPercent = this.health / this.maxHealth;

    // Background
    ctx.fillStyle = '#000000';
    ctx.fillRect(this.x - barWidth/2, bodyY - this.height/2 - 40, barWidth, barHeight);

    // Health
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(this.x - barWidth/2, bodyY - this.height/2 - 40, barWidth * healthPercent, barHeight);

    // Boss name
    ctx.fillStyle = '#FF0000';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('REAPER', this.x, bodyY - this.height/2 - 45);

    // Call parent for additional effects
    super.render(ctx);
  }
}