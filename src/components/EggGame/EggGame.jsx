import React, { useState } from 'react';
import EggCanvas from './EggCanvas';
import './EggGame.css';

const EggGame = () => {
    // game states
    const [gameState, setGameState] = useState('MENU');

    const [finalTime, setFinalTime] = useState(0);

    // handlers
    const handleStart = () => {
        setGameState('PLAYING');
        setFinalTime(0);
    };

    // lose
    const handleLoss = (time) => {
        setFinalTime(time);
        setGameState('GAME_OVER');
    };

    // win
    const handleWin = (time) => {
        setFinalTime(time);
        setGameState('VICTORY');
    };

    return (
        
        <div className="egg-game-wrapper" style={{ position: 'relative', width: '400px', height: '250px' }}>

            {/* game engine */}
            <EggCanvas
                gameState={gameState}
                onLoss={handleLoss}
                onWin={handleWin}
            />

            {/* ui */}
            {gameState === 'MENU' && (
                <div className="overlay">
                    <button onClick={handleStart}>Start</button>
                </div>
            )}

            {gameState === 'GAME_OVER' && (
                <div className="overlay">
                    <h2>game over</h2>
                    <button onClick={handleStart}>Retry</button>
                </div>
            )}

            {gameState === 'VICTORY' && (
                <div className="overlay">
                    <h1>SOMEONE TOLD ME I FELL OFF</h1>
                    <button onClick={handleStart}>Play Again</button>
                </div>
            )}
        </div>
    );

};

export default EggGame;