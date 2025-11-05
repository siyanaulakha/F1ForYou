import circuitsData from './enriched_circuits.json';
import React from 'react';
import { useParams, Link } from 'react-router-dom';

export default function CircuitDetailsPage() {
  const { circuitId } = useParams();
  const circuit = circuitsData[circuitId];

  if (!circuit) {
    return (
      <div className="details-container">
        <div className="details-card">
          <h2>Circuit not found</h2>
          <Link to="/circuits" className="back-link">Back to Circuits</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="details-container">
      <div className="details-card">
        <h1>{circuit.name}</h1>
        <div className="info-row">
          <span className="icon">📍</span>
          <span>
            <strong>Location:</strong> {circuit.location}, {circuit.country}
          </span>
        </div>
        <div className="info-row">
          <span className="icon">🗺️</span>
          <span>
            <strong>Coordinates:</strong> {circuit.lat}, {circuit.lng}
          </span>
        </div>
        <div className="info-row">
          <span className="icon">🏁</span>
          <span>
            <strong>Total Races:</strong> {circuit.num_races}
          </span>
        </div>
        <hr className="divider" />
        <div className="stat-row">
          <span className="icon">👑</span>
          <span>
            <strong>Most Wins:</strong> {circuit.most_wins_driver} ({circuit.driver_win_count})
          </span>
        </div>
        <div className="stat-row">
          <span className="icon">⚡</span>
          <span>
            <strong>Fastest Lap:</strong> {circuit.fastest_lap ?? "—"} s by {circuit.fastest_lap_driver ?? "—"}
          </span>
        </div>
        <div className="stat-row">
          <span className="icon">🏆</span>
          <span>
            <strong>Most Successful Team ID:</strong> {circuit.most_successful_team_id} (Wins: {circuit.team_win_count})
          </span>
        </div>
        {circuit.url && (
          <div className="wiki-row">
            <a href={circuit.url} target="_blank" rel="noreferrer" className="wiki-link">
              More on Wikipedia
            </a>
          </div>
        )}
        <div className="back-row">
          <Link to="/circuits" className="back-link">⏪ Back to Circuits</Link>
        </div>
      </div>
    </div>
  );
}
