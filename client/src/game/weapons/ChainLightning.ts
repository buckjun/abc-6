import { WeaponBase, WeaponStats } from './WeaponBase';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';

export class ChainLightning extends WeaponBase {
  constructor() {
    super('연쇄 번개');
    this.stats = {
      damage: 15,
      cooldown: 2.0,
      projectileCount: 1,
      range: 180
    };
    this.maxLevel = 8;
    this.evolutionRequirement = '룬 문자 비석';
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
    
    // Create lightning bullet targeting closest enemy
    const targetPos = closestEnemy.getPosition();
    
    const bullet = new Bullet(
      playerPos.x,
      playerPos.y,
      targetPos.x,
      targetPos.y,
      this.stats.damage,
      500
    );
    
    bullet.setColor('#9400D3'); // Purple lightning
    bullet.setSize(8, 8);
    
    console.log(`Chain Lightning fired with damage: ${this.stats.damage}`);
    
    return [bullet];
  }

  public levelUp(): void {
    if (this.level < this.maxLevel) {
      this.level++;
      this.stats.damage += 4;
      this.stats.cooldown = Math.max(1.2, this.stats.cooldown - 0.1);
      this.stats.range! += 25;
      
      console.log(`Chain Lightning leveled up! Level: ${this.level}, Damage: ${this.stats.damage}`);
    }
  }

  public evolve(): void {
    if (!this.evolved) {
      this.evolved = true;
      this.name = '천둥의 심판';
      this.stats.damage += 20;
      this.stats.range! += 80;
      this.stats.cooldown = Math.max(0.8, this.stats.cooldown - 0.4);
      
      console.log(`Chain Lightning evolved to Thunder Judgment!`);
    }
  }
}