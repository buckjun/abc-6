import { Scene } from '../Game';
import type { Game } from '../Game';

export class MainMenuScene implements Scene {
  private game: Game;
  private tutorialButtonHover: boolean = false;
  private infiniteButtonHover: boolean = false;
  private tutorialButtonBounds = { x: 0, y: 0, width: 200, height: 60 };
  private infiniteButtonBounds = { x: 0, y: 0, width: 200, height: 60 };

  constructor(game: Game) {
    this.game = game;
  }

  init(): void {
    console.log('MainMenuScene initialized');
    
    // Add click listener for start button
    this.game.getCanvas().addEventListener('click', this.handleClick);
    this.game.getCanvas().addEventListener('mousemove', this.handleMouseMove);
    
    // Add keyboard listener
    this.game.getInputManager().onKeyPress('Enter', () => this.startTutorial());
    this.game.getInputManager().onKeyPress(' ', () => this.startTutorial());
  }

  private handleClick = (event: MouseEvent): void => {
    const rect = this.game.getCanvas().getBoundingClientRect();
    const scaleX = this.game.getCanvas().width / rect.width;
    const scaleY = this.game.getCanvas().height / rect.height;
    
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    if (this.isPointInTutorialButton(x, y)) {
      this.startTutorial();
    } else if (this.isPointInInfiniteButton(x, y)) {
      this.startInfinite();
    }
  };

  private handleMouseMove = (event: MouseEvent): void => {
    const rect = this.game.getCanvas().getBoundingClientRect();
    const scaleX = this.game.getCanvas().width / rect.width;
    const scaleY = this.game.getCanvas().height / rect.height;
    
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    this.tutorialButtonHover = this.isPointInTutorialButton(x, y);
    this.infiniteButtonHover = this.isPointInInfiniteButton(x, y);
    this.game.getCanvas().style.cursor = (this.tutorialButtonHover || this.infiniteButtonHover) ? 'pointer' : 'default';
  };

  private isPointInTutorialButton(x: number, y: number): boolean {
    return x >= this.tutorialButtonBounds.x && x <= this.tutorialButtonBounds.x + this.tutorialButtonBounds.width &&
           y >= this.tutorialButtonBounds.y && y <= this.tutorialButtonBounds.y + this.tutorialButtonBounds.height;
  }

  private isPointInInfiniteButton(x: number, y: number): boolean {
    return x >= this.infiniteButtonBounds.x && x <= this.infiniteButtonBounds.x + this.infiniteButtonBounds.width &&
           y >= this.infiniteButtonBounds.y && y <= this.infiniteButtonBounds.y + this.infiniteButtonBounds.height;
  }

  private startTutorial(): void {
    this.game.getAudioManager().playSound('/sounds/success.mp3');
    this.game.switchScene('tutorial');
  }

  private startInfinite(): void {
    this.game.getAudioManager().playSound('/sounds/success.mp3');
    this.game.switchScene('game');
  }

  update(deltaTime: number): void {
    // Menu doesn't need complex updates
  }

  render(ctx: CanvasRenderingContext2D): void {
    const canvas = this.game.getCanvas();
    
    // Update button positions for center alignment
    this.tutorialButtonBounds.x = canvas.width / 2 - 100;
    this.tutorialButtonBounds.y = canvas.height / 2 - 20;
    this.infiniteButtonBounds.x = canvas.width / 2 - 100;
    this.infiniteButtonBounds.y = canvas.height / 2 + 60;
    
    // Background
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#DC143C';
    ctx.font = 'bold 72px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ABC-SLAYER', canvas.width / 2, canvas.height / 2 - 150);

    // Subtitle
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px "Courier New", monospace';
    ctx.fillText('Survive the endless horde', canvas.width / 2, canvas.height / 2 - 100);

    // Tutorial button
    ctx.fillStyle = this.tutorialButtonHover ? '#FF1744' : '#DC143C';
    ctx.fillRect(this.tutorialButtonBounds.x, this.tutorialButtonBounds.y, this.tutorialButtonBounds.width, this.tutorialButtonBounds.height);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      '튜토리얼',
      this.tutorialButtonBounds.x + this.tutorialButtonBounds.width / 2,
      this.tutorialButtonBounds.y + this.tutorialButtonBounds.height / 2 + 8
    );

    // Infinite mode button
    ctx.fillStyle = this.infiniteButtonHover ? '#FF1744' : '#DC143C';
    ctx.fillRect(this.infiniteButtonBounds.x, this.infiniteButtonBounds.y, this.infiniteButtonBounds.width, this.infiniteButtonBounds.height);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      '무한 모드',
      this.infiniteButtonBounds.x + this.infiniteButtonBounds.width / 2,
      this.infiniteButtonBounds.y + this.infiniteButtonBounds.height / 2 + 8
    );

    // Instructions
    ctx.fillStyle = '#AAAAAA';
    ctx.font = '16px "Courier New", monospace';
    ctx.fillText('튜토리얼: 5분 보스 클리어 목표', canvas.width / 2, canvas.height / 2 + 150);
    ctx.fillText('무한 모드: 최대한 오래 생존', canvas.width / 2, canvas.height / 2 + 180);
    ctx.fillText('WASD 또는 화살표 키로 이동', canvas.width / 2, canvas.height / 2 + 210);

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
