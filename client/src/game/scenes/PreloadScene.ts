import { Scene } from '../Game';
import type { Game } from '../Game';

export class PreloadScene implements Scene {
  private game: Game;
  private progress: number = 0;
  private loadingComplete: boolean = false;

  constructor(game: Game) {
    this.game = game;
  }

  init(): void {
    console.log('PreloadScene initialized');
    this.loadAssets();
  }

  private async loadAssets(): Promise<void> {
    const assets = [
      '/sounds/background.mp3',
      '/sounds/hit.mp3',
      '/sounds/success.mp3'
    ];

    for (let i = 0; i < assets.length; i++) {
      try {
        await this.game.getAudioManager().loadSound(assets[i]);
        this.progress = (i + 1) / assets.length;
      } catch (error) {
        console.warn(`Failed to load asset: ${assets[i]}`, error);
        this.progress = (i + 1) / assets.length;
      }
    }

    this.loadingComplete = true;
    
    // Auto-transition to main menu after a brief delay
    setTimeout(() => {
      this.game.switchScene('mainmenu');
    }, 500);
  }

  update(deltaTime: number): void {
    // Nothing to update during preload
  }

  render(ctx: CanvasRenderingContext2D): void {
    const canvas = this.game.getCanvas();
    
    // Background
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '48px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ABC-SLAYER', canvas.width / 2, canvas.height / 2 - 50);

    // Loading bar background
    const barWidth = 400;
    const barHeight = 20;
    const barX = (canvas.width - barWidth) / 2;
    const barY = canvas.height / 2 + 20;

    ctx.fillStyle = '#2F2F2F';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Loading bar progress
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(barX, barY, barWidth * this.progress, barHeight);

    // Loading text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px "Courier New", monospace';
    ctx.fillText(`Loading... ${Math.round(this.progress * 100)}%`, canvas.width / 2, barY + 50);

    if (this.loadingComplete) {
      ctx.fillStyle = '#FFD700';
      ctx.fillText('Press any key to continue', canvas.width / 2, barY + 80);
    }
  }

  destroy(): void {
    console.log('PreloadScene destroyed');
  }
}
