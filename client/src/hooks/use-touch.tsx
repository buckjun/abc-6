import { useEffect, useRef } from 'react';

interface TouchControls {
  movement: { x: number; y: number };
  isMoving: boolean;
  target: { x: number; y: number } | null;
}

export function useTouch(canvas: HTMLCanvasElement | null) {
  const touchControls = useRef<TouchControls>({
    movement: { x: 0, y: 0 },
    isMoving: false,
    target: null
  });

  useEffect(() => {
    if (!canvas) return;

    let moveStartX = 0;
    let moveStartY = 0;
    let initialMoveDistance = 0;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        // Check if touch is in movement area (left side)
        if (x < canvas.width * 0.4) {
          moveStartX = x;
          moveStartY = y;
          touchControls.current.isMoving = true;
          initialMoveDistance = 0;
        } else {
          // Touch target (right side for aiming)
          touchControls.current.target = { x, y };
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      
      if (e.touches.length === 1 && touchControls.current.isMoving) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        const deltaX = x - moveStartX;
        const deltaY = y - moveStartY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Only start moving if touch has moved significantly
        if (distance > 20 || initialMoveDistance > 0) {
          initialMoveDistance = distance;
          
          // Normalize movement vector
          const maxDistance = 80; // Maximum movement distance
          const normalizedDistance = Math.min(distance, maxDistance);
          const normalizedDeltaX = (deltaX / distance) * normalizedDistance;
          const normalizedDeltaY = (deltaY / distance) * normalizedDistance;
          
          touchControls.current.movement = {
            x: normalizedDeltaX / maxDistance,
            y: normalizedDeltaY / maxDistance
          };
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      
      touchControls.current.isMoving = false;
      touchControls.current.movement = { x: 0, y: 0 };
      
      // Keep target for a short time for aiming
      setTimeout(() => {
        touchControls.current.target = null;
      }, 100);
    };

    // Add touch event listeners
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [canvas]);

  return touchControls.current;
}