import type { Player } from '../entities/Player';
import type { Enemy } from '../entities/Enemy';

export interface WeaponStats {
  damage: number;
  cooldown: number;
  projectileCount: number;
  range?: number;
  radius?: number;
  duration?: number;
}

export abstract class WeaponBase {
  protected level: number = 1;
  protected cooldownTimer: number = 0;
  protected stats: WeaponStats;
  protected name: string;
  protected maxLevel: number = 8;
  protected canEvolve: boolean = false;
  protected evolved: boolean = false;

  constructor(name: string, initialStats: WeaponStats) {
    this.name = name;
    this.stats = { ...initialStats };
  }

  public update(deltaTime: number, player: Player, enemies: Enemy[], mouseX: number, mouseY: number): any[] {
    this.cooldownTimer -= deltaTime;
    
    if (this.cooldownTimer <= 0) {
      const projectiles = this.fire(player, enemies, mouseX, mouseY);
      this.cooldownTimer = this.stats.cooldown;
      return projectiles;
    }
    
    return [];
  }

  protected abstract fire(player: Player, enemies: Enemy[], mouseX: number, mouseY: number): any[];

  public levelUp(): boolean {
    if (this.level >= this.maxLevel) return false;
    
    this.level++;
    this.updateStats();
    console.log(`${this.name} leveled up to ${this.level}`);
    return true;
  }

  protected abstract updateStats(): void;

  public canLevelUp(): boolean {
    return this.level < this.maxLevel;
  }

  public getLevel(): number {
    return this.level;
  }

  public getName(): string {
    return this.name;
  }

  public getStats(): WeaponStats {
    return { ...this.stats };
  }

  public checkEvolution(passiveItems: string[]): boolean {
    return this.canEvolve && this.level >= this.maxLevel && !this.evolved;
  }

  public evolve(): void {
    if (this.checkEvolution([])) {
      this.evolved = true;
      this.onEvolve();
    }
  }

  protected abstract onEvolve(): void;

  public isEvolved(): boolean {
    return this.evolved;
  }
}