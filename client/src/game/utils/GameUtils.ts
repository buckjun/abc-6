export class GameUtils {
  // AABB collision detection
  public static isColliding(
    rect1: { x: number; y: number; width: number; height: number },
    rect2: { x: number; y: number; width: number; height: number }
  ): boolean {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }

  // Calculate distance between two points
  public static distance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Normalize a vector
  public static normalize(x: number, y: number): { x: number; y: number } {
    const length = Math.sqrt(x * x + y * y);
    if (length === 0) {
      return { x: 0, y: 0 };
    }
    return { x: x / length, y: y / length };
  }

  // Clamp a value between min and max
  public static clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  // Linear interpolation
  public static lerp(start: number, end: number, factor: number): number {
    return start + (end - start) * factor;
  }

  // Random number between min and max (inclusive)
  public static randomBetween(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  // Random integer between min and max (inclusive)
  public static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Convert degrees to radians
  public static degToRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Convert radians to degrees
  public static radToDeg(radians: number): number {
    return radians * (180 / Math.PI);
  }
}
