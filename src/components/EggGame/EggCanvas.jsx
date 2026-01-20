import React, { useEffect, useRef } from 'react';


const EggCanvas = ({ gameState, onLoss, onWin}) => {
    const renderRef = useRef(); // refer to HTML div where canvas is
    const gameStateRef = useRef(gameState); // allow p5 to see current React state

    // sync state
    useEffect(() => {
        gameStateRef.current = gameState;
    }, [gameState]);

    useEffect(() => {
        const sketch = (p) => {

            //variables
            let angle = 0;
            let velocity = 0;
            let blowDirection = 1;
            let drop = 0;
            let initialPush = 0;
            let mic;
            let startTime = 0;
            let gameActive = false;
            let lipsL1, lipsL2, lipsR1, lipsR2;
            let isBlowing = false;
            let blowSounds = [];
            let crackSound;
            let spacebarLock = false;

            // constants
            let gravity = 0.0001;
            let maxAngle = 1.7;
            let lipsWidth = 168;
            let lipsHeight = 81;
            let blowVelocity = 0.00015;
            let timeLimit = 30;

            // preload assets
            p.preload = () => {
                lipsL1 = p.loadImage('/assets/lipsL1.png');
                lipsL2 = p.loadImage('/assets/lipsL2.png');
                lipsR1 = p.loadImage('/assets/lipsR1.png');
                lipsR2 = p.loadImage('/assets/lipsR2.png');
                blowSounds[0] = p.loadSound('/assets/blow1.mp3');
                blowSounds[1] = p.loadSound('/assets/blow2.mp3');
                blowSounds[2] = p.loadSound('/assets/blow3.mp3');
                blowSounds[3] = p.loadSound('/assets/blow4.mp3');
                blowSounds[4] = p.loadSound('/assets/blow5.mp3');
                blowSounds[5] = p.loadSound('/assets/blow6.mp3');
                crackSound = p.loadSound('/assets/crack.mp3');
            };

            // runs once at start
            p.setup = () => {
                p.createCanvas(400, 250);
                p.textAlign(p.CENTER);
                p.textSize(20);

                // initialize mic
                mic = new window.p5.AudioIn();
                mic.start();
            };

            

            // draws 60 times per second
            p.draw = () => {
                p.background(255);

                // check game state
                if (gameStateRef.current !== 'PLAYING') {
                    gameActive = false;
                    drawScene(p,0);
                    return;
                }

                // startup
                if (!gameActive) {
                    startTime = p.millis();
                    angle = 0;
                    initialPush = (p.random([1, -1])) * (gravity * 2);
                    velocity = initialPush + gravity;
                    drop = 0;
                    gameActive = true;
                }

                // timer
                let elapsed = (p.millis() - startTime) / 1000;
                let timeLeft = Math.max(0, timeLimit - elapsed);
                p.fill(0);
                p.noStroke();
                p.text(`${timeLeft.toFixed(0)}`, 200, 50);

                

                // "gravity"
                if (angle > 0 || angle < 0) {
                    velocity += (angle * gravity);
                }

                // player controls
                isBlowing = false;

                if (p.keyIsDown(p.LEFT_ARROW)) {
                    blowDirection = 1;
                }
                if (p.keyIsDown(p.RIGHT_ARROW)) {
                    blowDirection = -1;
                }
                if (p.keyIsDown(32)) { // spacebar
                    velocity += (blowVelocity * blowDirection);
                    isBlowing = true;

                    // play blowing SFX if not using mic
                    if (spacebarLock === false) {
                        let isSoundActive = blowSounds.some(s => s.isPlaying());
                        if(!isSoundActive) {
                            let randomSound = p.random(blowSounds);
                            randomSound.setVolume(0.2);
                            randomSound.play();
                        }
                        spacebarLock = true;
                    }
                }
                else {
                    spacebarLock = false;
                }
                if (mic) {
                    let vol = mic.getLevel();
                    if (vol > 0.2) {
                        velocity += (blowVelocity * blowDirection);
                        isBlowing = true;
                    }
                }

                // draw lips
                if (blowDirection == 1) {
                    if (isBlowing) {
                        p.image(lipsL2, 0, (p.height / 4), lipsWidth, lipsHeight);
                    } else {
                        p.image(lipsL1, 0, (p.height / 4), lipsWidth, lipsHeight);
                    }
                }
                if (blowDirection == -1) {
                    if (isBlowing) {
                        p.image(lipsR2, p.width - lipsWidth, (p.height / 4), lipsWidth, lipsHeight);
                    } else {
                        p.image(lipsR1, p.width - lipsWidth, (p.height / 4), lipsWidth, lipsHeight);
                    }
                }
                
                // game loop
                drawScene(p, (angle += velocity));

                // win condition
                if(timeLeft == 0) {
                    onWin(timeLeft);
                }

                // lose condition
                if(angle > maxAngle || angle < -maxAngle) {
                    velocity = 0; //CHANGE FALL ANGLE TO NOT BE STRAIGHT DOWN
                    drop += (drop * (gravity + .13) + 1); //REPLACE MAGIC NUM
                    if(drop > 150) { //REPLACE MAGIC NUM
                        onLoss(timeLeft);
                        crackSound.setVolume(0.3);
                        crackSound.play();
                    }
                }
                
            };

            const drawScene = (p, angle) => {
                p.push();

                p.translate(p.width / 2, p.height / 2 - 10);

                // draw wall
                p.stroke(0);
                p.strokeWeight(5); // wall thickness
                p.line(0, 0, 0, 190);

                // draw egg
                p.translate(velocity, drop); // if egg falls
                p.rotate(angle);
                p.translate(0, -20); // move axis (entire canvas) to bottom of egg
                p.stroke(0);
                p.strokeWeight(1);
                p.fill(255, 248, 190); // egg color
                
                p.beginShape(); // egg shape
                p.vertex(0,-15);
                p.bezierVertex(10, -15, 25, 20, 0, 20);
                p.bezierVertex(-25, 20, -10, -15, 0, -15);
                p.endShape();

                p.pop(); // allows moving just the egg instead of entire canvas
            };
        };

        const p5Instance = new window.p5(sketch, renderRef.current);

        return () => {
            p5Instance.remove();
        };
    }, []);

    return <div ref={renderRef} />;
};

export default EggCanvas;