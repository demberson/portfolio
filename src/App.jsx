import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import SiteBackdrop from './components/SiteBackdrop';
import Home from './pages/Home';
import GifToAsciiPage from './pages/GifToAsciiPage';
import EggGamePage from './pages/EggGamePage';
import UncannyFacePage from './pages/UncannyFacePage';
import './styles/App.css';

function App() {
  return (
    <Router>
      <SiteBackdrop />
      <div className="app">
        <div className="app-frame">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/gif-to-ascii" element={<GifToAsciiPage />} />
              <Route path="/egg-game" element={<EggGamePage />} />
              <Route path="/uncanny-face-detector" element={<UncannyFacePage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
