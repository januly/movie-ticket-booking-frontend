import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Feedback } from '../components/Feedback';
import { FormField } from '../components/FormField';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { MovieService } from '../services/MovieService';
import { getErrorMessage } from '../services/ApiClient';
import type { MovieDTO } from '../types/api';

export function MoviesPage() {
  const [movies, setMovies] = useState<MovieDTO[]>([]);
  const [search, setSearch] = useState('');
  const [language, setLanguage] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    MovieService.getAll()
      .then((data) => {
        if (active) setMovies(data);
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

  const filtered = movies.filter(
    (movie) =>
      movie.title.toLowerCase().includes(search.trim().toLowerCase()) &&
      (!language || movie.language === language) &&
      (!status || movie.status === status),
  );
  const languages = Array.from(new Set(movies.map((movie) => movie.language))).sort();

  return (
    <section className="page">
      <PageHeader title="Movies" description="Find a movie and choose a show." />
      <div className="filter-card row g-3">
        <div className="col-md-6">
          <FormField label="Search movies">
            <input
              className="form-control"
              type="search"
              placeholder="Search by title"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </FormField>
        </div>
        <div className="col-md-3">
          <FormField label="Language">
            <select
              className="form-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="">All languages</option>
              {languages.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="col-md-3">
          <FormField label="Movie status">
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All statuses</option>
              <option value="NOW_SHOWING">Now showing</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="ENDED">Ended</option>
            </select>
          </FormField>
        </div>
      </div>
      <Feedback error={error} />
      {loading && <p role="status">Loading movies...</p>}
      {!loading && !error && filtered.length === 0 && (
        <p className="empty-state">No movies match these filters.</p>
      )}
      <div className="card-grid">
        {filtered.map((movie) => (
          <article className="item-card movie-card" key={movie.movieId}>
            <StatusBadge status={movie.status} />
            <h2>{movie.title}</h2>
            <p className="muted">
              {movie.language} · {movie.genre} · {movie.duration} min
            </p>
            <p className="movie-description">{movie.description}</p>
            <Link className="btn btn-outline-primary" to={`/movies/${movie.movieId}`}>
              View details
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
