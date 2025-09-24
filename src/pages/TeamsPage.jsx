import Card from "../components/Card.jsx";
import teams from "../data/teams.json";

export default function TeamsPage() {
  return (
    <div className="container py-4">
      <h2 className="mb-3">Teams</h2>
      <div className="row g-3">
        {teams.map(t => (
          <div className="col-sm-6 col-md-4 col-lg-3" key={t.id}>
            <Card
              title={t.name}
              subtitle={`${t.base} • Car: ${t.car}`}
              text={`Principal: ${t.teamPrincipal}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
