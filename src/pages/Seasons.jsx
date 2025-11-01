import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Legend,
  Title,
  Tooltip,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Legend,
  Title,
  Tooltip
);

export default function SeasonsPage() {
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [seasonDetails, setSeasonDetails] = useState(null);
  const [raceDetails, setRaceDetails] = useState({});
  const [expandedRaceId, setExpandedRaceId] = useState(null);
  const [standingsHistory, setStandingsHistory] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch all available seasons
  useEffect(() => {
    fetch("http://localhost:3001/api/seasons")
      .then((res) => res.json())
      .then(setYears);
  }, []);

  // Fetch season details on selected year change
  useEffect(() => {
    if (!selectedYear) {
      setSeasonDetails(null);
      setStandingsHistory(null);
      setExpandedRaceId(null);
      setRaceDetails({});
      return;
    }

    setLoading(true);
    fetch(`http://localhost:3001/api/seasons/${selectedYear}/details`)
      .then((res) => res.json())
      .then((data) => {
        setSeasonDetails(data);
        setExpandedRaceId(null);
        setRaceDetails({});
        setLoading(false);
      });

    fetch(`http://localhost:3001/api/seasons/${selectedYear}/standings-history`)
      .then((res) => res.json())
      .then(setStandingsHistory);
  }, [selectedYear]);

  // Fetch individual race details when race expanded
  const loadRaceDetails = (raceId) => {
    if (expandedRaceId === raceId) {
      setExpandedRaceId(null);
      return;
    }
    fetch(`http://localhost:3001/api/races/${raceId}/standings`)
      .then((res) => res.json())
      .then((data) => {
        setRaceDetails((prev) => ({ ...prev, [raceId]: data }));
        setExpandedRaceId(raceId);
      });
  };

  // Prepare data for Chart.js line charts
  const prepareChartData = (history, entity = "driver") => {
    if (!history) return {};

    // Map entity name to array of points per race in season order
    const entities = {};
    history.forEach((race) => {
      race.standings.forEach((s) => {
        const name = entity === "driver" ? s.driver : s.constructor;
        if (!entities[name]) entities[name] = [];
        entities[name].push(s.points);
      });
    });

    return {
      labels: history.map((r) => r.raceName),
      datasets: Object.entries(entities).map(([name, data], idx) => ({
        label: name,
        data,
        borderColor: `hsl(${(idx * 40) % 360}, 70%, 50%)`,
        fill: false,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 6,
      })),
    };
  };

  return (
    <div className="container py-4">
      <h2>Formula 1 Seasons</h2>
      <div className="mb-3">
        <label htmlFor="seasonSelect">Select Year:</label>
        <select
          id="seasonSelect"
          className="form-select"
          onChange={(e) => setSelectedYear(e.target.value)}
          value={selectedYear}
        >
          <option value="" disabled>
            -- Choose a Year --
          </option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading season data...</p>}

      {seasonDetails && (
        <>
          <h3>
            {seasonDetails.year} Season Winners & Races
          </h3>
          <p>
            <strong>Driver Champion: </strong>
            {seasonDetails.driverWinner || "N/A"}
            <br />
            <strong>Constructor Champion: </strong>
            {seasonDetails.constructorWinner || "N/A"}
          </p>

          {/* Race Cards Grid */}
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3 mb-4">
            {seasonDetails.races.map((race) => {
              const isOpen = expandedRaceId === race.raceId;
              return (
                <div key={race.raceId} className="col">
                  <div className="card shadow-sm">
                    <button
                      className={`card-header w-100 btn btn-link text-start text-decoration-none ${isOpen ? "fw-bold" : ""}`}
                      onClick={() => loadRaceDetails(race.raceId)}
                      aria-expanded={isOpen}
                      aria-controls={`race-${race.raceId}-body`}
                    >
                      {race.name} <span className="text-muted">– {race.date}</span>
                    </button>
                    {isOpen && raceDetails[race.raceId] && (
                      <div id={`race-${race.raceId}-body`} className="card-body p-2">
                        <h6>Race Results</h6>
                        <table className="table table-sm table-bordered">
                          <thead>
                            <tr>
                              <th>Pos</th>
                              <th>Driver</th>
                              <th>Constructor</th>
                              <th>Points</th>
                              <th>Laps</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {raceDetails[race.raceId].race.results.map((r, idx) => (
                              <tr key={idx}>
                                <td>{r.position}</td>
                                <td>{r.driver}</td>
                                <td>{r.constructor}</td>
                                <td>{r.points}</td>
                                <td>{r.laps}</td>
                                <td>{r.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>


          {/* Standings charts */}
          {standingsHistory && (
            <>
              <h4>Driver Standings Progression</h4>
              <Line
                data={prepareChartData(standingsHistory.driverStandingsHistory, "driver")}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: "bottom" },
                    title: {
                      display: true,
                      text: "Driver Points by Race",
                    },
                  },
                  // y axis NOT reversed
                  scales: {
                    y: { title: { display: true, text: "Points" } },
                  },
                }}
              />

              <h4 className="mt-4">Constructor Standings Progression</h4>
              <Line
                data={prepareChartData(standingsHistory.constructorStandingsHistory, "constructor")}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: "bottom" },
                    title: {
                      display: true,
                      text: "Constructor Points by Race",
                    },
                  },
                  scales: {
                    y: { title: { display: true, text: "Points" } },
                  },
                }}
              />

              {/* Final Standings Tables unchanged */}
              {/* (...as in your current code...) */}
            </>
          )}
        </>
      )}
    </div>
  );
}