import { Link } from "react-router-dom";

export default function Card({ title, subtitle, text, to }) {
  return (
    <div className="card f1-card h-100">
      <div className="card-body">
        <h5 className="card-title mb-1 f1-title-light">{title}</h5>
        {subtitle && <div className="text-secondary small mb-2">{subtitle}</div>}
        {text && <p className="card-text  f1-title-light">{text}</p>}
        {to && <Link to={to} className="btn btn-outline-light btn-sm">View</Link>}
      </div>
    </div>
  );
}
