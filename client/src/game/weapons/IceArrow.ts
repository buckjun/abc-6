import { WeaponBase, WeaponStats } from './WeaponBase';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { EnemyBase } from '../entities/enemies/EnemyBase';
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

  protected fire(player: Player, enemies: (Enemy | EnemyBase)[], mouseX: number, mouseY: number): Bullet[] {
    const playerPos = player.getPosition();
    const bullets: Bullet[] = [];
    
    // Create directional arrows based on level
    const directions = this.getDirections();
    
    directions.forEach(direction => {
      // Calculate target position based on direction
      const targetX = playerPos.x + direction.x * this.stats.range!;
      const targetY = playerPos.y + direction.y * this.stats.range!;
      
      const bullet = new Bullet(
        playerPos.x,
        playerPos.y,
        targetX,
        targetY,
        this.stats.damage,
        400 // Fast arrow
      );
      
      bullet.setColor('#87CEEB'); // Sky blue ice arrow
      bullet.setPenetrating(true); // Ice arrows pierce through enemies
      bullets.push(bullet);
    });
    
    console.log(`Ice Arrow fired: ${bullets.length} arrows with damage: ${this.stats.damage}`);
    
    return bullets;
  }

  private getDirections(): { x: number; y: number }[] {
    const directions: { x: number; y: number }[] = [];
    
    switch (this.level) {
      case 1:
        // Level 1: 1개 x축 오른쪽
        directions.push({ x: 1, y: 0 });
        break;
      case 2:
        // Level 2: x축 양방향
        directions.push({ x: 1, y: 0 }, { x: -1, y: 0 });
        break;
      case 3:
        // Level 3: x축 양방향 + y축 위쪽
        directions.push({ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: -1 });
        break;
      case 4:
        // Level 4: x축 양방향 + y축 양방향
        directions.push({ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 });
        break;
      case 5:
        // Level 5: 4방향 + 대각선 4방향
        directions.push(
          { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 },
          { x: 0.707, y: -0.707 }, { x: 0.707, y: 0.707 }, { x: -0.707, y: -0.707 }, { x: -0.707, y: 0.707 }
        );
        break;
      case 6:
        // Level 6: 8방향 + 추가 중간 방향
        directions.push(
          { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 },
          { x: 0.707, y: -0.707 }, { x: 0.707, y: 0.707 }, { x: -0.707, y: -0.707 }, { x: -0.707, y: 0.707 },
          { x: 0.5, y: -0.866 }, { x: 0.5, y: 0.866 }, { x: -0.5, y: -0.866 }, { x: -0.5, y: 0.866 }
        );
        break;
      case 7:
        // Level 7: 12방향
        for (let i = 0; i < 12; i++) {
          const angle = (i * Math.PI * 2) / 12;
          directions.push({ x: Math.cos(angle), y: Math.sin(angle) });
        }
        break;
      case 8:
        // Level 8: 16방향
        for (let i = 0; i < 16; i++) {
          const angle = (i * Math.PI * 2) / 16;
          directions.push({ x: Math.cos(angle), y: Math.sin(angle) });
        }
        break;
      default:
        // Evolution: 20방향
        for (let i = 0; i < 20; i++) {
          const angle = (i * Math.PI * 2) / 20;
          directions.push({ x: Math.cos(angle), y: Math.sin(angle) });
        }
        break;
    }
    
    return directions;
  }

  protected updateStats(): void {
    switch (this.level) {
      case 2:
        this.stats.damage = 15;
        break;
      case 3:
        this.stats.cooldown = 0.7;
        this.stats.damage = 18;
        break;
      case 4:
        this.stats.damage = 20;
        this.stats.range = 450;
        break;
      case 5:
        this.stats.cooldown = 0.6;
        this.stats.damage = 22;
        break;
      case 6:
        this.stats.damage = 25;
        break;
      case 7:
        this.stats.cooldown = 0.5;
        this.stats.damage = 28;
        break;
      case 8:
        this.stats.damage = 30;
        this.stats.range = 500;
        break;
    }
  }

  protected onEvolve(): void {
    this.name = '빙하의 창';
    this.stats.damage = 40;
    this.stats.range = 600;
    this.stats.cooldown = 0.4;
    
    console.log('Ice Arrow evolved to Glacier Spear!');
  }

  public checkEvolution(passiveItems: string[]): boolean {
    return super.checkEvolution(passiveItems) && passiveItems.includes('룬 문자 비석');
  }
}