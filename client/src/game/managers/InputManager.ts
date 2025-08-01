export class InputManager {
  private keys: Set<string> = new Set();
  private keyPressHandlers: Map<string, () => void> = new Map();

  constructor() {
    this.init();
  }

  private init(): void {
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
    console.log('InputManager initialized');
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    this.keys.add(event.code);
    
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
  };

  public isKeyDown(keyCode: string): boolean {
    return this.keys.has(keyCode);
  }

  public onKeyPress(key: string, handler: () => void): void {
    this.keyPressHandlers.set(key, handler);
  }

  public removeKeyPressHandler(key: string): void {
    this.keyPressHandlers.delete(key);
  }

  public destroy(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    this.keys.clear();
    this.keyPressHandlers.clear();
    console.log('InputManager destroyed');
  }
}
