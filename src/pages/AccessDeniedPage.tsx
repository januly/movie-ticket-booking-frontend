import { Link } from 'react-router-dom';

export function AccessDeniedPage() {
  return (
    <section className="page">
      <h1>Access denied</h1>
      <p>You do not have permission to open this page.</p>
      <Link className="btn btn-primary" to="/movies">
        Back to movies
      </Link>
    </section>
  );
}
