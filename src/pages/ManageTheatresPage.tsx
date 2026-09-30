import { type FormEvent, useEffect, useState } from 'react';
import { Feedback } from '../components/Feedback';
import { FormField } from '../components/FormField';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { TheatreService } from '../services/TheatreService';
import { getErrorMessage } from '../services/ApiClient';
import type { TheatreDTO, TheatreStatus } from '../types/api';

const emptyTheatre: TheatreDTO = {
  theatreId: '',
  theatreName: '',
  location: '',
  capacity: 40,
  status: 'ACTIVE',
};

export function ManageTheatresPage() {
  const [theatres, setTheatres] = useState<TheatreDTO[]>([]);
  const [form, setForm] = useState(emptyTheatre);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  async function loadTheatres() {
    try {
      setTheatres(await TheatreService.getAll());
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadTheatres();
  }, []);

  async function saveTheatre(event: FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');
    if (!form.theatreName.trim() || !form.location.trim()) {
      setError('Enter a theatre name and location.');
      return;
    }
    setBusy(true);
    try {
      if (form.theatreId) await TheatreService.update(form.theatreId, form);
      else await TheatreService.create(form);
      setForm(emptyTheatre);
      setMessage('Theatre saved.');
      await loadTheatres();
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  async function editTheatre(id: string) {
    setError('');
    setMessage('');
    setBusy(true);
    try {
      setForm(await TheatreService.get(id));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  async function deleteTheatre(theatre: TheatreDTO) {
    if (!window.confirm(`Delete ${theatre.theatreName}?`)) return;
    setError('');
    setMessage('');
    setBusy(true);
    try {
      await TheatreService.delete(theatre.theatreId);
      if (form.theatreId === theatre.theatreId) setForm(emptyTheatre);
      setMessage('Theatre deleted.');
      await loadTheatres();
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page">
      <PageHeader
        title="Manage theatres"
        description="Maintain theatre details and seating capacity."
      />
      <Feedback error={error} message={message} />
      <section className="content-card mb-4">
        <h2>{form.theatreId ? 'Edit theatre' : 'Add theatre'}</h2>
        <form className="row g-3" onSubmit={saveTheatre}>
          <div className="col-md-6">
            <FormField label="Theatre name">
              <input
                className="form-control"
                value={form.theatreName}
                onChange={(e) => setForm({ ...form, theatreName: e.target.value })}
                maxLength={150}
                required
              />
            </FormField>
          </div>
          <div className="col-md-6">
            <FormField label="Location">
              <input
                className="form-control"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                maxLength={200}
                required
              />
            </FormField>
          </div>
          <div className="col-md-6">
            <FormField label="Capacity">
              <input
                className="form-control"
                type="number"
                min={1}
                max={1000}
                step={1}
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                required
              />
            </FormField>
          </div>
          <div className="col-md-6">
            <FormField label="Status">
              <select
                className="form-select"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as TheatreStatus })}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </FormField>
          </div>
          <div className="col-12 actions">
            <button className="btn btn-primary" disabled={busy}>
              {busy ? 'Saving...' : 'Save theatre'}
            </button>
            <button
              className="btn btn-outline-secondary"
              type="button"
              disabled={busy}
              onClick={() => setForm(emptyTheatre)}
            >
              Clear
            </button>
          </div>
        </form>
      </section>
      {loading && <p role="status">Loading theatres...</p>}
      {!loading && !error && theatres.length === 0 && (
        <p className="empty-state">No theatres have been added.</p>
      )}
      {theatres.length > 0 && (
        <div className="table-card table-responsive">
          <table className="table mb-0">
            <thead>
              <tr>
                <th>Theatre</th>
                <th>Location</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {theatres.map((theatre) => (
                <tr key={theatre.theatreId}>
                  <td>{theatre.theatreName}</td>
                  <td>{theatre.location}</td>
                  <td>{theatre.capacity}</td>
                  <td>
                    <StatusBadge status={theatre.status} />
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        disabled={busy}
                        onClick={() => editTheatre(theatre.theatreId)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        disabled={busy}
                        onClick={() => deleteTheatre(theatre)}
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
