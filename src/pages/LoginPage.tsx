import { type FormEvent, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Feedback } from '../components/Feedback';
import { FormField } from '../components/FormField';
import { getErrorMessage } from '../services/ApiClient';

export function LoginPage() {
  const { login, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const from = (location.state as { from?: string } | null)?.from || '/movies';

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  if (isLoggedIn) return <Navigate to={from} replace />;
  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">Movie Tickets</p>
        <h1>Sign in</h1>
        <p className="muted">Browse movies and book your seats.</p>
        <Feedback
          message={
            (location.state as { registered?: boolean } | null)?.registered
              ? 'Account created. Sign in to continue.'
              : ''
          }
        />
        <form className="form-stack" onSubmit={handleSubmit}>
          <FormField label="Email">
            <input
              className="form-control"
              type="email"
              autoComplete="email"
              maxLength={150}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormField>
          <FormField label="Password">
            <input
              className="form-control"
              type="password"
              autoComplete="current-password"
              maxLength={72}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </FormField>
          <Feedback error={error} />
          <button className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="form-note">
          New customer? <Link to="/signup">Create an account</Link>
        </p>
      </section>
    </main>
  );
}
