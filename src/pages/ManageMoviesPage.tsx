import { type FormEvent, useEffect, useState } from 'react';
import { Feedback } from '../components/Feedback';
import { FormField } from '../components/FormField';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { MovieService } from '../services/MovieService';
import { getErrorMessage } from '../services/ApiClient';
import type { MovieDTO, MovieStatus } from '../types/api';
import { dateLabel } from '../utils/format';

const emptyMovie: MovieDTO = {
  movieId: '',
  title: '',
  description: '',
  duration: 120,
  language: '',
  genre: '',
  releaseDate: '',
  status: 'UPCOMING',
};

export function ManageMoviesPage() {
  const [movies, setMovies] = useState<MovieDTO[]>([]);
  const [form, setForm] = useState(emptyMovie);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadMovies() {
    try {
      setMovies(await MovieService.getAll());
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadMovies();
  }, []);

  async function saveMovie(event: FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');
    if (![form.title, form.description, form.language, form.genre].every((value) => value.trim())) {
      setError('Complete all movie fields.');
      return;
    }
    setBusy(true);
    try {
      if (form.movieId) await MovieService.update(form.movieId, form);
      else await MovieService.create(form);
      setForm(emptyMovie);
      setMessage('Movie saved.');
      await loadMovies();
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  async function editMovie(id: string) {
    setError('');
    setMessage('');
    setBusy(true);
    try {
      setForm(await MovieService.get(id));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  async function deleteMovie(movie: MovieDTO) {
    if (!window.confirm(`Delete ${movie.title}?`)) return;
    setError('');
    setMessage('');
    setBusy(true);
    try {
      await MovieService.delete(movie.movieId);
      if (form.movieId === movie.movieId) setForm(emptyMovie);
      setMessage('Movie deleted.');
      await loadMovies();
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page">
      <PageHeader title="Manage movies" description="Add and update movie information." />
      <Feedback error={error} message={message} />
      <section className="content-card mb-4">
        <h2>{form.movieId ? 'Edit movie' : 'Add movie'}</h2>
        <form onSubmit={saveMovie} className="row g-3">
          <div className="col-md-6">
            <FormField label="Title">
              <input
                className="form-control"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                maxLength={150}
                required
              />
            </FormField>
          </div>
          <div className="col-md-3">
            <FormField label="Language">
              <input
                className="form-control"
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                maxLength={50}
                required
              />
            </FormField>
          </div>
          <div className="col-md-3">
            <FormField label="Genre">
              <input
                className="form-control"
                value={form.genre}
                onChange={(e) => setForm({ ...form, genre: e.target.value })}
                maxLength={80}
                required
              />
            </FormField>
          </div>
          <div className="col-12">
            <FormField label="Description">
              <textarea
                className="form-control"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                maxLength={2000}
                required
              />
            </FormField>
          </div>
          <div className="col-md-4">
            <FormField label="Duration (minutes)">
              <input
                className="form-control"
                type="number"
                min={1}
                max={600}
                step={1}
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                required
              />
            </FormField>
          </div>
          <div className="col-md-4">
            <FormField label="Release date">
              <input
                className="form-control"
                type="date"
                value={form.releaseDate}
                onChange={(e) => setForm({ ...form, releaseDate: e.target.value })}
                required
              />
            </FormField>
          </div>
          <div className="col-md-4">
            <FormField label="Status">
              <select
                className="form-select"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as MovieStatus })}
              >
                <option value="UPCOMING">Upcoming</option>
                <option value="NOW_SHOWING">Now showing</option>
                <option value="ENDED">Ended</option>
              </select>
            </FormField>
          </div>
          <div className="col-12 actions">
            <button className="btn btn-primary" disabled={busy}>
              {busy ? 'Saving...' : 'Save movie'}
            </button>
            <button
              className="btn btn-outline-secondary"
              type="button"
              disabled={busy}
              onClick={() => setForm(emptyMovie)}
            >
              Clear
            </button>
          </div>
        </form>
      </section>
      {loading && <p role="status">Loading movies...</p>}
      {!loading && movies.length === 0 && !error && (
        <p className="empty-state">No movies have been added.</p>
      )}
      {movies.length > 0 && (
        <div className="table-card table-responsive">
          <table className="table mb-0">
            <thead>
              <tr>
                <th>Movie</th>
                <th>Language</th>
                <th>Release date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((movie) => (
                <tr key={movie.movieId}>
                  <td>
                    <strong>{movie.title}</strong>
                    <small className="d-block muted">
                      {movie.duration} min · {movie.genre}
                    </small>
                  </td>
                  <td>{movie.language}</td>
                  <td className="text-nowrap">{dateLabel(movie.releaseDate)}</td>
                  <td>
                    <StatusBadge status={movie.status} />
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        disabled={busy}
                        onClick={() => editMovie(movie.movieId)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        disabled={busy}
                        onClick={() => deleteMovie(movie)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
