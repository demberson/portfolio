import React, { useState, useEffect } from 'react';
import init, {convert_gif_to_ascii, init_panic_hook } from '../../wasm-lib/pkg/gif_to_ascii'

const GifToAscii = () => {
    // list of ascii strings
    const [frames, setFrames] = useState([]);
    
    // current frame
    const [currentFrameIndex, setCurrentFrameIndex] = useState(0);

    // start/stop bool
    const [isPlaying, setIsPlaying] = useState(0);

    const [isWasmLoaded, setIsWasmLoaded] = useState(false);

    const [error, setError] = useState(null);

    // initialize wasm
    useEffect(() => {
        const loadWasm = async () => { // async because this downloads a file, must wait for browser
            try {
                await init();

                init_panic_hook();

                setIsWasmLoaded(true);
                console.log("Wasm initialized");
            } catch (err) {
                console.error("Failed to load Wasm:", err);
                setError("System error: Could not load image processor");
            }
        };
        loadWasm();
    }, []);

    // animation loop
    useEffect(() => {
        if (!isPlaying || frames.length == 0) return;

        // 100ms timer (10 fps)
        const intervalId = setInterval(() => {
            setCurrentFrameIndex((prevIndex) => {
                return (prevIndex + 1) % frames.length;
            });
        }, 100);

        // kill timer if user leaves page
        return () => clearInterval(intervalId);
    }, [isPlaying, frames]);

    // file upload
    const handleFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // incase of upload before Wasm initialized
        if(!isWasmLoaded) {
            alert("System still initializing...");
            return;
        }

        try {
            // read file into memory buffer
            const buffer = await file.arrayBuffer();

            //convert to Uint8Array so Wasm can read as byte slice
            const bytes = new Uint8Array(buffer);

            // call rust
            const asciiResult = convert_gif_to_ascii(bytes, 80);

            setFrames(asciiResult);
            setCurrentFrameIndex(0);
            setIsPlaying(true);
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Failed to process file, must be a valid .gif");
        }
    };

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '20px', 
            fontFamily: 'monospace', 
            color: 'white' 
        }}>
            <h3>GIF to ASCII Converter</h3>

            <input
                type="file"
                accept=".gif"
                onChange={handleFile}
                disabled={!isWasmLoaded}
            />

            {frames.length > 0 && (
                <div style={{
                    whiteSpace: 'pre',
                    fontFamily: 'monospace',
                    lineHeight: '0.6em',
                    fontSize: '8px',
                    marginTop: '20px',
                    color: 'black',
                    backgroundColor: 'white',
                    display: 'inline-block',
                    padding: '1px'
                }}>
                    {frames[currentFrameIndex]}
                </div>
            )}

            {error && <p style={{color: 'red'}}>{error}</p>}
        </div>
    );

};

export default GifToAscii;