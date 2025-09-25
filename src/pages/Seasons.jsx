import { Link } from "react-router-dom";

// Auto-import JSONs: src/data/seasons/*.json
const seasonModules = import.meta.glob("../data/seasons/*.json", { eager: true });

const seasons = Object.values(seasonModules)
  .map(mod => ({
    year: mod.year,
    driverWinner: mod.driverWinner,
    teamWinner: mod.teamWinner,
    name: mod.name || `${mod.year} Season`,
  }))
  .sort((a, b) => b.year - a.year);

export default function SeasonsPage() {
  return (
    <div className="container py-4">
      <h2 className="mb-3">Seasons</h2>
      <p className="text-secondary">Click a season to see champions and race results.</p>
      <div className="row g-3">
        {seasons.map(s => (
          <div className="col-md-6 col-lg-4" key={s.year}>
            <div className="card f1-card h-100">
              <div className="card-body">
                <h5 className="card-title  f1-title-light">{s.name}</h5>
                <div className="small text-secondary mb-2">
                  Driver: <strong>{s.driverWinner}</strong><br/>
                  Constructor: <strong>{s.teamWinner}</strong>
                </div>
                <Link to={`/seasons/${s.year}`} className="btn btn-outline-light btn-sm">
                  Open {s.year}
                </Link>
              </div>
            </div>
          </div>
        ))}
        {seasons.length === 0 && (
          <div className="text-secondary">
            No seasons yet. Add JSON files under <code>src/data/seasons/</code>.
          </div>
        )}
      </div>
    </div>
  );
}
