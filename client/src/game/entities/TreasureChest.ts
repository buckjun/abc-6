export class TreasureChest {
  private x: number;
  private y: number;
  private width: number = 32;
  private height: number = 24;
  private alive: boolean = true;
  private rewards: string[] = [];
  private animationTime: number = 0;
  private opened: boolean = false;

  constructor(x: number, y: number, rewardCount: number = 3) {
    this.x = x;
    this.y = y;
    
    // Generate random rewards
    const possibleRewards = [
      '체력 회복',
      '경험치 자석',
      '공격력 증가',
      '이동속도 증가',
      '무기 강화',
      '패시브 아이템'
    ];
    
    for (let i = 0; i < rewardCount; i++) {
      const randomReward = possibleRewards[Math.floor(Math.random() * possibleRewards.length)];
      this.rewards.push(randomReward);
    }
  }

  init(): void {
    console.log('Treasure chest spawned with rewards:', this.rewards);
  }

  update(deltaTime: number): void {
    if (!this.alive) return;
    this.animationTime += deltaTime;
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.alive) return;

    // Floating animation
    const floatOffset = Math.sin(this.animationTime * 3) * 2;
    const chestY = this.y + floatOffset;

    // Glow effect
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#FFD700';

    // Draw chest base
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(this.x - this.width/2, chestY - this.height/2, this.width, this.height);

    // Draw chest lid
    if (!this.opened) {
      ctx.fillStyle = '#A0522D';
      ctx.fillRect(this.x - this.width/2, chestY - this.height/2, this.width, this.height/2 + 2);
    }

    // Draw gold decorations
    ctx.fillStyle = '#FFD700';
    
    // Lock
    ctx.beginPath();
    ctx.arc(this.x, chestY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Corner decorations
    ctx.fillRect(this.x - this.width/2 + 2, chestY - this.height/2 + 2, 4, 4);
    ctx.fillRect(this.x + this.width/2 - 6, chestY - this.height/2 + 2, 4, 4);
    ctx.fillRect(this.x - this.width/2 + 2, chestY + this.height/2 - 6, 4, 4);
    ctx.fillRect(this.x + this.width/2 - 6, chestY + this.height/2 - 6, 4, 4);

    // Sparkle effects
    const sparkleCount = 8;
    for (let i = 0; i < sparkleCount; i++) {
      const angle = (this.animationTime * 2 + i * Math.PI * 2 / sparkleCount) % (Math.PI * 2);
      const sparkleX = this.x + Math.cos(angle) * 25;
      const sparkleY = chestY + Math.sin(angle) * 20;
      
      ctx.fillStyle = `rgba(255, 215, 0, ${0.5 + Math.sin(this.animationTime * 4 + i) * 0.3})`;
      ctx.beginPath();
      ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowBlur = 0;
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x - this.width/2,
      y: this.y - this.height/2,
      width: this.width,
      height: this.height
    };
  }

  getRewards(): string[] {
    return this.rewards;
  }

  open(): void {
    this.opened = true;
    console.log('Treasure chest opened! Rewards granted:', this.rewards);
  }

  destroy(): void {
    this.alive = false;
  }

  isAlive(): boolean {
    return this.alive;
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
}