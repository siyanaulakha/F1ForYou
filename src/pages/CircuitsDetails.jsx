import { useParams } from "react-router-dom";
import circuitsList from "../data/circuits.json";

const circuitFiles = import.meta.glob("/src/data/circuits/*.json", { eager: true });


function findCircuit(slug) {
  for (const mod of Object.values(circuitFiles)) {
    if (mod.slug === slug) return mod;   // prefer dedicated file
  }
  return circuitsList.find(c => c.slug === slug) || null;
}

export default function CircuitDetailPage() {
  const { slug } = useParams();
  const circuit = findCircuit(slug);

  if (!circuit) {
    return (
      <div className="container py-4">
        <h2>Circuit</h2>
        <div className="alert alert-warning mt-3">
          No circuit data found. Create <code>src/data/circuits/{slug}.json</code> or add it to <code>circuits.json</code>.
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="mb-1">{circuit.name}</h2>
      <div className="text-secondary mb-3">
        {circuit.location}, {circuit.country}
        {circuit.length_km && <> • {circuit.length_km} km</>}
        {circuit.laps && <> • {circuit.laps} laps</>}
      </div>

      {circuit.about && <p className="lead">{circuit.about}</p>}

      {circuit.youtubeLapId && (
        <>
          <h5>Onboard Lap</h5>
          <div className="ratio ratio-16x9 rounded-3 overflow-hidden f1-embed mb-3">
            <iframe
              src={`https://www.youtube.com/embed/${circuit.youtubeLapId}`}
              title={`${circuit.name} Onboard Lap`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </>
      )}

      {circuit.famousRaces?.length > 0 && (
        <>
          <h5>Famous Races</h5>
          <ul>
            {circuit.famousRaces.map((r, i) => (
              <li key={i}>{r.year}: {r.note}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
