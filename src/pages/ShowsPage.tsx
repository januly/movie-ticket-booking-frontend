import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Feedback } from '../components/Feedback';
import { FormField } from '../components/FormField';
import { PageHeader } from '../components/PageHeader';
import { MovieService } from '../services/MovieService';
import { TheatreService } from '../services/TheatreService';
import { ShowService } from '../services/ShowService';
import { getErrorMessage } from '../services/ApiClient';
import type { MovieDTO, TheatreDTO, ShowDTO } from '../types/api';
import { dateLabel, timeLabel, money, isFutureShow } from '../utils/format';

export function ShowsPage() {
  const [params, setParams] = useSearchParams();
  const movieId = params.get('movieId') || '';
  const theatreId = params.get('theatreId') || '';
  const date = params.get('date') || '';
  const [movies, setMovies] = useState<MovieDTO[]>([]);
  const [theatres, setTheatres] = useState<TheatreDTO[]>([]);
  const [shows, setShows] = useState<ShowDTO[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    Promise.all([
      MovieService.getAll(),
      TheatreService.getAll(),
      ShowService.getAll({
        movieId: movieId || undefined,
        theatreId: theatreId || undefined,
        date: date || undefined,
        status: 'SCHEDULED',
      }),
    ])
      .then(([movies, theatres, shows]) => {
        if (!active) return;
        setMovies(movies);
        setTheatres(theatres);
        setShows(
          shows
            .filter(
              (show) =>
                isFutureShow(show) &&
                movies.find((movie) => movie.movieId === show.movieId)?.status !== 'ENDED' &&
                theatres.find((theatre) => theatre.theatreId === show.theatreId)?.status ===
                  'ACTIVE',
            )
            .sort((a, b) => (a.showDate + a.showTime).localeCompare(b.showDate + b.showTime)),
        );
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
  }, [movieId, theatreId, date]);

  function changeFilter(key: string, value: string) {
    const updated = new URLSearchParams(params);
    if (value) updated.set(key, value);
    else updated.delete(key);
    setParams(updated, { replace: true });
  }

  return (
    <section className="page">
      <PageHeader title="Available shows" description="Choose a movie, theatre and date." />
      <div className="filter-card row g-3">
        <div className="col-md-4">
          <FormField label="Movie">
            <select
              className="form-select"
              value={movieId}
              onChange={(e) => changeFilter('movieId', e.target.value)}
            >
              <option value="">All movies</option>
              {movies
                .filter((movie) => movie.status !== 'ENDED')
                .map((movie) => (
                  <option key={movie.movieId} value={movie.movieId}>
                    {movie.title}
                  </option>
                ))}
            </select>
          </FormField>
        </div>
        <div className="col-md-4">
          <FormField label="Theatre">
            <select
              className="form-select"
              value={theatreId}
              onChange={(e) => changeFilter('theatreId', e.target.value)}
            >
              <option value="">All theatres</option>
              {theatres
                .filter((theatre) => theatre.status === 'ACTIVE')
                .map((theatre) => (
                  <option key={theatre.theatreId} value={theatre.theatreId}>
                    {theatre.theatreName}
                  </option>
                ))}
            </select>
          </FormField>
        </div>
        <div className="col-md-3">
          <FormField label="Date">
            <input
              className="form-control"
              type="date"
              value={date}
              onChange={(e) => changeFilter('date', e.target.value)}
            />
          </FormField>
        </div>
        <div className="col-md-1 d-flex align-items-end">
          <button className="btn btn-outline-secondary" onClick={() => setParams({})}>
            Clear
          </button>
        </div>
      </div>
      <Feedback error={error} />
      {loading && <p role="status">Loading shows...</p>}
      {!loading && !error && shows.length === 0 && (
        <p className="empty-state">No available shows match these filters.</p>
      )}
      {!loading && !error && shows.length > 0 && (
        <div className="table-card table-responsive">
          <table className="table mb-0">
            <thead>
              <tr>
                <th>Movie</th>
                <th>Theatre</th>
                <th>Date</th>
                <th>Time</th>
                <th>Ticket price</th>
              </tr>
            </thead>
            <tbody>
              {shows.map((show) => (
                <tr key={show.showId}>
                  <td>
                    <Link to={`/movies/${show.movieId}`}>
                      {movies.find((movie) => movie.movieId === show.movieId)?.title}
                    </Link>
                  </td>
                  <td>
                    {theatres.find((theatre) => theatre.theatreId === show.theatreId)?.theatreName}
                  </td>
                  <td className="text-nowrap">{dateLabel(show.showDate)}</td>
                  <td className="text-nowrap">{timeLabel(show.showTime)}</td>
                  <td className="text-nowrap">{money(show.ticketPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
