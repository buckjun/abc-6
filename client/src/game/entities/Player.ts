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
    // Draw player as a modern hero character
    ctx.fillStyle = '#4169E1'; // Royal blue main body
    ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
    
    // Hero armor details
    ctx.fillStyle = '#FFD700'; // Gold accents
    ctx.fillRect(this.x - this.width/2 + 4, this.y - this.height/2 + 4, this.width - 8, 4); // Top armor
    ctx.fillRect(this.x - this.width/2 + 4, this.y + this.height/2 - 8, this.width - 8, 4); // Bottom armor
    
    // Hero cape
    ctx.fillStyle = '#DC143C'; // Red cape
    ctx.fillRect(this.x - this.width/2 - 2, this.y - this.height/2 + 6, 4, this.height - 12);
    
    // Weapon indicator (sword)
    ctx.fillStyle = '#C0C0C0'; // Silver sword
    ctx.fillRect(this.x + this.width/2, this.y - 8, 2, 16);
    ctx.fillStyle = '#8B4513'; // Brown handle
    ctx.fillRect(this.x + this.width/2 - 1, this.y + 6, 4, 6);
    
    // Hero emblem
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Health indicator glow
    const healthPercent = this.health / this.maxHealth;
    if (healthPercent < 0.3) {
      ctx.shadowColor = '#FF0000';
      ctx.shadowBlur = 10;
    } else if (healthPercent < 0.6) {
      ctx.shadowColor = '#FFFF00';
      ctx.shadowBlur = 5;
    } else {
      ctx.shadowColor = '#00FF00';
      ctx.shadowBlur = 3;
    }
    
    // Redraw main body with glow
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
    ctx.shadowBlur = 0;

    // Direction indicator (small arrow)
    if (this.moveX !== 0 || this.moveY !== 0) {
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      const arrowX = this.x + this.moveX * 20;
      const arrowY = this.y + this.moveY * 20;
      ctx.arc(arrowX, arrowY, 4, 0, Math.PI * 2);
      ctx.fill();
    }
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
