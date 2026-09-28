import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Feedback } from '../components/Feedback';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { MovieService } from '../services/MovieService';
import { ShowService } from '../services/ShowService';
import { getErrorMessage } from '../services/ApiClient';
import type { MovieDTO, ShowDTO } from '../types/api';
import { dateLabel, isFutureShow } from '../utils/format';

export function MovieDetailsPage() {
  const { id = '' } = useParams();
  const [movie, setMovie] = useState<MovieDTO | null>(null);
  const [shows, setShows] = useState<ShowDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    Promise.all([MovieService.get(id), ShowService.forMovie(id)])
      .then(([movie, shows]) => {
        if (active) {
          setMovie(movie);
          setShows(shows.filter(isFutureShow));
        }
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
  }, [id]);

  return (
    <section className="page">
      <PageHeader title="Movie details">
        <Link to="/movies" className="btn btn-outline-primary">
          Back to movies
        </Link>
      </PageHeader>
      <Feedback error={error} />
      {loading && <p role="status">Loading movie...</p>}
      {!loading && !error && movie && (
        <article className="content-card">
          <StatusBadge status={movie.status} />
          <h2 className="mt-3">{movie.title}</h2>
          <p>{movie.description}</p>
          <dl className="detail-list">
            <dt>Language</dt>
            <dd>{movie.language}</dd>
            <dt>Genre</dt>
            <dd>{movie.genre}</dd>
            <dt>Duration</dt>
            <dd>{movie.duration} minutes</dd>
            <dt>Release date</dt>
            <dd>{dateLabel(movie.releaseDate)}</dd>
          </dl>
          {movie.status !== 'ENDED' && shows.length > 0 ? (
            <Link className="btn btn-primary" to={`/shows?movieId=${encodeURIComponent(id)}`}>
              View shows
            </Link>
          ) : (
            <p className="muted mb-0">No available shows for this movie.</p>
          )}
        </article>
      )}
    </section>
  );
}
