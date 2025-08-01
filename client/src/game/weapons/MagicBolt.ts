import { WeaponBase, WeaponStats } from './WeaponBase';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';
import { GameUtils } from '../utils/GameUtils';

export class MagicBolt extends WeaponBase {
  constructor() {
    const initialStats: WeaponStats = {
      damage: 10,
      cooldown: 1.2,
      projectileCount: 1
    };
    super('마력 구체', initialStats);
    this.canEvolve = true;
  }

  protected fire(player: Player, enemies: Enemy[], mouseX: number, mouseY: number): Bullet[] {
    const playerPos = player.getPosition();
    const bullets: Bullet[] = [];
    
    // Calculate direction to mouse
    const dx = mouseX - playerPos.x;
    const dy = mouseY - playerPos.y;
    const baseAngle = Math.atan2(dy, dx);
    
    // Create multiple projectiles if upgraded
    for (let i = 0; i < this.stats.projectileCount; i++) {
      let angle = baseAngle;
      
      // Spread projectiles if multiple
      if (this.stats.projectileCount > 1) {
        const spread = (Math.PI / 6) * (this.stats.projectileCount - 1); // 30 degrees total spread
        angle = baseAngle - spread/2 + (spread / (this.stats.projectileCount - 1)) * i;
      }
      
      // Calculate target position far in the direction
      const targetX = playerPos.x + Math.cos(angle) * 1000;
      const targetY = playerPos.y + Math.sin(angle) * 1000;
      
      const bullet = new Bullet(playerPos.x, playerPos.y, targetX, targetY);
      bullet.setDamage(this.stats.damage);
      bullet.setSpeed(300);
      bullet.setColor('#4A90E2'); // Blue magic color
      bullet.setPenetrating(true); // Magic bolts penetrate
      bullet.init();
      
      bullets.push(bullet);
    }
    
    console.log(`Magic Bolt fired: ${this.stats.projectileCount} projectiles, damage: ${this.stats.damage}`);
    return bullets;
  }

  protected updateStats(): void {
    switch (this.level) {
      case 2:
        this.stats.damage = 15;
        break;
      case 3:
        this.stats.projectileCount = 2;
        break;
      case 4:
        this.stats.cooldown = 1.0;
        break;
      case 5:
        this.stats.damage = 25;
        break;
      case 6:
        this.stats.projectileCount = 3;
        break;
      case 7:
        this.stats.cooldown = 0.8;
        break;
      case 8:
        this.stats.damage = 40;
        break;
    }
  }

  protected onEvolve(): void {
    this.name = '연쇄 번개';
    this.stats.damage = 60;
    // Chain lightning effect will be handled in collision detection
    console.log('Magic Bolt evolved to Chain Lightning!');
  }

  public checkEvolution(passiveItems: string[]): boolean {
    return super.checkEvolution(passiveItems) && passiveItems.includes('증폭의 수정');
  }
}