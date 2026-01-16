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
            let drop = 0;
            let mic;
            let startTime = 0;
            let gameActive = false;

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
                    velocity = 0;
                    drop = 0;
                    gameActive = true;
                }

                // timer
                let elapsed = (p.millis() - startTime) / 1000;
                let timeLeft = Math.max(0, 20 - elapsed);
                p.fill(0);
                p.noStroke();
                p.text(`${timeLeft.toFixed(0)}`, 200, 50);

                // game loop
                drawScene(p, (angle += velocity));

                velocity = .05;

                if(angle > 1.7 || angle < -1.7) {
                    velocity = 0;
                    drop += 2;
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
                p.translate(0, -20); // move axis to bottom of egg
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