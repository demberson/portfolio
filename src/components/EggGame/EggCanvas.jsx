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
            let fallX = 0;
            let mic;
            let startTime = 0;
            let gameActive = false;
            let lipsL, lipsR, windL, windR, gameBackground;
            let isBlowing = false;
            let blowSounds = [];
            let pianoCrash;
            let spacebarLock = false;
            let lastWindTime = 0;
            let flashTime = 0;
            let leftLipPos = 0;
            let rightLipPos = 0;

            // constants
            let MAX_ANGLE = 1.4;
            let LIPS_WIDTH = 101;
            let LIPS_HEIGHT = 130;
            let TIME_TIL_FLASH = 7.8;
            let TIME_TIL_SHAKE = 90;
            const WIND_COOLDOWN = 1300;

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
                pianoCrash = p.loadSound('/assets/piano-crash.mp3');
                p.hardModeSong = p.loadSound('/assets/hardmode.mp3');
            };

            // runs once at start
            p.setup = () => {
                p.createCanvas(800, 500);
                p.textAlign(p.CENTER);
                p.textSize(40);

                gameBackground = p.loadImage('/assets/egg-bg.png');

                // initialize mic
                try {
                    mic = new window.p5.AudioIn();
                } catch(e) {
                    console.log("Mic not supported");
                }
            };

            // track if mic is enabled, necessary for mobile
            let micStarted = false;

            // click/touch controls for mobile
            p.mousePressed = () => {

                // check if inside canvas
                if (p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {

                    // start mic on first interaction
                    if (mic && !micStarted) {
                        p.userStartAudio();
                        if (p.getAudioContext().state !== 'running') {
                            p.getAudioContext().resume();
                        }
                        mic.start();
                        micStarted = true;
                    }

                    if (p.mouseX < p.width / 2) {
                        blowDirection = 1;
                    } else {
                        blowDirection = -1;
                    }
                }
                return true;
            };

            // draws 60 times per second
            p.draw = () => {
                p.background(255);
                p.image(gameBackground, 0, 0, p.width, p.height);

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
                    fallX = 0;
                    flashTime = 0;

                    // hardmode settings
                    if (hardModeRef.current === true) {
                        blowVelocity = 0.00023;
                        gravity = 0.0002;

                        if (p.hardModeSong) {
                            p.hardModeSong.setVolume(0.06);
                            p.hardModeSong.play();
                            
                            timeLimit = p.hardModeSong.duration() - 12; // match game duration with song duration
                        }
                    } else {
                        blowVelocity = 0.00015;
                        gravity = 0.0001;

                        if (p.hardModeSong && p.hardModeSong.isPlaying()) {
                            p.hardModeSong.stop();
                        }
                    }

                    gameActive = true;
                }

                // timer
                let elapsed = (p.millis() - startTime) / 1000;
                let timeLeft = Math.max(0, timeLimit - elapsed);
                p.push();
                p.stroke(0);
                p.strokeWeight(3);
                p.fill(255);
                if (hardModeRef.current === true) { // if hardmode, replace timer
                    if (elapsed > TIME_TIL_FLASH) {
                        p.text(`SURVIVE`, 400, 100);
                    }
                } else {
                    p.text(`${timeLeft.toFixed(1)}`, 400, 100);
                }
                p.pop();

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
                    if (vol > 0.1) {
                        velocity += (blowVelocity * blowDirection);
                        isBlowing = true;
                    }
                }

                // lips
                let targetLeft = blowDirection === 1 ? 1 : 0;
                let targetRight = blowDirection === -1 ? 1 : 0;

                leftLipPos = p.lerp(leftLipPos, targetLeft, 0.6);
                rightLipPos = p.lerp(rightLipPos, targetRight, 0.6);

                let leftX = p.map(leftLipPos, 0, 1, -LIPS_WIDTH, 0); // left
                if (leftLipPos > 0.01) {
                    p.image(lipsL, leftX, p.height / 4, LIPS_WIDTH, LIPS_HEIGHT);
                }

                let rightX = p.map(rightLipPos, 0, 1, p.width, p.width - LIPS_WIDTH); // right
                if (rightLipPos > 0.01) {
                    p.image(lipsR, rightX, p.height / 4, LIPS_WIDTH, LIPS_HEIGHT);
                }

                // wind blowing effect
                if (isBlowing) {
                    if (p.millis() - lastWindTime > WIND_COOLDOWN) {
                        lastWindTime = p.millis();
                        wind.active = true;
                        wind.alpha = 255;
                        wind.direction = blowDirection;

                        if (blowDirection === 1) {
                            wind.currentImg = windL;
                            wind.x = 160;
                            wind.y = (p.height / 4) + 40;
                        } else {
                            wind.currentImg = windR;
                            wind.x = p.width - 160;
                            wind.y = (p.height / 4) + 40;
                        }
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

                // hardmode flashing effect
                if (hardModeRef.current === true && elapsed > TIME_TIL_FLASH) {
                    let panicTime = elapsed - TIME_TIL_FLASH;
                    let flashSpeed = 0.01 + (panicTime * 0.002);
                    flashTime += flashSpeed;
                    let alpha = p.map(p.sin(flashTime * 0.5), -1, 1, 0, 80);

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
                    velocity = 0;
                    drop += (drop * (gravity + .13) + 1);
                    fallX += (angle);
                    if (drop > 340) {
                        onLoss(timeLeft);
                        pianoCrash.setVolume(0.3);
                        pianoCrash.play();

                        if (hardModeRef.current === true) {
                            p.hardModeSong.stop();
                        }
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
                let wallW = 20;
                let wallH = 300;
                let wallY = p.height / 4 + 25; 
                let brickH = 22;
                let topEdge = wallY - (wallH / 2);
                let bottomEdge = wallY + (wallH / 2);
                let rowCount = 0;

                p.rectMode(p.CENTER);

                p.stroke(0);
                p.strokeWeight(2);
                p.fill(178, 34, 34);
                p.rect(0, wallY, wallW, wallH); // base rectangle

                p. stroke(130);
                p.strokeWeight(2);
                for (let y = topEdge; y < bottomEdge; y += brickH) { // brick pattern
                    if (y > topEdge) {
                        p.line(-wallW / 2, y, wallW / 2, y);
                    }
                    if (rowCount % 2 !== 0) {
                        let nextY = Math.min(y + brickH, bottomEdge);
                        p.line(0, y, 0, nextY);
                    }
                    rowCount++;
                }

                // draw egg
                p.translate(fallX, drop); // if egg falls
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

        // end song if leaving page
        return () => {
            if (p5Instance.hardModeSong) {
                p5Instance.hardModeSong.stop();
            }

            p5Instance.remove();
        };
    }, []);

    return <div ref={renderRef} />;
};

export default EggCanvas;