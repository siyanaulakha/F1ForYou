import { Link } from "react-router-dom";
import circuits from "../data/circuits.json";

export default function CircuitsPage() {
  return (
    <div className="container py-4">
      <h2 className="mb-3">Circuits</h2>
      <div className="row g-3">
        {circuits.map(c => (
          <div className="col-md-6 col-lg-4" key={c.slug}>
            <div className="card f1-card h-100">
              <div className="card-body">
                <h5 className="card-title  f1-title-light">{c.name}</h5>
                <div className="small text-secondary mb-2">
                  {c.location}, {c.country}
                </div>
                <p className="card-text mb-3  f1-title-light">{c.short || "—"}</p>
                <Link to={`/circuits/${c.slug}`} className="btn btn-outline-light btn-sm">
                  Open Circuit
                </Link>
              </div>
            </div>
          </div>
        ))}
        {circuits.length === 0 && (
          <div className="text-secondary">
            Add circuits to <code>src/data/circuits.json</code>.
          </div>
        )}
      </div>
    </div>
  );
}
