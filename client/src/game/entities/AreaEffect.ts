import type { Player } from './Player';
import type { Enemy } from './Enemy';
import { GameUtils } from '../utils/GameUtils';

export class AreaEffect {
  private x: number;
  private y: number;
  private radius: number;
  private damage: number;
  private duration: number;
  private timeRemaining: number;
  private active: boolean = true;
  private followTarget: Player | null = null;
  private damageTimer: number = 0;
  private damageInterval: number = 2.0; // Damage every 2 seconds (increased from 1.0)
  private evolved: boolean = false;

  constructor(x: number, y: number, radius: number, damage: number, duration: number, evolved: boolean = false) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.damage = damage;
    this.duration = duration;
    this.timeRemaining = duration;
    this.evolved = evolved;
  }

  init(): void {
    this.active = true;
    console.log(`Area effect created at (${this.x}, ${this.y}) with radius ${this.radius}`);
  }

  update(deltaTime: number): void {
    if (!this.active) return;

    // Follow target if set (for Sacred Ground following player)
    if (this.followTarget) {
      const targetPos = this.followTarget.getPosition();
      this.x = targetPos.x;
      this.y = targetPos.y;
    }

    // Update timers
    this.damageTimer += deltaTime;
    this.timeRemaining -= deltaTime;

    // Check if effect should end
    if (this.duration !== Infinity && this.timeRemaining <= 0) {
      this.active = false;
    }
  }

  // Apply damage to enemies in range
  applyDamage(enemies: Enemy[]): Enemy[] {
    if (!this.active || this.damageTimer < this.damageInterval) {
      return [];
    }

    this.damageTimer = 0; // Reset damage timer
    const damagedEnemies: Enemy[] = [];

    enemies.forEach(enemy => {
      if (!enemy.isAlive()) return;

      const enemyPos = enemy.getPosition();
      const distance = GameUtils.distance(this.x, this.y, enemyPos.x, enemyPos.y);

      if (distance <= this.radius) {
        enemy.takeDamage(this.damage);
        damagedEnemies.push(enemy);

        // Apply slow effect if evolved (Heaven's Judgment)
        if (this.evolved) {
          enemy.applySlow(0.5, 2.0); // 50% speed reduction for 2 seconds
        }
      }
    });

    if (damagedEnemies.length > 0) {
      console.log(`Area effect damaged ${damagedEnemies.length} enemies`);
    }

    return damagedEnemies;
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    // Draw outer circle
    ctx.save();
    ctx.globalAlpha = 0.3;
    
    if (this.evolved) {
      // Heaven's Judgment - golden with lightning effect
      ctx.fillStyle = '#FFD700';
      ctx.strokeStyle = '#FFA500';
    } else {
      // Sacred Ground - holy white/blue
      ctx.fillStyle = '#E6F3FF';
      ctx.strokeStyle = '#4A90E2';
    }

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.globalAlpha = 0.8;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw inner core
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = this.evolved ? '#FFF700' : '#FFFFFF';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Draw pulsing effect
    const pulseRadius = this.radius * (0.7 + 0.3 * Math.sin(Date.now() * 0.01));
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, pulseRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  setFollowTarget(target: Player): void {
    this.followTarget = target;
  }

  updateStats(radius: number, damage: number, evolved: boolean): void {
    this.radius = radius;
    this.damage = damage;
    this.evolved = evolved;
  }

  isActive(): boolean {
    return this.active;
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x - this.radius,
      y: this.y - this.radius,
      width: this.radius * 2,
      height: this.radius * 2
    };
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  destroy(): void {
    this.active = false;
  }

  isInArea(x: number, y: number): boolean {
    const distance = Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2);
    return distance <= this.radius;
  }

  getDamage(): number {
    return this.damage;
  }

  isAlive(): boolean {
    return this.active;
  }
}