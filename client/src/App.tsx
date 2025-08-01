import { Suspense, useEffect, useState } from "react";
import "@fontsource/inter";
import GameContainer from "./components/GameContainer";

// Main App component
function App() {
  const [showGame, setShowGame] = useState(false);

  // Show the game once everything is loaded
  useEffect(() => {
    setShowGame(true);
  }, []);

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'relative', 
      overflow: 'hidden',
      backgroundColor: '#1A1A1A',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      {showGame && (
        <Suspense fallback={
          <div style={{
            color: '#FFFFFF',
            fontFamily: 'Courier New, monospace',
            fontSize: '24px'
          }}>
            Loading Auto-Slayer...
          </div>
        }>
          <GameContainer />
        </Suspense>
      )}
    </div>
  );
}

export default App;
