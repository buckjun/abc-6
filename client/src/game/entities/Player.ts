export class Player {
  private x: number;
  private y: number;
  private width: number = 32;
  private height: number = 32;
  private speed: number = 200; // pixels per second
  private health: number = 100;
  private maxHealth: number = 100;
  private moveX: number = 0;
  private moveY: number = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  init(): void {
    this.health = this.maxHealth;
    console.log('Player initialized at', this.x, this.y);
  }

  update(deltaTime: number): void {
    // Update position based on movement
    this.x += this.moveX * this.speed * deltaTime;
    this.y += this.moveY * this.speed * deltaTime;

    // Keep player within canvas bounds
    this.x = Math.max(this.width / 2, Math.min(1280 - this.width / 2, this.x));
    this.y = Math.max(this.height / 2, Math.min(720 - this.height / 2, this.y));
  }

  setMovement(moveX: number, moveY: number): void {
    this.moveX = moveX;
    this.moveY = moveY;
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    
    // Health-based energy aura
    const healthPercent = this.health / this.maxHealth;
    const pulseTime = Date.now() * 0.005;
    const pulseIntensity = Math.sin(pulseTime) * 0.3 + 0.7;
    
    // Outer energy ring
    ctx.beginPath();
    ctx.arc(this.x, this.y, 20, 0, Math.PI * 2);
    ctx.strokeStyle = healthPercent > 0.6 ? `rgba(0, 255, 255, ${pulseIntensity * 0.4})` : 
                      healthPercent > 0.3 ? `rgba(255, 255, 0, ${pulseIntensity * 0.4})` : 
                                           `rgba(255, 0, 0, ${pulseIntensity * 0.4})`;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Main crystalline body with faceted look
    ctx.fillStyle = '#00FFFF'; // Bright cyan crystal
    ctx.beginPath();
    // Create diamond/crystal shape
    ctx.moveTo(this.x, this.y - 12); // Top
    ctx.lineTo(this.x + 8, this.y - 4); // Top right
    ctx.lineTo(this.x + 6, this.y + 8); // Bottom right
    ctx.lineTo(this.x, this.y + 12); // Bottom
    ctx.lineTo(this.x - 6, this.y + 8); // Bottom left
    ctx.lineTo(this.x - 8, this.y - 4); // Top left
    ctx.closePath();
    ctx.fill();
    
    // Crystal facet highlights
    ctx.fillStyle = '#FFFFFF';
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(this.x - 2, this.y - 8);
    ctx.lineTo(this.x + 4, this.y - 6);
    ctx.lineTo(this.x + 2, this.y + 2);
    ctx.lineTo(this.x - 4, this.y);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    
    // Inner core glow
    ctx.fillStyle = healthPercent > 0.6 ? '#40E0D0' : 
                    healthPercent > 0.3 ? '#FFD700' : '#FF6347';
    ctx.beginPath();
    ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Energy particles around player
    for (let i = 0; i < 4; i++) {
      const angle = (pulseTime + i * Math.PI / 2) % (Math.PI * 2);
      const particleX = this.x + Math.cos(angle) * 15;
      const particleY = this.y + Math.sin(angle) * 15;
      
      ctx.fillStyle = `rgba(0, 255, 255, ${pulseIntensity * 0.6})`;
      ctx.beginPath();
      ctx.arc(particleX, particleY, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Movement trail effect
    if (this.moveX !== 0 || this.moveY !== 0) {
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.x - this.moveX * 20, this.y - this.moveY * 20);
      ctx.lineTo(this.x, this.y);
      ctx.stroke();
    }
    
    ctx.restore();
  }

  takeDamage(damage: number): void {
    this.health = Math.max(0, this.health - damage);
    console.log(`Player took ${damage} damage. Health: ${this.health}`);
  }

  heal(amount: number): void {
    this.health = Math.min(100, this.health + amount); // Max health is 100
    console.log(`Player healed ${amount}. Health: ${this.health}`);
  }

  getHealth(): number {
    return this.health;
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      width: this.width,
      height: this.height
    };
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
}
