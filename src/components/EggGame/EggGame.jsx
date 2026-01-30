import React, { useState, useEffect } from 'react';
import EggCanvas from './EggCanvas';

import './EggGame.css';

const EggGame = () => {
    // game states
    const [gameState, setGameState] = useState('MENU');
    const [finalTime, setFinalTime] = useState(0);
    const [isHardMode, setIsHardMode] = useState(false);
    const [wonOnHardMode, setWonOnHardMode] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // check if on mobile device
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // preload image
    useEffect(() => {
        const images = [
            "/assets/fell-off.png",
            "/assets/fell-off-hm.png"
        ];
        
        images.forEach((path) => {
            const img = new Image();
            img.src = path;
        })
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
        setWonOnHardMode(isHardMode);
    };

    return (
        
        <div className="egg-game-wrapper">

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

                    <div className="overlay-left">
                        <h1>Balance the Egg!</h1>
                        <h3><u>Controls</u></h3>
                        <div className="controls-list">
                            {isMobile ? (
                                <>
                                    <p>Use your MICROPHONE to blow on the egg</p>
                                    <p>TAP on the side of the screen you want to blow from</p>
                                </>
                            ) : (
                                <>
                                    <p>Use your MICROPHONE (or spacebar) to blow on the egg</p>
                                    <p>LEFT and RIGHT arrow keys change which side you blow from</p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="overlay-right">
                        <button onClick={handleStart}>Play</button>
                    </div>

                </div>
            )}

            {gameState === 'GAME_OVER' && (
                <div className="overlay">

                    <div className="overlay-left">
                        <p className="game-over-text">
                            {"h o w   c o u l d   y o u . . .".split('').map((char, index) => (
                                <span
                                    key={index}
                                    className="jitter-char"
                                    style={{
                                        animationDelay: `-${Math.random()}s`,
                                        display: 'inline-block'
                                    }}
                                >
                                    {char === ' ' ? '\u00A0' : char}
                                </span>
                            ))}
                        </p>
                    </div>

                    <div className="overlay-right">
                        <button onClick={handleStart}>Try Again</button>
                    </div>
                </div>
            )}

            {gameState === 'VICTORY' && (
                <div className="overlay">

                    <div className="overlay-left">
                        <img
                            src={wonOnHardMode ? "/assets/fell-off-hm.png" : "/assets/fell-off.png"}
                            alt="someone told me i fell off"
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '25%',
                                transform: 'translate(-50%, -50%)',
                                zIndex: 0 // put behind button
                            }}
                        />
                    </div>

                    <div className="overlay-right">
                        <h1>Well done!</h1>
                        <button onClick={handleStart}>Play Again</button>
                    </div>
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