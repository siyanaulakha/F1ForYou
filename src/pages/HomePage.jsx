import { Link } from "react-router-dom";
import drivers from "../data/drivers.json";

export default function HomePage() {
  return (
    <section className="f1-hero py-5">
      <div className="container">
        <div className="row align-items-center g-4">
          <div className="col-lg-7">
            <h1 className="display-5 fw-bold">All the facts & footage to fuel your F1 passion.</h1>
            <p className="lead opacity-90">
              Dive into seasons, drivers, teams, and circuits. Explore results and standings.
            </p>
            <div className="d-flex gap-2 flex-wrap">
              <Link className="btn btn-f1" to="/seasons">Browse Seasons</Link>
              <Link className="btn btn-outline-light" to="/drivers">Driver Stats</Link>
              <Link className="btn btn-outline-light" to="/circuits">Circuits</Link>
            </div>
          </div>
          <div className="col-lg-5">
            <div className="f1-hero-card p-4 rounded-4">
              <h4 className="mb-3">Top Drivers (sample)</h4>
              <ul className="mb-0">
                {drivers.slice(0, 4).map(d => (
                  <li key={d.id}>{d.name} — {d.team} ({d.championships} titles)</li>
                ))}
              </ul>
              <div className="small text-secondary mt-2">Edit at <code>src/data/drivers.json</code></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
