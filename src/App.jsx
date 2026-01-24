import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import GifToAsciiPage from './pages/GifToAsciiPage';
import EggGamePage from './pages/EggGamePage';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/gif-to-ascii" element={<GifToAsciiPage />} />
            <Route path="/egg-game" element={<EggGamePage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
