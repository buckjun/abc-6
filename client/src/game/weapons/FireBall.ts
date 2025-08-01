import { WeaponBase, WeaponStats } from './WeaponBase';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { EnemyBase } from '../entities/enemies/EnemyBase';
import { Bullet } from '../entities/Bullet';

export class FireBall extends WeaponBase {
  constructor() {
    const initialStats: WeaponStats = {
      damage: 15,
      cooldown: 1.5,
      projectileCount: 1,
      range: 300
    };
    super('화염탄', initialStats);
    this.canEvolve = true;
  }

  protected fire(player: Player, enemies: (Enemy | EnemyBase)[], mouseX: number, mouseY: number): Bullet[] {
    const playerPos = player.getPosition();
    
    // Find closest enemy
    let closestEnemy: (Enemy | EnemyBase) | null = null;
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
    
    // Create fireball projectile
    const targetPos = closestEnemy.getPosition();
    
    const bullet = new Bullet(
      playerPos.x,
      playerPos.y,
      targetPos.x,
      targetPos.y,
      this.stats.damage,
      250 // Slower than magic bolt
    );
    
    bullet.setColor('#FF4500'); // Orange-red fireball
    
    console.log(`FireBall fired with damage: ${this.stats.damage}`);
    
    return [bullet];
  }

  protected updateStats(): void {
    switch (this.level) {
      case 2:
        this.stats.damage = 22;
        break;
      case 3:
        this.stats.cooldown = 1.2;
        break;
      case 4:
        this.stats.damage = 30;
        this.stats.range = 350;
        break;
      case 5:
        this.stats.cooldown = 1.0;
        break;
      case 6:
        this.stats.damage = 40;
        break;
      case 7:
        this.stats.range = 400;
        break;
      case 8:
        this.stats.damage = 50;
        this.stats.cooldown = 0.8;
        break;
    }
  }

  protected onEvolve(): void {
    this.name = '용의 화염';
    this.stats.damage = 80;
    this.stats.projectileCount = 2;
    this.stats.range = 450;
    this.stats.cooldown = 0.6;
    
    console.log('FireBall evolved to Dragon Fire!');
  }

  public checkEvolution(passiveItems: string[]): boolean {
    return super.checkEvolution(passiveItems) && passiveItems.includes('증폭의 수정');
  }
}