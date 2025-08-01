import { WeaponBase, WeaponStats } from './WeaponBase';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';
import { GameUtils } from '../utils/GameUtils';

export class MagicBolt extends WeaponBase {
  constructor() {
    const initialStats: WeaponStats = {
      damage: 20,
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
    
    // Create projectiles in perpendicular formation
    for (let i = 0; i < this.stats.projectileCount; i++) {
      let startX = playerPos.x;
      let startY = playerPos.y;
      
      // For multiple projectiles, offset perpendicular to firing direction
      if (this.stats.projectileCount > 1) {
        // Calculate perpendicular vector
        const perpX = -dy; // Perpendicular to direction vector
        const perpY = dx;
        const perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
        
        if (perpLength > 0) {
          const perpNormX = perpX / perpLength;
          const perpNormY = perpY / perpLength;
          
          // Offset position: center projectiles around player
          const spacing = 40; // Distance between projectiles
          const offset = (i - (this.stats.projectileCount - 1) / 2) * spacing;
          
          startX = playerPos.x + perpNormX * offset;
          startY = playerPos.y + perpNormY * offset;
        }
      }
      
      // Calculate target position in original direction
      const targetX = startX + dx * 10; // Use normalized direction
      const targetY = startY + dy * 10;
      
      const bullet = new Bullet(startX, startY, targetX, targetY);
      bullet.setDamage(this.stats.damage);
      bullet.setSpeed(300);
      bullet.setColor('#4A90E2'); // Blue magic color
      bullet.setPenetrating(false); // Magic bolts do not penetrate (synchronized with user request)
      bullet.init();
      
      bullets.push(bullet);
    }
    
    console.log(`Magic Bolt fired: ${this.stats.projectileCount} projectiles, damage: ${this.stats.damage}`);
    return bullets;
  }

  protected updateStats(): void {
    switch (this.level) {
      case 2:
        this.stats.damage = 25;
        this.stats.projectileCount = 2;
        break;
      case 3:
        this.stats.damage = 30;
        this.stats.projectileCount = 3;
        break;
      case 4:
        this.stats.damage = 35;
        this.stats.projectileCount = 4;
        this.stats.cooldown = 1.0;
        break;
      case 5:
        this.stats.damage = 40;
        this.stats.projectileCount = 5;
        break;
      case 6:
        this.stats.damage = 45;
        this.stats.projectileCount = 6;
        this.stats.cooldown = 0.9;
        break;
      case 7:
        this.stats.damage = 50;
        this.stats.projectileCount = 7;
        this.stats.cooldown = 0.8;
        break;
      case 8:
        this.stats.damage = 60;
        this.stats.projectileCount = 8;
        this.stats.cooldown = 0.7;
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