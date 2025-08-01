import { WeaponBase, WeaponStats } from './WeaponBase';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';

export class InfiniteBlade extends WeaponBase {
  constructor() {
    const initialStats: WeaponStats = {
      damage: 8,
      cooldown: 0.4,
      projectileCount: 1,
      range: 140
    };
    super('무한의 칼날', initialStats);
    this.canEvolve = true;
  }

  protected fire(player: Player, enemies: Enemy[], mouseX: number, mouseY: number): Bullet[] {
    const playerPos = player.getPosition();
    
    // Find closest enemy within range
    let closestEnemy: any = null;
    let closestDistance = Infinity;
    
    const allEnemies = [...enemies];
    allEnemies.forEach(enemy => {
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
    
    // Create fast blade projectile
    const targetPos = closestEnemy.getPosition();
    
    const bullet = new Bullet(
      playerPos.x,
      playerPos.y,
      targetPos.x,
      targetPos.y,
      this.stats.damage,
      800
    );
    
    bullet.setColor('#C0C0C0'); // Silver blade
    
    console.log(`Infinite Blade fired with damage: ${this.stats.damage}`);
    
    return [bullet];
  }

  protected updateStats(): void {
    switch (this.level) {
      case 2:
        this.stats.damage = 12;
        break;
      case 3:
        this.stats.cooldown = 0.3;
        break;
      case 4:
        this.stats.damage = 16;
        this.stats.range = 160;
        break;
      case 5:
        this.stats.cooldown = 0.25;
        break;
      case 6:
        this.stats.damage = 20;
        break;
      case 7:
        this.stats.range = 180;
        break;
      case 8:
        this.stats.damage = 25;
        this.stats.cooldown = 0.2;
        break;
    }
  }

  protected onEvolve(): void {
    this.name = '천검난무';
    this.stats.damage = 40;
    this.stats.projectileCount = 2;
    this.stats.range = 220;
    this.stats.cooldown = 0.15;
    
    console.log('Infinite Blade evolved to Thousand Sword Dance!');
  }

  public checkEvolution(passiveItems: string[]): boolean {
    return super.checkEvolution(passiveItems) && passiveItems.includes('닌자 비급');
  }
}