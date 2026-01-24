import React from 'react';
import GifToAscii from '../components/GifToAscii';
import '../styles/Home.css';

const GifToAsciiPage = () => {
    return (
        <div className="pageContainer">
            <div className="project-container">
                <GifToAscii />
            </div>
        </div>
    );
};

export default GifToAsciiPage;