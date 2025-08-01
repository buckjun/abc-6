import { useEffect, useRef } from 'react';
import { Game } from '../game/Game';

const GameContainer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);

  useEffect(() => {
    if (canvasRef.current && !gameRef.current) {
      gameRef.current = new Game(canvasRef.current);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy();
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{
      width: '1280px',
      height: '720px',
      maxWidth: '100vw',
      maxHeight: '100vh',
      backgroundColor: '#1A1A1A',
      border: '2px solid #8B4513',
      position: 'relative'
    }}>
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          imageRendering: 'pixelated'
        }}
      />
    </div>
  );
};

export default GameContainer;
