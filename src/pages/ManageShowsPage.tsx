import { type FormEvent, useEffect, useState } from 'react';
import { Feedback } from '../components/Feedback';
import { FormField } from '../components/FormField';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { MovieService } from '../services/MovieService';
import { TheatreService } from '../services/TheatreService';
import { ShowService } from '../services/ShowService';
import { getErrorMessage } from '../services/ApiClient';
import type { MovieDTO, TheatreDTO, ShowDTO, ShowStatus } from '../types/api';
import { dateLabel, timeLabel, money } from '../utils/format';

const emptyShow: ShowDTO = {
  showId: '',
  movieId: '',
  theatreId: '',
  showDate: '',
  showTime: '',
  ticketPrice: 1500,
  status: 'SCHEDULED',
};

export function ManageShowsPage() {
  const [movies, setMovies] = useState<MovieDTO[]>([]);
  const [theatres, setTheatres] = useState<TheatreDTO[]>([]);
  const [shows, setShows] = useState<ShowDTO[]>([]);
  const [form, setForm] = useState(emptyShow);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  async function loadData() {
    try {
      const [movies, theatres, shows] = await Promise.all([
        MovieService.getAll(),
        TheatreService.getAll(),
        ShowService.getAll(),
      ]);
      setMovies(movies);
      setTheatres(theatres);
      setShows(shows);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadData();
  }, []);
  async function saveShow(event: FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');
    setBusy(true);
    try {
      if (form.showId) await ShowService.update(form.showId, form);
      else await ShowService.create(form);
      setForm(emptyShow);
      setMessage('Show saved.');
      await loadData();
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  async function editShow(id: string) {
    setError('');
    setMessage('');
    setBusy(true);
    try {
      setForm(await ShowService.get(id));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  async function deleteShow(id: string) {
    if (!window.confirm('Delete this show?')) return;
    setError('');
    setMessage('');
    setBusy(true);
    try {
      await ShowService.delete(id);
      if (form.showId === id) setForm(emptyShow);
      setMessage('Show deleted.');
      await loadData();
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page">
      <PageHeader
        title="Manage shows"
        description="Schedule movie screenings and update show status."
      />
      <Feedback error={error} message={message} />
      <section className="content-card mb-4">
        <h2>{form.showId ? 'Edit show' : 'Add show'}</h2>
        <form className="row g-3" onSubmit={saveShow}>
          <div className="col-md-6">
            <FormField label="Movie">
              <select
                className="form-select"
                value={form.movieId}
                onChange={(e) => setForm({ ...form, movieId: e.target.value })}
                required
              >
                <option value="">Choose a movie</option>
                {movies
                  .filter((movie) => form.showId || movie.status !== 'ENDED')
                  .map((movie) => (
                    <option key={movie.movieId} value={movie.movieId}>
                      {movie.title}
                    </option>
                  ))}
              </select>
            </FormField>
          </div>
          <div className="col-md-6">
            <FormField label="Theatre">
              <select
                className="form-select"
                value={form.theatreId}
                onChange={(e) => setForm({ ...form, theatreId: e.target.value })}
                required
              >
                <option value="">Choose a theatre</option>
                {theatres
                  .filter((theatre) => form.showId || theatre.status === 'ACTIVE')
                  .map((theatre) => (
                    <option key={theatre.theatreId} value={theatre.theatreId}>
                      {theatre.theatreName}
                    </option>
                  ))}
              </select>
            </FormField>
          </div>
          <div className="col-md-3">
            <FormField label="Show date">
              <input
                className="form-control"
                type="date"
                value={form.showDate}
                onChange={(e) => setForm({ ...form, showDate: e.target.value })}
                required
              />
            </FormField>
          </div>
          <div className="col-md-3">
            <FormField label="Show time">
              <input
                className="form-control"
                type="time"
                value={form.showTime.slice(0, 5)}
                onChange={(e) => setForm({ ...form, showTime: e.target.value })}
                required
              />
            </FormField>
          </div>
          <div className="col-md-3">
            <FormField label="Ticket price (LKR)">
              <input
                className="form-control"
                type="number"
                min={0.01}
                max={999999.99}
                step={0.01}
                value={form.ticketPrice}
                onChange={(e) => setForm({ ...form, ticketPrice: Number(e.target.value) })}
                required
              />
            </FormField>
          </div>
          <div className="col-md-3">
            <FormField label="Status">
              <select
                className="form-select"
                value={form.status}
                disabled={!form.showId}
                onChange={(e) => setForm({ ...form, status: e.target.value as ShowStatus })}
              >
                <option value="SCHEDULED">Scheduled</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </FormField>
          </div>
          <div className="col-12 actions">
            <button className="btn btn-primary" disabled={busy}>
              {busy ? 'Saving...' : 'Save show'}
            </button>
            <button
              className="btn btn-outline-secondary"
              type="button"
              disabled={busy}
              onClick={() => setForm(emptyShow)}
            >
              Clear
            </button>
          </div>
        </form>
      </section>
      {loading && <p role="status">Loading shows...</p>}
      {!loading && !error && shows.length === 0 && (
        <p className="empty-state">No shows have been added.</p>
      )}
      {shows.length > 0 && (
        <div className="table-card table-responsive">
          <table className="table mb-0">
            <thead>
              <tr>
                <th>Movie / theatre</th>
                <th>Date / time</th>
                <th>Ticket price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shows.map((show) => (
                <tr key={show.showId}>
                  <td>
                    <strong>{movies.find((movie) => movie.movieId === show.movieId)?.title}</strong>
                    <small className="d-block muted">
                      {
                        theatres.find((theatre) => theatre.theatreId === show.theatreId)
                          ?.theatreName
                      }
                    </small>
                  </td>
                  <td className="text-nowrap">
                    {dateLabel(show.showDate)}
                    <small className="d-block muted">{timeLabel(show.showTime)}</small>
                  </td>
                  <td className="text-nowrap">{money(show.ticketPrice)}</td>
                  <td>
                    <StatusBadge status={show.status} />
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        disabled={busy}
                        onClick={() => editShow(show.showId)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        disabled={busy}
                        onClick={() => deleteShow(show.showId)}
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
