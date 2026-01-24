import React, { useState, useEffect } from 'react';
import EggCanvas from './EggCanvas';

import './EggGame.css';

const EggGame = () => {
    // game states
    const [gameState, setGameState] = useState('MENU');
    const [finalTime, setFinalTime] = useState(0);
    const [isHardMode, setIsHardMode] = useState(false);

    // preload image
    useEffect(() => {
        const img = new Image();
        img.src = "/assets/fell-off.png";
    }, []);

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
        
        <div className="egg-game-wrapper" style={{ position: 'relative', width: '800px', height: '500px' }}>

            {/* game engine */}
            <EggCanvas
                gameState={gameState}
                onLoss={handleLoss}
                onWin={handleWin}
                isHardMode={isHardMode}
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
                    <img
                        src="/assets/fell-off.png"
                        alt="someone told me i fell off"
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 0, // put behind button
                            opacity: 0.8
                        }}
                    />
                    <button onClick={handleStart}>Play Again</button>
                </div>
            )}

            {gameState !== 'PLAYING' && (
                <div className="hard-mode-toggle">
                        <label>
                            <input
                                type="checkbox"
                                checked={isHardMode}
                                onChange={(e) => setIsHardMode(e.target.checked)}
                                />
                                hard mode
                        </label>
                    </div>
            )}
        </div>
    );

};

export default EggGame;