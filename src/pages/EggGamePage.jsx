import React from 'react';
import EggGame from '../components/EggGame/EggGame';
import '../styles/Home.css';

const EggGamePage = () => {
  return (
    <div className="page-container">
        <EggGame />
        <p>*Microphone will not work on the Firefox mobile browser</p>
    </div>
  );
};

export default EggGamePage;