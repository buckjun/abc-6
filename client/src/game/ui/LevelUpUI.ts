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

    // Light semi-transparent overlay (less intrusive)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
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
      
      // Color-coded card background based on type
      let bgColor = 'rgba(51, 51, 51, 0.9)';
      let borderColor = '#666666';
      if (option.type === 'weapon') {
        bgColor = 'rgba(70, 130, 180, 0.8)'; // Steel blue for weapons
        borderColor = '#4682B4';
      } else if (option.type === 'upgrade') {
        bgColor = 'rgba(255, 165, 0, 0.8)'; // Orange for upgrades
        borderColor = '#FFA500';
      } else if (option.type === 'passive') {
        bgColor = 'rgba(50, 205, 50, 0.8)'; // Lime green for passives
        borderColor = '#32CD32';
      } else if (option.type === 'special') {
        bgColor = 'rgba(218, 165, 32, 0.8)'; // Gold for special items
        borderColor = '#DAA520';
      }
      
      // Card background
      ctx.fillStyle = bgColor;
      ctx.fillRect(cardX, startY, cardWidth, cardHeight);

      // Enhanced card border
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 3;
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

      // Type indicator with Korean text
      ctx.fillStyle = borderColor;
      ctx.font = 'bold 10px "Courier New", monospace';
      ctx.textAlign = 'right';
      let typeText = '';
      if (option.type === 'weapon') typeText = '새 무기';
      else if (option.type === 'upgrade') typeText = '강화';
      else if (option.type === 'passive') typeText = '패시브';
      else if (option.type === 'special') typeText = '특수';
      ctx.fillText(typeText, cardX + cardWidth - 10, startY + cardHeight - 10);
    });

    // Instructions with improved visibility
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('카드를 클릭하거나 숫자 키(1-4)를 눌러 선택하세요', canvasWidth / 2, canvasHeight / 2 + 100);
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