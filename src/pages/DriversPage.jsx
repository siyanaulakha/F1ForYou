import Card from "../components/Card.jsx";
import drivers from "../data/drivers.json";

export default function DriversPage() {
  return (
    <div className="container py-4">
      <h2 className="mb-3">Drivers</h2>
      <div className="row g-3">
        {drivers.map(d => (
          <div className="col-sm-6 col-md-4 col-lg-3" key={d.id}>
            <Card
              title={d.name}
              subtitle={`${d.nationality} • ${d.team}`}
              text={`Championships: ${d.championships ?? 0}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
