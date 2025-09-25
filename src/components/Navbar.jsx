import { NavLink, Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark f1-navbar sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">F1ForYou</Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#nav"
          aria-controls="nav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"/>
        </button>
        <div className="collapse navbar-collapse" id="nav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item"><NavLink className="nav-link" to="/seasons">Seasons</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/drivers">Drivers</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/teams">Teams</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/circuits">Circuits</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/contact">Contact Us</NavLink></li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
