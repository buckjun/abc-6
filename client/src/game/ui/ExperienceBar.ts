export class ExperienceBar {
  private x: number = 20;
  private y: number = 20;
  private width: number = 300;
  private height: number = 20;
  private currentExp: number = 0;
  private expToNext: number = 100;
  private level: number = 1;

  constructor() {}

  update(currentExp: number, expToNext: number, level: number): void {
    this.currentExp = currentExp;
    this.expToNext = expToNext;
    this.level = level;
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Border
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // Experience fill
    const expPercentage = this.currentExp / this.expToNext;
    const fillWidth = (this.width - 4) * expPercentage;
    
    // Gradient fill
    const gradient = ctx.createLinearGradient(this.x + 2, this.y + 2, this.x + 2 + fillWidth, this.y + 2);
    gradient.addColorStop(0, '#00FF00');
    gradient.addColorStop(0.5, '#66FF66');
    gradient.addColorStop(1, '#00CC00');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(this.x + 2, this.y + 2, fillWidth, this.height - 4);

    // Level text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Level ${this.level}`, this.x, this.y - 5);

    // Experience text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.currentExp} / ${this.expToNext}`, this.x + this.width / 2, this.y + this.height / 2 + 4);

    // Next level text
    ctx.fillStyle = '#CCCCCC';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`Next: Lv${this.level + 1}`, this.x + this.width, this.y - 5);
  }

  // Animate level up effect
  renderLevelUpEffect(ctx: CanvasRenderingContext2D, animationTime: number): void {
    const alpha = Math.sin(animationTime * 10) * 0.5 + 0.5;
    
    // Glowing border effect
    ctx.save();
    ctx.shadowBlur = 20;
    ctx.shadowColor = `rgba(255, 215, 0, ${alpha})`;
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 4;
    ctx.strokeRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
    ctx.restore();

    // Sparkle effects
    for (let i = 0; i < 8; i++) {
      const sparkleX = this.x + (this.width / 8) * i + 20;
      const sparkleY = this.y + 10 + Math.sin(animationTime * 8 + i) * 5;
      
      ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
      ctx.beginPath();
      ctx.arc(sparkleX, sparkleY, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}