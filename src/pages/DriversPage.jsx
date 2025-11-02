import React, { useState, useEffect } from "react";

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/api/drivers")
      .then((res) => res.json())
      .then((data) => {
        // sort drivers by championships descending
        setDrivers([...data].sort((a, b) => b.championships - a.championships));
        setLoading(false);
      });
  }, []);

  return (
    <div className="container py-4">
      <h2 className="mb-3">Drivers</h2>
      <div className="row g-3 align-items-stretch">
        {loading ? (
          <div className="col-12">Loading drivers...</div>
        ) : (
          drivers.map((d) => (
            <div
              className="col-sm-6 col-md-4 col-lg-3"
              key={d.id}
              // cursor defaults to normal, no click event
            >
              <div
                className="driver-card border rounded shadow-sm overflow-hidden d-flex align-items-center position-relative"
                style={{ minHeight: 170, background: "#181818" }}
              >
                <div className="flex-grow-1 p-3 z-2">
                  <h5 className="mb-1">{d.name}</h5>
                  <div className="mb-1">{d.nationality}</div>
                  <div className="mb-2">
                    <strong>Teams:</strong> {d.teams.join(", ")}
                  </div>
                  <div>
                    <strong>Championships:</strong> {d.championships}
                  </div>
                  <div>
                    <strong>Wins:</strong> {d.wins} | <strong>Podiums:</strong>{" "}
                    {d.podiums}
                  </div>
                  <div>
                    <strong>Races:</strong> {d.races}
                  </div>
                </div>
                <div
                  className="text-white driver-number shadow-lg text-center"
                  style={{
                    minWidth: 64,
                    fontSize: 64,
                    fontWeight: 700,
                    opacity: 0.7,
                    position: "absolute",
                    right: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    letterSpacing: "-0.04em",
                    textShadow: "0 2px 8px #222",
                    zIndex: 3,
                  }}
                >
                  {d.number}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
