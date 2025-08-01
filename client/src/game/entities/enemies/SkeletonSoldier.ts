import { EnemyBase } from './EnemyBase';

export class SkeletonSoldier extends EnemyBase {
  private formationTargetX: number = 0;
  private formationTargetY: number = 0;
  private formationId: number;

  constructor(x: number, y: number, formationId: number = 0) {
    super(x, y, 60, 70); // health: 60 (increased from 40), speed: 70
    this.color = '#CCCCCC';
    this.damage = 15;
    this.experienceValue = 50; // High value gem
    this.width = 36;  // Increased from 30 for better hit rate
    this.height = 42;  // Increased from 36 for better hit rate
    this.formationId = formationId;
  }

  init(): void {
    console.log('Skeleton Soldier spawned');
  }

  update(deltaTime: number, playerX: number, playerY: number, skeletonGroup?: SkeletonSoldier[]): void {
    if (!this.alive) return;

    // Try to form line with other skeletons
    if (skeletonGroup && skeletonGroup.length > 1) {
      this.updateFormation(skeletonGroup, playerX, playerY);
    } else {
      // Move directly to player if alone
      this.moveTowardsPlayer(deltaTime, playerX, playerY);
    }
  }

  private updateFormation(group: SkeletonSoldier[], playerX: number, playerY: number): void {
    // Calculate center point between player and group
    let centerX = 0;
    let centerY = 0;
    const aliveSkeletons = group.filter(s => s.isAlive());
    
    aliveSkeletons.forEach(skeleton => {
      centerX += skeleton.x;
      centerY += skeleton.y;
    });
    
    if (aliveSkeletons.length > 0) {
      centerX /= aliveSkeletons.length;
      centerY /= aliveSkeletons.length;

      // Calculate direction perpendicular to player direction for line formation
      const dx = playerX - centerX;
      const dy = playerY - centerY;
      const perpX = -dy;
      const perpY = dx;
      const perpLength = Math.sqrt(perpX * perpX + perpY * perpY);

      if (perpLength > 0) {
        // Normalize perpendicular vector
        const perpNormX = perpX / perpLength;
        const perpNormY = perpY / perpLength;

        // Calculate formation position
        const spacing = 40;
        const myIndex = aliveSkeletons.indexOf(this);
        const offset = (myIndex - (aliveSkeletons.length - 1) / 2) * spacing;

        this.formationTargetX = centerX + perpNormX * offset;
        this.formationTargetY = centerY + perpNormY * offset;

        // Move towards formation position, but also towards player
        const formationWeight = 0.3;
        const playerWeight = 0.7;

        const toFormationX = this.formationTargetX - this.x;
        const toFormationY = this.formationTargetY - this.y;
        const toPlayerX = playerX - this.x;
        const toPlayerY = playerY - this.y;

        const finalTargetX = this.x + (toFormationX * formationWeight + toPlayerX * playerWeight);
        const finalTargetY = this.y + (toFormationY * formationWeight + toPlayerY * playerWeight);

        // Move towards combined target
        const dx2 = finalTargetX - this.x;
        const dy2 = finalTargetY - this.y;
        const distance = Math.sqrt(dx2 * dx2 + dy2 * dy2);

        if (distance > 0) {
          const moveSpeed = this.speed * this.slowEffect * (1/60); // deltaTime approximation
          this.x += (dx2 / distance) * moveSpeed;
          this.y += (dy2 / distance) * moveSpeed;
        }
      }
    }

    // Recover from slow effect gradually
    this.slowEffect = Math.min(1, this.slowEffect + (1/60) * 0.5);
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.alive) return;

    // Draw skeleton armor
    ctx.fillStyle = '#888888';
    ctx.fillRect(this.x - this.width/2, this.y - this.height/2 + 8, this.width, this.height - 16);

    // Draw skull
    ctx.fillStyle = '#EEEEEE';
    ctx.beginPath();
    ctx.arc(this.x, this.y - this.height/2 + 8, 10, 0, Math.PI * 2);
    ctx.fill();

    // Draw eye sockets
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(this.x - 4, this.y - this.height/2 + 6, 2, 0, Math.PI * 2);
    ctx.arc(this.x + 4, this.y - this.height/2 + 6, 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw glowing eyes
    ctx.fillStyle = '#FF3333';
    ctx.beginPath();
    ctx.arc(this.x - 4, this.y - this.height/2 + 6, 1, 0, Math.PI * 2);
    ctx.arc(this.x + 4, this.y - this.height/2 + 6, 1, 0, Math.PI * 2);
    ctx.fill();

    // Draw sword
    ctx.fillStyle = '#CCCCCC';
    ctx.fillRect(this.x + this.width/2 - 2, this.y - this.height/2, 4, this.height - 4);
    ctx.fillRect(this.x + this.width/2 - 6, this.y - this.height/2 + 2, 12, 4);

    // Call parent for health bar and effects
    super.render(ctx);
  }
}