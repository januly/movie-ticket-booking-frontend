import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Feedback } from '../components/Feedback';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { TheatreService } from '../services/TheatreService';
import { getErrorMessage } from '../services/ApiClient';
import type { TheatreDTO } from '../types/api';

export function TheatresPage() {
  const [theatres, setTheatres] = useState<TheatreDTO[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    TheatreService.getAll()
      .then((data) => {
        if (active) setTheatres(data);
      })
      .catch((error) => {
        if (active) setError(getErrorMessage(error));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <section className="page">
      <PageHeader title="Theatres" description="Browse cinemas and their available shows." />
      <Feedback error={error} />
      {loading && <p role="status">Loading theatres...</p>}
      {!loading && !error && theatres.length === 0 && (
        <p className="empty-state">No theatres are available.</p>
      )}
      <div className="card-grid">
        {theatres.map((theatre) => (
          <article className="item-card" key={theatre.theatreId}>
            <StatusBadge status={theatre.status} />
            <h2 className="mt-3">{theatre.theatreName}</h2>
            <p className="muted">{theatre.location}</p>
            <p>Capacity: {theatre.capacity} seats</p>
            {theatre.status === 'ACTIVE' && (
              <Link
                className="btn btn-outline-primary"
                to={`/shows?theatreId=${encodeURIComponent(theatre.theatreId)}`}
              >
                View shows
              </Link>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
