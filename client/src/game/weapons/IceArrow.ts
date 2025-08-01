import { WeaponBase, WeaponStats } from './WeaponBase';
import { Player } from '../entities/Player';
import { EnemyBase } from '../entities/EnemyBase';
import { Bullet } from '../entities/Bullet';

export class IceArrow extends WeaponBase {
  constructor() {
    const initialStats: WeaponStats = {
      damage: 12,
      cooldown: 0.8,
      projectileCount: 1,
      range: 400
    };
    super('얼음 화살', initialStats);
    this.canEvolve = true;
  }

  protected fire(player: Player, enemies: EnemyBase[], mouseX: number, mouseY: number): Bullet[] {
    const playerPos = player.getPosition();
    
    // Find closest enemy
    let closestEnemy: EnemyBase | null = null;
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
    
    // Create ice arrow projectile
    const targetPos = closestEnemy.getPosition();
    
    const bullet = new Bullet(
      playerPos.x,
      playerPos.y,
      targetPos.x,
      targetPos.y,
      this.stats.damage,
      400 // Fast arrow
    );
    
    bullet.setColor('#87CEEB'); // Sky blue ice arrow
    bullet.setPenetrating(true); // Ice arrows pierce through enemies
    
    console.log(`Ice Arrow fired with damage: ${this.stats.damage}`);
    
    return [bullet];
  }

  protected updateStats(): void {
    switch (this.level) {
      case 2:
        this.stats.damage = 18;
        break;
      case 3:
        this.stats.cooldown = 0.6;
        break;
      case 4:
        this.stats.damage = 25;
        this.stats.range = 450;
        break;
      case 5:
        this.stats.projectileCount = 2;
        break;
      case 6:
        this.stats.damage = 32;
        break;
      case 7:
        this.stats.cooldown = 0.5;
        this.stats.range = 500;
        break;
      case 8:
        this.stats.damage = 40;
        this.stats.projectileCount = 3;
        break;
    }
  }

  protected onEvolve(): void {
    this.name = '빙하의 창';
    this.stats.damage = 70;
    this.stats.projectileCount = 4;
    this.stats.range = 600;
    this.stats.cooldown = 0.4;
    
    console.log('Ice Arrow evolved to Glacier Spear!');
  }

  public checkEvolution(passiveItems: string[]): boolean {
    return super.checkEvolution(passiveItems) && passiveItems.includes('룬 문자 비석');
  }
}