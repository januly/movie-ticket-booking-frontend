import { type FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Feedback } from '../components/Feedback';
import { FormField } from '../components/FormField';
import { AuthService } from '../services/AuthService';
import { getErrorMessage } from '../services/ApiClient';

export function SignupPage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!name.trim()) { setError('Enter your name.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await AuthService.signUp({ name: name.trim(), email: email.trim(), password });
      navigate('/login', { state: { registered: true } });
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  if (isLoggedIn) return <Navigate to="/movies" replace />;
  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">Movie Tickets</p>
        <h1>Create an account</h1>
        <p className="muted">Register to book movie tickets.</p>
        <form className="form-stack" onSubmit={handleSubmit}>
          <FormField label="Name"><input className="form-control" autoComplete="name" maxLength={100} value={name} onChange={(e) => setName(e.target.value)} required /></FormField>
          <FormField label="Email"><input className="form-control" type="email" autoComplete="email" maxLength={150} value={email} onChange={(e) => setEmail(e.target.value)} required /></FormField>
          <FormField label="Password"><input className="form-control" type="password" autoComplete="new-password" minLength={8} maxLength={72} value={password} onChange={(e) => setPassword(e.target.value)} required /></FormField>
          <FormField label="Confirm password"><input className="form-control" type="password" autoComplete="new-password" minLength={8} maxLength={72} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></FormField>
          <Feedback error={error} />
          <button className="btn btn-primary" disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</button>
        </form>
        <p className="form-note">Already registered? <Link to="/login">Sign in</Link></p>
      </section>
    </main>
  );
}
