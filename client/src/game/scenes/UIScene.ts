import { Scene } from '../Game';
import type { Game } from '../Game';

export class UIScene implements Scene {
  private game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  init(): void {
    console.log('UIScene initialized');
  }

  update(deltaTime: number): void {
    // UI updates if needed
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Only render UI if we're in the game scene
    if (this.game.getCurrentSceneType() !== 'game') {
      return;
    }

    const gameData = this.game.getGameData();
    const canvas = this.game.getCanvas();

    // UI Background panel
    ctx.fillStyle = 'rgba(47, 47, 47, 0.8)';
    ctx.fillRect(10, 10, 300, 120);

    // UI Border
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 300, 120);

    // Health bar
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('HEALTH:', 20, 35);

    // Health bar background
    ctx.fillStyle = '#2F2F2F';
    ctx.fillRect(100, 20, 200, 20);

    // Health bar fill
    const healthPercent = Math.max(0, gameData.health) / 100;
    const healthColor = healthPercent > 0.5 ? '#00FF00' : healthPercent > 0.25 ? '#FFD700' : '#DC143C';
    ctx.fillStyle = healthColor;
    ctx.fillRect(100, 20, 200 * healthPercent, 20);

    // Health text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.max(0, Math.floor(gameData.health))}/100`, 200, 34);

    // Level
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`LEVEL: ${gameData.level}`, 20, 65);

    // Time
    const minutes = Math.floor(gameData.time / 60);
    const seconds = gameData.time % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    ctx.fillText(`TIME: ${timeString}`, 20, 90);

    // Enemy count
    const enemyCount = gameData.enemies ? gameData.enemies.length : 0;
    ctx.fillText(`ENEMIES: ${enemyCount}`, 20, 115);

    // Mini-map or additional UI elements could go here
    // For now, just show game controls reminder in bottom right
    ctx.fillStyle = 'rgba(47, 47, 47, 0.6)';
    ctx.fillRect(canvas.width - 220, canvas.height - 80, 210, 70);

    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 1;
    ctx.strokeRect(canvas.width - 220, canvas.height - 80, 210, 70);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('CONTROLS:', canvas.width - 210, canvas.height - 60);
    ctx.fillText('WASD/Arrows: Move', canvas.width - 210, canvas.height - 45);
    ctx.fillText('ESC: Return to Menu', canvas.width - 210, canvas.height - 30);
    ctx.fillText('Survive the horde!', canvas.width - 210, canvas.height - 15);
  }

  destroy(): void {
    console.log('UIScene destroyed');
  }
}
