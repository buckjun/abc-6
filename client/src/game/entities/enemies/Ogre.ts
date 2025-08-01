import { EnemyBase } from './EnemyBase';

export class Ogre extends EnemyBase {
  private attackTimer: number = 0;
  private attackInterval: number = 3.0;
  private isAttacking: boolean = false;
  private attackDuration: number = 0.5;

  constructor(x: number, y: number) {
    super(x, y, 500, 30); // health: 500, speed: 30 (very slow)
    this.color = '#8B4513';
    this.damage = 35;
    this.experienceValue = 100;
    this.width = 48;
    this.height = 52;
  }

  init(): void {
    console.log('Ogre (Elite) spawned');
  }

  update(deltaTime: number, playerX: number, playerY: number): void {
    if (!this.alive) return;

    this.attackTimer += deltaTime;

    // Attack animation
    if (this.isAttacking) {
      this.attackDuration -= deltaTime;
      if (this.attackDuration <= 0) {
        this.isAttacking = false;
        this.attackDuration = 0.5;
      }
    }

    // Check if close enough to attack
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= 60 && this.attackTimer >= this.attackInterval) {
      this.performAttack();
      this.attackTimer = 0;
    } else {
      // Move towards player slowly
      this.moveTowardsPlayer(deltaTime, playerX, playerY);
    }
  }

  private performAttack(): void {
    this.isAttacking = true;
    console.log('Ogre performs heavy attack!');
    // Attack damage is handled by collision detection in GameScene
  }

  getDamage(): number {
    return this.isAttacking ? this.damage : this.damage * 0.3; // Less damage when not attacking
  }

  shouldDropTreasure(): boolean {
    return Math.random() < 0.3; // 30% chance to drop treasure
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.alive) return;

    // Attack effect
    if (this.isAttacking) {
      ctx.strokeStyle = '#FF4444';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width + 10, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw ogre body
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.width/2, this.y - this.height/2 + 8, this.width, this.height - 16);

    // Draw ogre head
    ctx.fillStyle = '#CD853F';
    ctx.beginPath();
    ctx.arc(this.x, this.y - this.height/2 + 12, 16, 0, Math.PI * 2);
    ctx.fill();

    // Draw tusks
    ctx.fillStyle = '#FFFAF0';
    ctx.beginPath();
    ctx.moveTo(this.x - 8, this.y - this.height/2 + 16);
    ctx.lineTo(this.x - 6, this.y - this.height/2 + 8);
    ctx.lineTo(this.x - 4, this.y - this.height/2 + 16);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(this.x + 4, this.y - this.height/2 + 16);
    ctx.lineTo(this.x + 6, this.y - this.height/2 + 8);
    ctx.lineTo(this.x + 8, this.y - this.height/2 + 16);
    ctx.fill();

    // Draw eyes
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(this.x - 6, this.y - this.height/2 + 8, 2, 0, Math.PI * 2);
    ctx.arc(this.x + 6, this.y - this.height/2 + 8, 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw club
    ctx.fillStyle = '#654321';
    ctx.fillRect(this.x + this.width/2 - 4, this.y - this.height/2 - 8, 8, this.height + 8);
    
    // Club head
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.arc(this.x + this.width/2, this.y - this.height/2 - 4, 8, 0, Math.PI * 2);
    ctx.fill();

    // Elite indicator (crown)
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(this.x, this.y - this.height/2 - 4, 6, 0, Math.PI * 2);
    ctx.fill();

    // Call parent for health bar and effects
    super.render(ctx);
  }
}