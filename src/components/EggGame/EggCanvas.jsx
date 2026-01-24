import React, { useEffect, useRef } from 'react';


const EggCanvas = ({ gameState, onLoss, onWin, isHardMode}) => {
    const renderRef = useRef(); // refer to HTML div where canvas is
    const gameStateRef = useRef(gameState); // allow p5 to see current React state
    const hardModeRef = useRef(isHardMode);

    // sync game state
    useEffect(() => {
        gameStateRef.current = gameState;
    }, [gameState]);

    useEffect(() => {
        hardModeRef.current = isHardMode;
    }, [isHardMode]);

    // prevent browser controls interfering
    useEffect(() => {
        const preventDefaultScroll = (e) => {
            if (['Space', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                    e.preventDefault();
            }
            if (e.keyCode === 32) {
                    e.preventDefault();
                }
        };

        window.addEventListener('keydown', preventDefaultScroll);

        return () => {
            window.removeEventListener('keydown', preventDefaultScroll);
        };
    }, []);    

    useEffect(() => {
        const sketch = (p) => {

            //variables
            let timeLimit = 20;
            let blowVelocity = 0.00015;
            let gravity = 0.0001;
            let angle = 0;
            let velocity = 0;
            let blowDirection = 1;
            let drop = 0;
            let initialPush = 0;
            let mic;
            let startTime = 0;
            let gameActive = false;
            let lipsL, lipsR, windL, windR;
            let isBlowing = false;
            let blowSounds = [];
            let crackSound;
            let spacebarLock = false;
            let hardModeSong;
            let lastWindTime = 0;

            // constants
            let MAX_ANGLE = 1.7;
            let LIPS_WIDTH = 101;
            let LIPS_HEIGHT = 130;
            let TIME_TIL_FLASH = 7.8;
            let TIME_TIL_SHAKE = 90;
            const WIND_COOLDOWN = 1000;

            // set up wind sprites
            let wind = {
                active: false,
                x: 0,
                y: 0,
                direction: 1,
                alpha: 0,
                currentImg: null
            };

            // preload assets
            p.preload = () => {
                lipsL = p.loadImage('/assets/lipsL.png');
                lipsR = p.loadImage('/assets/lipsR.png');
                windL = p.loadImage('/assets/windL.png');
                windR = p.loadImage('/assets/windR.png');
                
                blowSounds[0] = p.loadSound('/assets/blow1.mp3');
                blowSounds[1] = p.loadSound('/assets/blow2.mp3');
                blowSounds[2] = p.loadSound('/assets/blow3.mp3');
                blowSounds[3] = p.loadSound('/assets/blow4.mp3');
                blowSounds[4] = p.loadSound('/assets/blow5.mp3');
                blowSounds[5] = p.loadSound('/assets/blow6.mp3');
                crackSound = p.loadSound('/assets/crack.mp3');
                hardModeSong = p.loadSound('/assets/hardmode.mp3');
            };

            // runs once at start
            p.setup = () => {
                p.createCanvas(800, 500);
                p.textAlign(p.CENTER);
                p.textSize(40);

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
                    timeLimit = 20;
                    angle = 0;
                    initialPush = (p.random([1, -1])) * (gravity * 2); // push egg in random direction at start
                    velocity = initialPush + gravity;
                    drop = 0;

                    // hardmode settings
                    if (hardModeRef.current === true) {
                        blowVelocity = 0.00023;
                        gravity = 0.0002;

                        if (hardModeSong) {
                            hardModeSong.setVolume(0.06);
                            hardModeSong.play();
                            
                            timeLimit = hardModeSong.duration() - 12; // match game duration with song duration
                        }
                    } else {
                        blowVelocity = 0.00015;
                        gravity = 0.0001;

                        if (hardModeSong && hardModeSong.isPlaying()) {
                            hardModeSong.stop();
                        }
                    }

                    gameActive = true;
                }

                // timer
                let elapsed = (p.millis() - startTime) / 1000;
                let timeLeft = Math.max(0, timeLimit - elapsed);
                p.fill(0);
                p.noStroke();
                if (hardModeRef.current === true) { // if hardmode, replace timer
                    if (elapsed > TIME_TIL_FLASH) {
                        p.text(`SURVIVE`, 400, 100);
                    }
                } else {
                    p.text(`${timeLeft.toFixed(0)}`, 400, 100);
                }

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
                    if (spacebarLock === false) { // only play one sound each spacebar press
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
                    if (vol > 0.15) {
                        velocity += (blowVelocity * blowDirection);
                        isBlowing = true;
                    }
                }

                // draw lips
                if (blowDirection == 1) { // left side
                    if (isBlowing) {
                        p.image(lipsL, 0, (p.height / 4), LIPS_WIDTH, LIPS_HEIGHT);

                        if (p.millis() - lastWindTime > WIND_COOLDOWN) {
                            lastWindTime = p.millis();
                            wind.active = true;
                            wind.alpha = 255;

                            wind.direction = blowDirection;
                            wind.currentImg = windL;
                            wind.x = 0 + 160;
                            wind.y = (p.height / 4) + 40;

                        }
                    } else {
                        p.image(lipsL, 0, (p.height / 4), LIPS_WIDTH, LIPS_HEIGHT);
                    }
                }
                if (blowDirection == -1) { // right side
                    if (isBlowing) {
                        p.image(lipsR, p.width - LIPS_WIDTH, (p.height / 4), LIPS_WIDTH, LIPS_HEIGHT);

                        if (p.millis() - lastWindTime > WIND_COOLDOWN) {
                            lastWindTime = p.millis();
                            wind.active = true;
                            wind.alpha = 255;

                            wind.direction = blowDirection;
                            wind.currentImg = windR;
                            wind.x = p.width - 160;
                            wind.y = (p.height / 4) + 40;
                        }
                    } else {
                        p.image(lipsR, p.width - LIPS_WIDTH, (p.height / 4), LIPS_WIDTH, LIPS_HEIGHT);
                    }
                }

                // hardmode shake effect
                p.push();
                if (hardModeRef.current === true && elapsed > TIME_TIL_SHAKE) {
                    let panicTime = elapsed - TIME_TIL_SHAKE;
                    let shakeIntensity = p.constrain(panicTime * 0.05, 0, 15);

                    p.translate(
                        p.random(-shakeIntensity, shakeIntensity),
                        p.random(-shakeIntensity, shakeIntensity)
                    );
                }
                
                // render game
                drawScene(p, (angle += velocity), timeLeft);

                p.pop();

                // hardmode flashing effect
                if (hardModeRef.current === true && elapsed > TIME_TIL_FLASH) {
                    let panicTime = elapsed - TIME_TIL_FLASH;
                    let flashSpeed = 0.01 + (panicTime * 0.002);
                    let alpha = p.map(p.sin(p.millis() * flashSpeed * 0.01), -1, 1, 0, 80);

                    p.push();
                    p.noStroke();
                    p.fill(255, 0, 0, alpha);
                    p.rect(0, 0, p.width, p.height);
                    p.pop();
                }

                // win condition
                if (timeLeft == 0) {
                    onWin(timeLeft);
                }

                // lose condition
                if (angle > MAX_ANGLE || angle < -MAX_ANGLE) {
                    velocity = 0; //CHANGE FALL ANGLE TO NOT BE STRAIGHT DOWN
                    drop += (drop * (gravity + .13) + 1); //REPLACE MAGIC NUM
                    if (drop > 340) { //REPLACE MAGIC NUM
                        onLoss(timeLeft);
                        crackSound.setVolume(0.3);
                        crackSound.play();

                        if (hardModeRef.current === true) {
                            hardModeSong.stop();
                        }
                    }
                }

                // wind blowing effect
                if (wind.active && wind.currentImg) {
                    wind.x += 5 * wind.direction;
                    wind.alpha -= 8;

                    p.push();
                    p.tint(255, wind.alpha);
                    p.imageMode(p.CENTER);

                    p.image(wind.currentImg, wind.x, wind.y, 195, 91);

                    p.noTint();
                    p.pop();

                    if(wind.alpha <= 0) {
                        wind.active = false;
                    }
                }
                
            };

            // prevent normal browser controls from interfering
            p.keyPressed = () => {
                if (p.keyCode === p.LEFT_ARROW || p.keyCode === p.RIGHT_ARROW || p.keyCode === 32) {
                    return false;
                }
            };

            const drawScene = (p, angle, timeLeft) => {
                p.push();

                p.translate(p.width / 2, p.height / 2 - 10);

                // draw wall
                p.stroke(0);
                p.strokeWeight(10); // wall thickness
                p.line(0, 0, 0, 380);

                // draw egg
                p.translate(velocity, drop); // if egg falls
                p.rotate(angle);
                p.translate(0, -40); // move axis (entire canvas) to bottom of egg
                p.stroke(0);
                p.strokeWeight(2);
                p.fill(255, 248, 190); // egg color
                
                p.beginShape(); // egg shape
                p.vertex(0,-30);
                p.bezierVertex(20, -30, 50, 40, 0, 40);
                p.bezierVertex(-50, 40, -20, -30, 0, -30);
                p.endShape();

                // hardmode egg crack
                if (hardModeRef.current && timeLeft !== undefined) {
                    p.push(); 
                    p.noFill();
                    p.strokeWeight(0.3);
                    p.stroke(0);

                    if (timeLeft <= 20) {
                        p.beginShape();
                        p.vertex(24, 20);  
                        p.vertex(10, 30);   
                        p.vertex(16, 10);    
                        p.vertex(2, 2);   
                        p.endShape();
                    }
                    p.pop();
                }

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