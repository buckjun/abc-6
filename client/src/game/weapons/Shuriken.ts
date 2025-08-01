import { WeaponBase, WeaponStats } from './WeaponBase';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';
import { GameUtils } from '../utils/GameUtils';

export class Shuriken extends WeaponBase {
  constructor() {
    const initialStats: WeaponStats = {
      damage: 11, // 8 * 1.4 = 11.2 rounded to 11
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
        this.stats.damage = 15; // 11 * 1.4 ≈ 15
        this.stats.projectileCount = 2;
        break;
      case 3:
        this.stats.damage = 21; // 15 * 1.4 = 21
        this.stats.projectileCount = 3;
        break;
      case 4:
        this.stats.damage = 29; // 21 * 1.4 ≈ 29
        this.stats.projectileCount = 4;
        this.stats.cooldown = 1.3;
        break;
      case 5:
        this.stats.damage = 41; // 29 * 1.4 ≈ 41
        this.stats.projectileCount = 5;
        break;
      case 6:
        this.stats.damage = 57; // 41 * 1.4 ≈ 57
        this.stats.projectileCount = 6;
        this.stats.cooldown = 1.1;
        break;
      case 7:
        this.stats.damage = 80; // 57 * 1.4 = 80
        this.stats.projectileCount = 7;
        break;
      case 8:
        this.stats.damage = 112; // 80 * 1.4 = 112
        this.stats.projectileCount = 8;
        this.stats.cooldown = 1.0;
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
      bullet.setColor('#FF4500'); // Orange-red shuriken color (different from ice arrow)
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