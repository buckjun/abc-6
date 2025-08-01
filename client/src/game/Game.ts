import { PreloadScene } from './scenes/PreloadScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { GameScene } from './scenes/GameScene';
import { UIScene } from './scenes/UIScene';
import { InputManager } from './managers/InputManager';
import { AudioManager } from './managers/AudioManager';

export interface Scene {
  init(): void;
  update(deltaTime: number): void;
  render(ctx: CanvasRenderingContext2D): void;
  destroy(): void;
}

export type SceneType = 'preload' | 'mainmenu' | 'game' | 'ui';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private scenes: Map<SceneType, Scene> = new Map();
  private currentScene: Scene | null = null;
  private currentSceneType: SceneType = 'preload';
  private lastTime: number = 0;
  private animationId: number = 0;
  private inputManager: InputManager;
  private audioManager: AudioManager;
  private gameData: any = {
    health: 100,
    level: 1,
    time: 0,
    enemies: [],
    player: null
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = context;
    
    // Initialize managers
    this.inputManager = new InputManager();
    this.audioManager = new AudioManager();
    
    this.init();
  }

  private init(): void {
    // Initialize scenes
    this.scenes.set('preload', new PreloadScene(this));
    this.scenes.set('mainmenu', new MainMenuScene(this));
    this.scenes.set('game', new GameScene(this));
    this.scenes.set('ui', new UIScene(this));

    // Start with preload scene
    this.switchScene('preload');
    this.start();
  }

  public switchScene(sceneType: SceneType): void {
    if (this.currentScene) {
      this.currentScene.destroy();
    }

    const scene = this.scenes.get(sceneType);
    if (scene) {
      this.currentScene = scene;
      this.currentSceneType = sceneType;
      scene.init();
      console.log(`Switched to scene: ${sceneType}`);
    }
  }

  public getCurrentSceneType(): SceneType {
    return this.currentSceneType;
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  public getInputManager(): InputManager {
    return this.inputManager;
  }

  public getAudioManager(): AudioManager {
    return this.audioManager;
  }

  public getGameData(): any {
    return this.gameData;
  }

  public setGameData(data: any): void {
    this.gameData = { ...this.gameData, ...data };
  }

  private start(): void {
    this.lastTime = performance.now();
    this.gameLoop();
  }

  private gameLoop = (): void => {
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = currentTime;

    // Update
    if (this.currentScene) {
      this.currentScene.update(deltaTime);
    }

    // Clear canvas
    this.ctx.fillStyle = '#1A1A1A';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render
    if (this.currentScene) {
      this.currentScene.render(this.ctx);
    }

    this.animationId = requestAnimationFrame(this.gameLoop);
  };

  public destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    this.scenes.forEach(scene => scene.destroy());
    this.scenes.clear();
    this.inputManager.destroy();
    this.audioManager.destroy();
  }
}
