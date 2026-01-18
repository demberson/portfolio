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
            let mic;
            let startTime = 0;
            let gameActive = false;

            // constants
            let gravity = 0.00017;
            let maxAngle = 1.7;
            let blowVelocity = 0.00023;
            let timeLimit = 30;

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
                    velocity = (p.random([1, -1])) * gravity;
                    drop = 0;
                    gameActive = true;
                }

                // timer
                let elapsed = (p.millis() - startTime) / 1000;
                let timeLeft = Math.max(0, timeLimit - elapsed);
                p.fill(0);
                p.noStroke();
                p.text(`${timeLeft.toFixed(0)}`, 200, 50);

                // game loop
                drawScene(p, (angle += velocity));

                // "gravity"
                if (angle > 0 || angle < 0) {
                    velocity += (angle * gravity);
                }

                // player controls
                if (p.keyIsDown(p.LEFT_ARROW)) {
                    blowDirection = 1;
                }
                if (p.keyIsDown(p.RIGHT_ARROW)) {
                    blowDirection = -1;
                }
                if(p.keyIsDown(32)) { // SPACEBAR
                    velocity += (blowVelocity * blowDirection);
                }

                // win condition
                if(timeLeft == 0) {
                    onWin(timeLeft);
                }

                // lose condition
                if(angle > maxAngle || angle < -maxAngle) {
                    velocity = 0;
                    drop += (drop * (gravity + .13) + 1);
                    if(drop > 150) {
                        onLoss(timeLeft);
                    }
                }
                
            };

            const drawScene = (p, angle) => {
                p.push();
                p.translate(p.width / 2, p.height / 2 - 10);

                // draw wall and floor
                p.stroke(0);
                p.strokeWeight(5); // wall thickness
                p.line(0, 0, 0, 190);

                // draw egg
                p.translate(0, drop); // if egg falls
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

                p.pop();
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