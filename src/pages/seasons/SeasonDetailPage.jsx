import { useParams } from "react-router-dom";

const allSeasonFiles = import.meta.glob("../../data/seasons/*.json", { eager: true });

function getSeason(year) {
  for (const mod of Object.values(allSeasonFiles)) {
    if (String(mod.year) === String(year)) return mod;
  }
  return null;
}

export default function SeasonDetailPage() {
  const { year } = useParams();
  const season = getSeason(year);

  if (!season) {
    return (
      <div className="container py-4">
        <h2>{year} Season</h2>
        <div className="alert alert-warning mt-3">
          No data found. Create <code>src/data/seasons/{year}.json</code>.
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="mb-1">{season.name || `${season.year} Season`}</h2>
      <div className="text-secondary mb-3">
        Driver Champion: <strong>{season.driverWinner}</strong> &nbsp;|&nbsp;
        Constructor Champion: <strong>{season.teamWinner}</strong>
      </div>

      {season.races?.length > 0 && (
        <>
          <h4 className="mt-4">Race Results</h4>
          <div className="table-responsive">
            <table className="table table-dark table-striped align-middle">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Grand Prix</th>
                  <th>Winner</th>
                  <th>Team</th>
                </tr>
              </thead>
              <tbody>
                {season.races.map((r, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{r.name}</td>
                    <td>{r.winner}</td>
                    <td>{r.team}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
