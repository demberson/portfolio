import { Link } from 'react-router-dom';
import '../styles/Header.css';

function Header() {
  return (
    <header className="site-header">
      <div className ="header-content">
        <Link to="/" className="portfolio-title">
          Dillon Emberson
        </Link>

        <a
          href="https://github.com/demberson"
          target="_blank"
          rel="noreferrer"
          className="github-link"
        >
          <i>https://github.com/demberson</i>
        </a>

        <div className="header-separator"></div>

        <nav className="header-nav">
          <Link to="/gif-to-ascii" className="nav-button">
            GIF to ASCII
          </Link>
          <Link to="/egg-game" className="nav-button">
            Egg Game
          </Link>
        </nav>

      </div>
    </header>
  );
}

export default Header;