import React, { useState, useEffect } from 'react';
import { parseGIF, decompressFrames } from 'gifuct-js';
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
    const [gifSrc, setGifSrc] = useState(null);
    const [delays, setDelays] = useState([]);

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
    
    // load default gif
    useEffect(() => {
        if (isWasmLoaded && !gifSrc) {
            const loadDefault = async () => {
                try {
                    const response = await fetch('/assets/example.gif');
                    if (!response.ok) return;

                    const buffer = await response.arrayBuffer();

                    const rawGif = parseGIF(buffer);
                    const framesData = decompressFrames(rawGif, true);
                    const extractedDelays = framesData.map(f => f.delay);
                    setDelays(extractedDelays);

                    const bytes = new Uint8Array(buffer);
                    const asciiResult = convert_gif_to_ascii(bytes, 80);

                    setFrames(asciiResult);

                    const blob = new Blob([buffer], { type: 'image/gif' });
                    const objectUrl = URL.createObjectURL(blob);

                    setGifSrc('/assets/example.gif');
                    setIsPlaying(true);
                } catch (err) {
                    console.log("Failed to load default gif:", err);
                }
            };
            loadDefault();
        }
    }, [isWasmLoaded]);

    // animation loop
    useEffect(() => {
        if (!isPlaying || frames.length == 0) return;

        // calculate delay
        const currentDelay = (delays.length > 0 && delays[currentFrameIndex]) ? delays[currentFrameIndex] : 100;

        const timeoutId = setTimeout(() => {
            setCurrentFrameIndex((prevIndex) => {
                return (prevIndex + 1) % frames.length;
            });
        }, currentDelay);

        // kill timer if user leaves page
        return () => clearTimeout(timeoutId);
    }, [isPlaying, currentFrameIndex, frames, delays]);

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

            // parse gif for speed
            const rawGif = parseGIF(buffer);
            const framesData = decompressFrames(rawGif, true);
            const extractedDelays = framesData.map(f => f.delay);
            setDelays(extractedDelays);

            //convert to Uint8Array so Wasm can read as byte slice
            const bytes = new Uint8Array(buffer);
            // call rust
            const asciiResult = convert_gif_to_ascii(bytes, 80);

            // temp url to preview uploaded file
            const previewUrl = URL.createObjectURL(file);
            setGifSrc(previewUrl);

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

            {error && <p style={{color: 'red'}}>{error}</p>}

            {frames.length > 0 && (
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    gap: '40px',
                    flexWrap: 'wrap'
                }}>

                    <div style={{ textAlign: 'center' }}>
                        <p style={{marginBottom: '10px', color: '#aaa'}}>Source</p>
                        {gifSrc && (
                            <img
                                src={gifSrc}
                                alt="Source"
                                style={{
                                    maxWidth: '300px',
                                    maxHeight: '300px'
                                }}
                            />
                        )}
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <p style={{marginBottom: '10px', color: '#aaa'}}>ASCII</p>
                        <div style={{
                            whiteSpace: 'pre',
                            fontFamily: 'monospace',
                            lineHeight: '1em', 
                            fontSize: '8px',
                            color: 'black',
                            backgroundColor: 'white',
                            display: 'inline-block'
                        }}>
                            {frames[currentFrameIndex]}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GifToAscii;