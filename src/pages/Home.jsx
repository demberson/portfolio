import { Link } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/Home.css';
import GifToAscii from '../components/GifToAscii';

function Home() {
  return (
    <div className="home">
      <Header />
      <GifToAscii />
      </div>
  );
}

export default Home;
