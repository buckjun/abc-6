import { WeaponBase, WeaponStats } from './WeaponBase';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';

export class ChainLightning extends WeaponBase {
  constructor() {
    const initialStats: WeaponStats = {
      damage: 20,
      cooldown: 1.5,
      projectileCount: 1,
      range: 200, // Chain range
      penetration: 3 // How many enemies it can chain to
    };
    super('연쇄 번개', initialStats);
    this.canEvolve = true;
  }

  protected fire(player: Player, enemies: Enemy[], mouseX: number, mouseY: number): Bullet[] {
    const playerPos = player.getPosition();
    
    // Find closest enemy
    let closestEnemy: Enemy | null = null;
    let closestDistance = Infinity;
    
    enemies.forEach(enemy => {
      if (!enemy.isAlive()) return;
      
      const enemyPos = enemy.getPosition();
      const distance = Math.sqrt(
        Math.pow(enemyPos.x - playerPos.x, 2) + 
        Math.pow(enemyPos.y - playerPos.y, 2)
      );
      
      if (distance < closestDistance && distance <= this.stats.range!) {
        closestDistance = distance;
        closestEnemy = enemy;
      }
    });
    
    if (!closestEnemy) return [];
    
    // Create chain lightning bullet
    const closestPos = closestEnemy.getPosition();
    const dx = closestPos.x - playerPos.x;
    const dy = closestPos.y - playerPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const bullet = new Bullet(
      playerPos.x,
      playerPos.y,
      dx / distance, // Normalized direction
      dy / distance,
      this.stats.damage,
      400 // Speed
    );
    
    bullet.setColor('#9400D3'); // Purple for chain lightning
    bullet.setChainLightning(true, this.stats.penetration || 3);
    bullet.setPenetrating(true);
    
    console.log(`Chain Lightning fired with damage: ${this.stats.damage}, chains: ${this.stats.penetration}`);
    
    return [bullet];
  }

  protected updateStats(): void {
    switch (this.level) {
      case 2:
        this.stats.damage = 30;
        break;
      case 3:
        this.stats.penetration = 4; // More chain targets
        break;
      case 4:
        this.stats.cooldown = 1.2;
        break;
      case 5:
        this.stats.damage = 45;
        this.stats.range = 250;
        break;
      case 6:
        this.stats.penetration = 5;
        break;
      case 7:
        this.stats.cooldown = 1.0;
        break;
      case 8:
        this.stats.damage = 70;
        this.stats.range = 300;
        break;
    }
  }

  protected onEvolve(): void {
    this.name = '천둥의 군주';
    this.stats.damage = 120;
    this.stats.penetration = 8; // Chain to many enemies
    this.stats.range = 400;
    this.stats.cooldown = 0.8;
    
    console.log('Chain Lightning evolved to Thunder Lord!');
  }

  public checkEvolution(passiveItems: string[]): boolean {
    return super.checkEvolution(passiveItems) && passiveItems.includes('전기 전도체');
  }
}