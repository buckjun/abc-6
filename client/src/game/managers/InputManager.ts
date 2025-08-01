export class InputManager {
  private keys: Set<string> = new Set();
  private keyPressHandlers: Map<string, () => void> = new Map();
  private mouseClickHandlers: ((x: number, y: number) => void)[] = [];
  private mouseX: number = 0;
  private mouseY: number = 0;
  private canvas: HTMLCanvasElement | null = null;
  private pressedKeys: Set<string> = new Set(); // Track single key presses
  private mousePressed: boolean = false; // Track mouse click state

  constructor() {
    this.init();
  }

  public setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.setupMouseTracking();
  }

  private init(): void {
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
    console.log('InputManager initialized');
  }

  private setupMouseTracking(): void {
    if (!this.canvas) return;

    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('click', this.handleMouseClick);
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
    console.log('Mouse tracking enabled');
  }

  private handleMouseMove = (event: MouseEvent): void => {
    if (!this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    
    this.mouseX = (event.clientX - rect.left) * scaleX;
    this.mouseY = (event.clientY - rect.top) * scaleY;
  };

  private handleMouseClick = (event: MouseEvent): void => {
    if (!this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    
    const clickX = (event.clientX - rect.left) * scaleX;
    const clickY = (event.clientY - rect.top) * scaleY;
    
    // Call all registered click handlers
    this.mouseClickHandlers.forEach(handler => {
      handler(clickX, clickY);
    });
  };

  private handleMouseDown = (event: MouseEvent): void => {
    this.mousePressed = true;
  };

  private handleMouseUp = (event: MouseEvent): void => {
    this.mousePressed = false;
  };

  private handleKeyDown = (event: KeyboardEvent): void => {
    this.keys.add(event.code);
    
    // Track single press (only if not already pressed)
    if (!this.pressedKeys.has(event.key)) {
      this.pressedKeys.add(event.key);
    }
    
    // Handle single key press events
    const handler = this.keyPressHandlers.get(event.code);
    if (handler) {
      handler();
    }

    // Handle special keys
    if (event.key === 'Enter') {
      const enterHandler = this.keyPressHandlers.get('Enter');
      if (enterHandler) {
        enterHandler();
      }
    }

    if (event.key === ' ') {
      const spaceHandler = this.keyPressHandlers.get(' ');
      if (spaceHandler) {
        spaceHandler();
      }
    }

    if (event.key === 'Escape') {
      const escHandler = this.keyPressHandlers.get('Escape');
      if (escHandler) {
        escHandler();
      }
    }

    // Log key presses for debugging
    console.log('Key pressed:', event.code, event.key);
  };

  private handleKeyUp = (event: KeyboardEvent): void => {
    this.keys.delete(event.code);
    this.pressedKeys.delete(event.key);
  };

  public isKeyDown(keyCode: string): boolean {
    return this.keys.has(keyCode);
  }

  public isKeyPressed(key: string): boolean {
    const pressed = this.pressedKeys.has(key);
    if (pressed) {
      this.pressedKeys.delete(key); // Remove after checking to ensure single press
    }
    return pressed;
  }

  public onKeyPress(key: string, handler: () => void): void {
    this.keyPressHandlers.set(key, handler);
  }

  public removeKeyPressHandler(key: string): void {
    this.keyPressHandlers.delete(key);
  }

  public isMousePressed(): boolean {
    const pressed = this.mousePressed;
    if (pressed) {
      this.mousePressed = false; // Reset after checking
    }
    return pressed;
  }

  public getMousePosition(): { x: number; y: number } {
    return { x: this.mouseX, y: this.mouseY };
  }

  public onCanvasClick(handler: (x: number, y: number) => void): void {
    this.mouseClickHandlers.push(handler);
  }

  public destroy(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    
    if (this.canvas) {
      this.canvas.removeEventListener('mousemove', this.handleMouseMove);
      this.canvas.removeEventListener('click', this.handleMouseClick);
      this.canvas.removeEventListener('mousedown', this.handleMouseDown);
      this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    }
    
    this.keys.clear();
    this.pressedKeys.clear();
    this.keyPressHandlers.clear();
    this.mouseClickHandlers = [];
    console.log('InputManager destroyed');
  }
}
