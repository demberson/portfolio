import { Link } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/Home.css';
import GifToAscii from '../components/GifToAscii';
import EggGame from '../components/EggGame/EggGame'

function Home() {
  return (
    <div className="home">
      <Header />

      <GifToAscii />
      
      <EggGame />

      </div>
  );
}

export default Home;
