import { WeaponBase } from '../weapons/WeaponBase';
import { MagicBolt } from '../weapons/MagicBolt';
import { Shuriken } from '../weapons/Shuriken';
import { SacredGround } from '../weapons/SacredGround';
import { FireBall } from '../weapons/FireBall';
import { IceArrow } from '../weapons/IceArrow';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { EnemyBase } from '../entities/enemies/EnemyBase';
import { Bullet } from '../entities/Bullet';
import { AreaEffect } from '../entities/AreaEffect';

export class WeaponManager {
  private weapons: WeaponBase[] = [];
  private passiveItems: string[] = [];
  private maxWeapons: number = 6;
  private maxPassives: number = 6;

  constructor() {
    console.log('WeaponManager initialized');
  }

  public addWeapon(weaponType: string): boolean {
    // Check if weapon already exists, if so level it up
    const existingWeapon = this.weapons.find(w => w.getName().includes(weaponType));
    if (existingWeapon && existingWeapon.canLevelUp()) {
      existingWeapon.levelUp();
      this.checkEvolution(existingWeapon);
      return true;
    }

    // Add new weapon if slot available
    if (this.weapons.length < this.maxWeapons) {
      let weapon: WeaponBase;
      
      switch (weaponType) {
        case '마력 구체':
          weapon = new MagicBolt();
          break;
        case '수리검':
          weapon = new Shuriken();
          break;
        case '신성한 영역':
          weapon = new SacredGround();
          break;
        case '화염탄':
          weapon = new FireBall();
          break;
        case '얼음 화살':
          weapon = new IceArrow();
          break;
        default:
          console.warn(`Unknown weapon type: ${weaponType}`);
          return false;
      }
      
      this.weapons.push(weapon);
      console.log(`Added weapon: ${weapon.getName()}`);
      return true;
    }
    
    return false;
  }

  public addPassiveItem(itemName: string): boolean {
    if (this.passiveItems.length < this.maxPassives && !this.passiveItems.includes(itemName)) {
      this.passiveItems.push(itemName);
      console.log(`Added passive item: ${itemName}`);
      
      // Check for possible evolutions
      this.weapons.forEach(weapon => this.checkEvolution(weapon));
      return true;
    }
    return false;
  }

  private checkEvolution(weapon: WeaponBase): void {
    if (weapon.checkEvolution(this.passiveItems)) {
      weapon.evolve();
      console.log(`Weapon evolved: ${weapon.getName()}`);
    }
  }

  public update(deltaTime: number, player: Player, enemies: (Enemy | EnemyBase)[], mouseX: number, mouseY: number): { bullets: Bullet[], areaEffects: AreaEffect[] } {
    const bullets: Bullet[] = [];
    const areaEffects: AreaEffect[] = [];

    this.weapons.forEach(weapon => {
      const projectiles = weapon.update(deltaTime, player, enemies, mouseX, mouseY);
      
      // Separate bullets from area effects
      projectiles.forEach(projectile => {
        if (projectile instanceof Bullet) {
          bullets.push(projectile);
        } else if (projectile instanceof AreaEffect) {
          areaEffects.push(projectile);
        }
      });
    });

    return { bullets, areaEffects };
  }

  public getWeapons(): WeaponBase[] {
    return this.weapons;
  }

  public getPassiveItems(): string[] {
    return this.passiveItems;
  }

  public getAvailableWeaponSlots(): number {
    return this.maxWeapons - this.weapons.length;
  }

  public getAvailablePassiveSlots(): number {
    return this.maxPassives - this.passiveItems.length;
  }

  public getWeaponNames(): string[] {
    return this.weapons.map(weapon => weapon.getName());
  }

  public getWeaponLevel(weaponName: string): number {
    const weapon = this.weapons.find(w => w.getName() === weaponName);
    return weapon ? weapon.getLevel() : 0;
  }

  // Get weapon upgrade options for level up
  public getUpgradeOptions(): string[] {
    const options: string[] = [];
    
    // Add existing weapons that can be upgraded
    this.weapons.forEach(weapon => {
      if (weapon.canLevelUp()) {
        options.push(weapon.getName());
      }
    });

    // Add new weapon options if slots available
    if (this.getAvailableWeaponSlots() > 0) {
      const availableWeapons = ['마력 구체', '수리검', '신성한 영역', '화염탄', '얼음 화살'];
      availableWeapons.forEach(weaponType => {
        if (!this.weapons.some(w => w.getName().includes(weaponType))) {
          options.push(weaponType);
        }
      });
    }

    // Add passive items if slots available
    if (this.getAvailablePassiveSlots() > 0) {
      const availablePassives = ['증폭의 수정', '닌자 비급', '룬 문자 비석'];
      availablePassives.forEach(passive => {
        if (!this.passiveItems.includes(passive)) {
          options.push(passive);
        }
      });
    }

    return options;
  }
}