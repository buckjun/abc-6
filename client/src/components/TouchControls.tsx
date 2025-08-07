import React from 'react';
import { useIsMobile } from '../hooks/use-is-mobile';

interface TouchControlsProps {
  visible: boolean;
}

export function TouchControls({ visible }: TouchControlsProps) {
  const isMobile = useIsMobile();
  
  if (!visible || !isMobile) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Movement Area Indicator */}
      <div className="absolute left-4 bottom-4 w-32 h-32 rounded-full border-2 border-white/30 flex items-center justify-center pointer-events-none">
        <div className="w-4 h-4 rounded-full bg-white/50"></div>
        <div className="absolute inset-0 flex items-center justify-center text-white/70 text-xs font-bold">
          이동
        </div>
      </div>
      
      {/* Targeting Area Indicator */}
      <div className="absolute right-4 bottom-4 text-white/70 text-xs font-bold pointer-events-none">
        <div className="bg-black/50 rounded p-2">
          오른쪽: 조준
        </div>
      </div>
      
      {/* Install App Button Area */}
      <div className="absolute top-4 right-4 pointer-events-auto">
        {/* This space is reserved for the PWA install button */}
      </div>
    </div>
  );
}