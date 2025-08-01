export interface LevelUpOption {
  id: string;
  name: string;
  description: string;
  icon?: string;
  type: 'weapon' | 'passive' | 'upgrade' | 'special';
}

export class LevelUpUI {
  private active: boolean = false;
  private options: LevelUpOption[] = [];
  private selectedIndex: number = -1;
  private onSelection: (option: LevelUpOption) => void = () => {};

  constructor() {}

  show(options: LevelUpOption[], onSelection: (option: LevelUpOption) => void): void {
    this.active = true;
    this.options = options;
    this.selectedIndex = -1;
    this.onSelection = onSelection;
  }

  hide(): void {
    this.active = false;
    this.options = [];
    this.selectedIndex = -1;
  }

  isActive(): boolean {
    return this.active;
  }

  handleClick(mouseX: number, mouseY: number, canvasWidth: number, canvasHeight: number): boolean {
    if (!this.active) return false;

    const cardWidth = 200;
    const cardHeight = 120;
    const spacing = 20;
    const totalWidth = this.options.length * cardWidth + (this.options.length - 1) * spacing;
    const startX = (canvasWidth - totalWidth) / 2;
    const startY = (canvasHeight - cardHeight) / 2;

    for (let i = 0; i < this.options.length; i++) {
      const cardX = startX + i * (cardWidth + spacing);
      
      if (mouseX >= cardX && mouseX <= cardX + cardWidth &&
          mouseY >= startY && mouseY <= startY + cardHeight) {
        this.selectOption(i);
        return true;
      }
    }

    return false;
  }

  handleKeyPress(key: string): boolean {
    if (!this.active) return false;

    const keyNumber = parseInt(key);
    if (keyNumber >= 1 && keyNumber <= this.options.length) {
      this.selectOption(keyNumber - 1);
      return true;
    }

    return false;
  }

  private selectOption(index: number): void {
    if (index >= 0 && index < this.options.length) {
      this.selectedIndex = index;
      const selectedOption = this.options[index];
      this.onSelection(selectedOption);
      this.hide();
    }
  }

  render(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number): void {
    if (!this.active) return;

    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Title
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('LEVEL UP!', canvasWidth / 2, canvasHeight / 2 - 100);

    // Subtitle
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '18px Arial';
    ctx.fillText('Choose your upgrade:', canvasWidth / 2, canvasHeight / 2 - 70);

    // Option cards
    const cardWidth = 200;
    const cardHeight = 120;
    const spacing = 20;
    const totalWidth = this.options.length * cardWidth + (this.options.length - 1) * spacing;
    const startX = (canvasWidth - totalWidth) / 2;
    const startY = (canvasHeight - cardHeight) / 2;

    this.options.forEach((option, index) => {
      const cardX = startX + index * (cardWidth + spacing);
      
      // Card background
      ctx.fillStyle = this.getCardColor(option.type);
      ctx.fillRect(cardX, startY, cardWidth, cardHeight);

      // Card border
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.strokeRect(cardX, startY, cardWidth, cardHeight);

      // Option number
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${index + 1}`, cardX + 10, startY + 25);

      // Option name
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      const maxNameWidth = cardWidth - 20;
      this.wrapText(ctx, option.name, cardX + cardWidth/2, startY + 40, maxNameWidth, 18);

      // Option description
      ctx.fillStyle = '#CCCCCC';
      ctx.font = '12px Arial';
      const maxDescWidth = cardWidth - 20;
      this.wrapText(ctx, option.description, cardX + cardWidth/2, startY + 70, maxDescWidth, 14);

      // Type indicator
      ctx.fillStyle = this.getTypeColor(option.type);
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(option.type.toUpperCase(), cardX + cardWidth - 10, startY + cardHeight - 10);
    });

    // Instructions
    ctx.fillStyle = '#AAAAAA';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Click on a card or press 1-' + this.options.length, canvasWidth / 2, canvasHeight / 2 + 100);
  }

  private getCardColor(type: string): string {
    switch (type) {
      case 'weapon': return '#2A4D3A';
      case 'passive': return '#4A2D3A';
      case 'upgrade': return '#3A3D4A';
      case 'special': return '#4A3D2A';
      default: return '#333333';
    }
  }

  private getTypeColor(type: string): string {
    switch (type) {
      case 'weapon': return '#00FF00';
      case 'passive': return '#FF00FF';
      case 'upgrade': return '#00FFFF';
      case 'special': return '#FFFF00';
      default: return '#FFFFFF';
    }
  }

  private wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): void {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  }
}