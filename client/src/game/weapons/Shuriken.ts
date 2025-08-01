import { WeaponBase, WeaponStats } from './WeaponBase';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';
import { GameUtils } from '../utils/GameUtils';

export class Shuriken extends WeaponBase {
  constructor() {
    const initialStats: WeaponStats = {
      damage: 8,
      cooldown: 1.5,
      projectileCount: 1
    };
    super('수리검', initialStats);
    this.canEvolve = true;
  }

  protected fire(player: Player, enemies: Enemy[], mouseX: number, mouseY: number): Bullet[] {
    if (this.evolved) {
      return this.fireInfiniteBlades(player, enemies);
    }
    return this.fireNormalShurikens(player, enemies);
  }

  private findClosestEnemies(playerPos: { x: number; y: number }, enemies: Enemy[], count: number): Enemy[] {
    const enemiesWithDistance = enemies.map(enemy => {
      const enemyPos = enemy.getPosition();
      const distance = GameUtils.distance(playerPos.x, playerPos.y, enemyPos.x, enemyPos.y);
      return { enemy, distance };
    });
    
    enemiesWithDistance.sort((a, b) => a.distance - b.distance);
    return enemiesWithDistance.slice(0, count).map(item => item.enemy);
  }

  protected updateStats(): void {
    switch (this.level) {
      case 2:
        this.stats.damage = 12;
        break;
      case 3:
        this.stats.projectileCount = 2;
        break;
      case 4:
        this.stats.cooldown = 1.2;
        break;
      case 5:
        this.stats.damage = 18;
        break;
      case 6:
        this.stats.projectileCount = 3;
        break;
      case 7:
        this.stats.cooldown = 1.0;
        break;
      case 8:
        this.stats.damage = 28;
        break;
    }
  }

  protected onEvolve(): void {
    this.name = '무한의 칼날';
    this.stats.cooldown = 0.1;
    this.stats.projectileCount = 8;
    this.stats.damage = 35;
    console.log('Shuriken evolved to Infinite Blades!');
  }

  public checkEvolution(passiveItems: string[]): boolean {
    return super.checkEvolution(passiveItems) && passiveItems.includes('닌자 비급');
  }

  private fireNormalShurikens(player: Player, enemies: Enemy[]): Bullet[] {
    if (enemies.length === 0) return [];
    
    const playerPos = player.getPosition();
    const bullets: Bullet[] = [];
    
    const targetEnemies = this.findClosestEnemies(playerPos, enemies, this.stats.projectileCount);
    
    targetEnemies.forEach(enemy => {
      const enemyPos = enemy.getPosition();
      const bullet = new Bullet(playerPos.x, playerPos.y, enemyPos.x, enemyPos.y);
      bullet.setDamage(this.stats.damage);
      bullet.setSpeed(400);
      bullet.setColor('#C0C0C0');
      bullet.setHoming(true);
      bullet.setTarget(enemy);
      bullet.init();
      
      bullets.push(bullet);
    });
    
    return bullets;
  }

  private fireInfiniteBlades(player: Player, enemies: Enemy[]): Bullet[] {
    const playerPos = player.getPosition();
    const bullets: Bullet[] = [];
    
    // Create random blades across the screen
    for (let i = 0; i < this.stats.projectileCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 100 + Math.random() * 300;
      
      const targetX = playerPos.x + Math.cos(angle) * distance + (Math.random() - 0.5) * 400;
      const targetY = playerPos.y + Math.sin(angle) * distance + (Math.random() - 0.5) * 400;
      
      const bullet = new Bullet(playerPos.x, playerPos.y, targetX, targetY);
      bullet.setDamage(this.stats.damage);
      bullet.setSpeed(500);
      bullet.setColor('#FFD700'); // Golden blades
      bullet.init();
      
      bullets.push(bullet);
    }
    
    return bullets;
  }
}