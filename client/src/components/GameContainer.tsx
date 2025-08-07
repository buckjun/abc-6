import { useEffect, useRef, useState } from 'react';
import { Game } from '../game/Game';
import { TouchControls } from './TouchControls';
import { useIsMobile } from '../hooks/use-is-mobile';

const GameContainer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (canvasRef.current && !gameRef.current) {
      gameRef.current = new Game(canvasRef.current);
      setGameStarted(true);
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
      border: isMobile ? 'none' : '2px solid #8B4513',
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
          imageRendering: 'pixelated',
          touchAction: 'none' // Prevent default touch behaviors
        }}
      />
      <TouchControls visible={gameStarted && isMobile} />
    </div>
  );
};

export default GameContainer;
