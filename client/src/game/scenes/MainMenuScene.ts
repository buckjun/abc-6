import { Scene } from '../Game';
import type { Game } from '../Game';

export class MainMenuScene implements Scene {
  private game: Game;
  private startButtonHover: boolean = false;
  private startButtonBounds = { x: 540, y: 400, width: 200, height: 60 };

  constructor(game: Game) {
    this.game = game;
  }

  init(): void {
    console.log('MainMenuScene initialized');
    
    // Add click listener for start button
    this.game.getCanvas().addEventListener('click', this.handleClick);
    this.game.getCanvas().addEventListener('mousemove', this.handleMouseMove);
    
    // Add keyboard listener
    this.game.getInputManager().onKeyPress('Enter', () => this.startGame());
    this.game.getInputManager().onKeyPress(' ', () => this.startGame());
  }

  private handleClick = (event: MouseEvent): void => {
    const rect = this.game.getCanvas().getBoundingClientRect();
    const scaleX = this.game.getCanvas().width / rect.width;
    const scaleY = this.game.getCanvas().height / rect.height;
    
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    if (this.isPointInStartButton(x, y)) {
      this.startGame();
    }
  };

  private handleMouseMove = (event: MouseEvent): void => {
    const rect = this.game.getCanvas().getBoundingClientRect();
    const scaleX = this.game.getCanvas().width / rect.width;
    const scaleY = this.game.getCanvas().height / rect.height;
    
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    this.startButtonHover = this.isPointInStartButton(x, y);
    this.game.getCanvas().style.cursor = this.startButtonHover ? 'pointer' : 'default';
  };

  private isPointInStartButton(x: number, y: number): boolean {
    return x >= this.startButtonBounds.x && x <= this.startButtonBounds.x + this.startButtonBounds.width &&
           y >= this.startButtonBounds.y && y <= this.startButtonBounds.y + this.startButtonBounds.height;
  }

  private startGame(): void {
    this.game.getAudioManager().playSound('/sounds/success.mp3');
    this.game.switchScene('game');
  }

  update(deltaTime: number): void {
    // Menu doesn't need complex updates
  }

  render(ctx: CanvasRenderingContext2D): void {
    const canvas = this.game.getCanvas();
    
    // Background
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#DC143C';
    ctx.font = 'bold 72px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('AUTO-SLAYER', canvas.width / 2, 200);

    // Subtitle
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px "Courier New", monospace';
    ctx.fillText('Survive the endless horde', canvas.width / 2, 250);

    // Start button
    const buttonColor = this.startButtonHover ? '#A0522D' : '#8B4513';
    ctx.fillStyle = buttonColor;
    ctx.fillRect(this.startButtonBounds.x, this.startButtonBounds.y, 
                 this.startButtonBounds.width, this.startButtonBounds.height);

    // Button border
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.startButtonBounds.x, this.startButtonBounds.y, 
                   this.startButtonBounds.width, this.startButtonBounds.height);

    // Button text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px "Courier New", monospace';
    ctx.fillText('START GAME', canvas.width / 2, this.startButtonBounds.y + 35);

    // Controls info
    ctx.fillStyle = '#FFD700';
    ctx.font = '16px "Courier New", monospace';
    ctx.fillText('WASD / Arrow Keys to move', canvas.width / 2, 550);
    ctx.fillText('Survive as long as you can!', canvas.width / 2, 580);

    // Version info
    ctx.fillStyle = '#8B4513';
    ctx.font = '12px "Courier New", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('v1.0.0', canvas.width - 20, canvas.height - 20);
  }

  destroy(): void {
    this.game.getCanvas().removeEventListener('click', this.handleClick);
    this.game.getCanvas().removeEventListener('mousemove', this.handleMouseMove);
    this.game.getCanvas().style.cursor = 'default';
    console.log('MainMenuScene destroyed');
  }
}
