export class AudioManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private backgroundMusic: HTMLAudioElement | null = null;
  private volume: number = 0.5;
  private muted: boolean = false;

  constructor() {
    console.log('AudioManager initialized');
  }

  public async loadSound(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(path);
      
      audio.addEventListener('loadeddata', () => {
        this.sounds.set(path, audio);
        console.log(`Sound loaded: ${path}`);
        resolve();
      });

      audio.addEventListener('error', (error) => {
        console.warn(`Failed to load sound: ${path}`, error);
        reject(error);
      });

      audio.volume = this.volume;
      audio.load();
    });
  }

  public playSound(path: string, loop: boolean = false): void {
    if (this.muted) return;

    const sound = this.sounds.get(path);
    if (sound) {
      sound.currentTime = 0;
      sound.loop = loop;
      sound.volume = this.volume;
      
      sound.play().catch(error => {
        console.warn(`Failed to play sound: ${path}`, error);
      });
    } else {
      console.warn(`Sound not found: ${path}`);
    }
  }

  public playBackgroundMusic(path: string): void {
    if (this.muted) return;

    this.stopBackgroundMusic();
    
    const music = this.sounds.get(path);
    if (music) {
      this.backgroundMusic = music;
      music.loop = true;
      music.volume = this.volume * 0.3; // Background music at lower volume
      
      music.play().catch(error => {
        console.warn(`Failed to play background music: ${path}`, error);
      });
    }
  }

  public stopBackgroundMusic(): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
      this.backgroundMusic = null;
    }
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    
    // Update volume for all sounds
    this.sounds.forEach(sound => {
      sound.volume = this.volume;
    });
    
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = this.volume * 0.3;
    }
  }

  public toggleMute(): void {
    this.muted = !this.muted;
    
    if (this.muted) {
      this.stopBackgroundMusic();
    }
    
    console.log(`Audio ${this.muted ? 'muted' : 'unmuted'}`);
  }

  public destroy(): void {
    this.stopBackgroundMusic();
    
    this.sounds.forEach(sound => {
      sound.pause();
      sound.src = '';
    });
    
    this.sounds.clear();
    console.log('AudioManager destroyed');
  }
}
