import { WeaponBase, WeaponStats } from './WeaponBase';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { AreaEffect } from '../entities/AreaEffect';

export class SacredGround extends WeaponBase {
  private activeEffect: AreaEffect | null = null;

  constructor() {
    const initialStats: WeaponStats = {
      damage: 3, // Reduced damage for better balance (enemies take multiple hits)
      cooldown: 2.0, // Increased cooldown from 0.33 to 2.0 seconds for lower hit frequency
      projectileCount: 1,
      radius: 80,
      duration: Infinity // Permanent around player
    };
    super('신성한 영역', initialStats);
    this.canEvolve = true;
  }

  protected fire(player: Player, enemies: Enemy[], mouseX: number, mouseY: number): AreaEffect[] {
    const playerPos = player.getPosition();
    
    if (!this.activeEffect || !this.activeEffect.isActive()) {
      this.activeEffect = new AreaEffect(
        playerPos.x,
        playerPos.y,
        this.stats.radius!,
        this.stats.damage,
        this.stats.duration!,
        this.evolved
      );
      
      this.activeEffect.setFollowTarget(player); // Follow player
      this.activeEffect.init();
      
      console.log(`Sacred Ground activated with radius: ${this.stats.radius}, DPS: ${this.stats.damage}`);
      return [this.activeEffect];
    }
    
    // Update existing effect position and stats
    this.activeEffect.updateStats(this.stats.radius!, this.stats.damage, this.evolved);
    return [];
  }

  protected updateStats(): void {
    switch (this.level) {
      case 2:
        this.stats.radius = 100;
        break;
      case 3:
        this.stats.damage = 4; // Gradual damage increase
        break;
      case 4:
        this.stats.radius = 120;
        break;
      case 5:
        this.stats.damage = 5;
        break;
      case 6:
        this.stats.radius = 150;
        break;
      case 7:
        this.stats.damage = 7;
        break;
      case 8:
        this.stats.damage = 10; // Reduced from 25 to 10
        this.stats.radius = 180;
        break;
    }
    
    // Update active effect if it exists
    if (this.activeEffect) {
      this.activeEffect.updateStats(this.stats.radius!, this.stats.damage, this.evolved);
    }
  }

  protected onEvolve(): void {
    this.name = '천상의 심판';
    this.stats.damage = 35;
    this.stats.radius = 300; // Massive range increase
    
    if (this.activeEffect) {
      this.activeEffect.updateStats(this.stats.radius!, this.stats.damage, true);
    }
    
    console.log('Sacred Ground evolved to Heaven\'s Judgment!');
  }

  public checkEvolution(passiveItems: string[]): boolean {
    return super.checkEvolution(passiveItems) && passiveItems.includes('룬 문자 비석');
  }

  public getActiveEffect(): AreaEffect | null {
    return this.activeEffect;
  }
}