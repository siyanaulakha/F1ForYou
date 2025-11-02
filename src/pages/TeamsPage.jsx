import React, { useState, useEffect } from "react";

export default function TeamsPage() {
  const [constructors, setConstructors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/api/constructors")
      .then((res) => res.json())
      .then((data) => {
        // Sort descending by championships, then points
        data.sort((a, b) => b.championships - a.championships || b.points - a.points);
        setConstructors(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container py-4">
      <h2 className="mb-3">Constructor Teams</h2>
      {loading ? (
        <p>Loading teams...</p>
      ) : (
        <div className="row g-3">
          {constructors.map((team) => (
            <div key={team.id} className="col-sm-6 col-md-4 col-lg-3">
              <div
                className="card bg-dark text-white border-light shadow-sm p-3 h-100"
                style={{ minHeight: "300px" }}
              >
                <h4 className="mb-2">{team.name}</h4>
                <p>
                  <strong>Nationality:</strong> {team.nationality}
                </p>
                <p>
                  <strong>Championships:</strong> {team.championships}
                </p>
                <p>
                  <strong>Wins:</strong> {team.wins}
                </p>
                <p>
                  <strong>Points:</strong> {team.points}
                </p>
                <p>
                  <strong>Drivers:</strong>{" "}
                  {team.drivers && team.drivers.length > 0
                    ? team.drivers.join(", ")
                    : "N/A"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
