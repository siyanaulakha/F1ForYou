import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function CircuitDetailsPage() {
  const { circuitId } = useParams();
  const [circuit, setCircuit] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3001/api/circuits/${circuitId}/details`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        setCircuit(data.circuit || null);
        setStats(data.stats || null);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [circuitId]);

  if (loading) {
    return (
      <div className="container py-4">
        <h2>Circuit Details</h2>
        <p>Loading details for circuit {circuitId}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <h2>Circuit Details</h2>
        <div className="alert alert-danger" role="alert">
          Error loading circuit details: {error}
        </div>
        <Link to="/circuits" className="btn btn-secondary mt-3">Back to Circuits</Link>
      </div>
    );
  }

  if (!circuit) {
    return (
      <div className="container py-4">
        <h2>Circuit Details</h2>
        <p>Circuit not found.</p>
        <Link to="/circuits" className="btn btn-secondary mt-3">Back to Circuits</Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">{circuit.name}</h2>
        <Link to="/circuits" className="btn btn-outline-secondary btn-sm">
          Back to Circuits
        </Link>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card bg-dark text-light border-light p-3 h-100">
            <div className="mb-2 text-uppercase" style={{ fontSize: "0.8rem" }}>
              Location
            </div>
            <div style={{ fontSize: "1.1rem" }}>
              {circuit.location}, {circuit.country}
            </div>
            {circuit.lat != null && circuit.lng != null && (
              <div className="text-muted mt-2">
                Coordinates: {circuit.lat}, {circuit.lng}
              </div>
            )}
            {circuit.url && (
              <a href={circuit.url} target="_blank" rel="noreferrer" className="btn btn-outline-light btn-sm mt-2">
                Wikipedia
              </a>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <div className="card bg-dark text-light border-light p-3 h-100">
            <div className="mb-2 text-uppercase" style={{ fontSize: "0.8rem" }}>
              Overview
            </div>
            <div className="lead">
              {stats ? (
                <>
                  <div className="mb-2">
                    <strong>Average Lap Time:</strong>{" "}
                    {stats.averageLapTime != null ? `${stats.averageLapTime.toFixed(2)} s` : "—"}
                  </div>
                  <div className="mb-2">
                    <strong>Fastest Lap:</strong>{" "}
                    {stats.fastestLap != null ? `${stats.fastestLap.toFixed(2)} s` : "—"}{" "}
                    {stats.fastestDriver ? `by ${stats.fastestDriver}` : ""}
                  </div>
                  <div className="mb-2">
                    <strong>Most Wins:</strong>{" "}
                    {stats.mostWinsDriver ? `${stats.mostWinsDriver} (${stats.mostWins} wins)` : "—"}
                  </div>
                  <div className="mb-2">
                    <strong>Total Races:</strong> {stats.totalRaces ?? "—"}
                  </div>
                </>
              ) : (
                <div>No statistics available for this circuit yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Optional: add a drivers or top performances section here later */}

    </div>
  );
}