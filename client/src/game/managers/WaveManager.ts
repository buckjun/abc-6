export interface WaveData {
  timeStart: number; // in seconds
  timeEnd: number;
  enemyTypes: string[];
  spawnRate: number; // enemies per second
  maxEnemies: number;
  bossType?: string;
}

export class WaveManager {
  private gameTime: number = 0;
  private currentWaveIndex: number = 0;
  private waves: WaveData[] = [];
  private bossSpawnTimes: number[] = [300, 600, 900, 1200, 1800]; // 5, 10, 15, 20, 30 minutes
  private bossesSpawned: Set<number> = new Set();

  constructor() {
    this.initializeWaves();
  }

  private initializeWaves(): void {
    this.waves = [
      // Early game (0-3 minutes)
      {
        timeStart: 0,
        timeEnd: 180,
        enemyTypes: ['slime', 'bat'],
        spawnRate: 0.5,
        maxEnemies: 15
      },
      // Early-mid game (3-5 minutes)
      {
        timeStart: 180,
        timeEnd: 300,
        enemyTypes: ['slime', 'bat', 'skeleton'],
        spawnRate: 0.8,
        maxEnemies: 25,
        bossType: 'mini_boss'
      },
      // Mid game (5-10 minutes)
      {
        timeStart: 300,
        timeEnd: 600,
        enemyTypes: ['slime', 'bat', 'skeleton', 'goblin'],
        spawnRate: 1.2,
        maxEnemies: 40,
        bossType: 'boss'
      },
      // Mid-late game (10-15 minutes)
      {
        timeStart: 600,
        timeEnd: 900,
        enemyTypes: ['bat', 'skeleton', 'goblin', 'ogre'],
        spawnRate: 1.8,
        maxEnemies: 60,
        bossType: 'boss'
      },
      // Late game (15-20 minutes)
      {
        timeStart: 900,
        timeEnd: 1200,
        enemyTypes: ['skeleton', 'goblin', 'ogre'],
        spawnRate: 2.5,
        maxEnemies: 80,
        bossType: 'elite_boss'
      },
      // End game (20-30 minutes)
      {
        timeStart: 1200,
        timeEnd: 1800,
        enemyTypes: ['goblin', 'ogre'],
        spawnRate: 3.0,
        maxEnemies: 100,
        bossType: 'elite_boss'
      },
      // Final phase (30+ minutes)
      {
        timeStart: 1800,
        timeEnd: Infinity,
        enemyTypes: ['ogre'],
        spawnRate: 4.0,
        maxEnemies: 150,
        bossType: 'reaper'
      }
    ];
  }

  update(deltaTime: number): void {
    this.gameTime += deltaTime;
  }

  getCurrentWave(): WaveData | null {
    for (let i = 0; i < this.waves.length; i++) {
      const wave = this.waves[i];
      if (this.gameTime >= wave.timeStart && this.gameTime < wave.timeEnd) {
        this.currentWaveIndex = i;
        return wave;
      }
    }
    return null;
  }

  shouldSpawnBoss(): { shouldSpawn: boolean; bossType: string } {
    for (const bossTime of this.bossSpawnTimes) {
      if (this.gameTime >= bossTime && !this.bossesSpawned.has(bossTime)) {
        this.bossesSpawned.add(bossTime);
        
        let bossType = 'boss';
        if (bossTime >= 1800) bossType = 'reaper';
        else if (bossTime >= 900) bossType = 'elite_boss';
        else if (bossTime >= 300) bossType = 'boss';
        else bossType = 'mini_boss';
        
        return { shouldSpawn: true, bossType };
      }
    }
    return { shouldSpawn: false, bossType: '' };
  }

  getGameTime(): number {
    return this.gameTime;
  }

  getFormattedTime(): string {
    const minutes = Math.floor(this.gameTime / 60);
    const seconds = Math.floor(this.gameTime % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  getCurrentWaveNumber(): number {
    return this.currentWaveIndex + 1;
  }

  getDifficultyMultiplier(): number {
    // Difficulty increases over time
    const timeMinutes = this.gameTime / 60;
    return 1 + (timeMinutes * 0.1);
  }

  getSpawnInterval(): number {
    const currentWave = this.getCurrentWave();
    if (!currentWave) return 2.0;
    
    // Convert spawn rate to interval
    return Math.max(0.1, 1 / currentWave.spawnRate);
  }

  getMaxEnemies(): number {
    const currentWave = this.getCurrentWave();
    if (!currentWave) return 20;
    
    return Math.floor(currentWave.maxEnemies * this.getDifficultyMultiplier());
  }

  getEnemyTypesToSpawn(): string[] {
    const currentWave = this.getCurrentWave();
    if (!currentWave) return ['slime'];
    
    return currentWave.enemyTypes;
  }

  reset(): void {
    this.gameTime = 0;
    this.currentWaveIndex = 0;
    this.bossesSpawned.clear();
  }

  // Debug method
  getWaveInfo(): string {
    const currentWave = this.getCurrentWave();
    if (!currentWave) return 'No active wave';
    
    return `Wave ${this.getCurrentWaveNumber()}: ${currentWave.enemyTypes.join(', ')} (${currentWave.spawnRate}/s)`;
  }
}