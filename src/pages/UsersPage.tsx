import { type FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Feedback } from '../components/Feedback';
import { FormField } from '../components/FormField';
import { PageHeader } from '../components/PageHeader';
import { UserService } from '../services/UserService';
import { getErrorMessage } from '../services/ApiClient';
import type { UserDTO, Role } from '../types/api';

export function UsersPage() {
  const { session } = useAuth();
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [form, setForm] = useState<UserDTO | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  async function loadUsers() {
    try {
      setUsers(await UserService.getAll());
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadUsers();
  }, []);
  async function saveUser(event: FormEvent) {
    event.preventDefault();
    if (!form) return;
    setError('');
    setMessage('');
    if (!form.name.trim()) {
      setError('Enter a name.');
      return;
    }
    setBusy(true);
    try {
      await UserService.update(form.id, {
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
      });
      setForm(null);
      setMessage('User updated.');
      await loadUsers();
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  async function editUser(id: string) {
    setError('');
    setMessage('');
    setBusy(true);
    try {
      setForm(await UserService.get(id));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  async function deleteUser(user: UserDTO) {
    if (!window.confirm(`Delete ${user.name}?`)) return;
    setError('');
    setMessage('');
    setBusy(true);
    try {
      await UserService.delete(user.id);
      if (form?.id === user.id) setForm(null);
      setMessage('User deleted.');
      await loadUsers();
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page">
      <PageHeader title="Users" description="Manage registered customers and administrators." />
      <Feedback error={error} message={message} />
      {form && (
        <section className="content-card mb-4">
          <h2>Edit user</h2>
          <form className="row g-3" onSubmit={saveUser}>
            <div className="col-md-4">
              <FormField label="Name">
                <input
                  className="form-control"
                  value={form.name}
                  maxLength={100}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </FormField>
            </div>
            <div className="col-md-4">
              <FormField label="Email">
                <input
                  className="form-control"
                  type="email"
                  value={form.email}
                  maxLength={150}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </FormField>
            </div>
            <div className="col-md-4">
              <FormField label="Role">
                <select
                  className="form-select"
                  value={form.role}
                  disabled={form.id === session?.user.id}
                  onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </FormField>
            </div>
            <div className="col-12 actions">
              <button className="btn btn-primary" disabled={busy}>
                {busy ? 'Saving...' : 'Save user'}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                disabled={busy}
                onClick={() => setForm(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}
      {loading && <p role="status">Loading users...</p>}
      {!loading && !error && users.length === 0 && (
        <p className="empty-state">No registered users.</p>
      )}
      {users.length > 0 && (
        <div className="table-card table-responsive">
          <table className="table mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role === 'ADMIN' ? 'Administrator' : 'Customer'}</td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        disabled={busy}
                        onClick={() => editUser(user.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        disabled={busy || user.id === session?.user.id}
                        onClick={() => deleteUser(user)}
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
