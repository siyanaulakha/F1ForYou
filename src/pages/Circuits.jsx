import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function CircuitsPage() {
  const [circuits, setCircuits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/api/circuits")
      .then((res) => res.json())
      .then((data) => {
        // Ensure data is always an array for safe mapping
        setCircuits(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="container py-4">
      <h2 className="mb-3">Circuits</h2>
      <div className="row g-3">
        {loading ? (
          <div className="col-12">Loading circuits...</div>
        ) : circuits.length > 0 ? (
          circuits.map((c) => (
            <div key={c.circuitId} className="col-md-6 col-lg-4">
              <div className="card bg-dark text-light h-100 border-light shadow-sm">
                <div className="card-body">
                  <h5 className="card-title mb-2">{c.name}</h5>
                  <div className="small text-secondary mb-2">
                    {c.location}, {c.country}
                  </div>
                  {c.url && (
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-light btn-sm mb-2"
                    >
                      Wikipedia
                    </a>
                  )}
                  <p className="card-text mb-2">{c.short || "—"}</p>
                  <Link
                    to={`/circuits/${c.circuitId}`}
                    className="btn btn-outline-light btn-sm"
                  >
                    Open Circuit Details
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-secondary">
            No circuits found.
          </div>
        )}
      </div>
    </div>
  );
}
