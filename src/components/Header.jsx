import { Link } from 'react-router-dom';
import '../styles/Header.css';

function Header() {
  return (
    <header className="site-header">
      <Link to="/" className="portfolio-title">
        Dillon Emberson
      </Link>
    </header>
  );
}

export default Header;