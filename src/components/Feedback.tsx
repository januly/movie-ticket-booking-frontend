export function Feedback({ error, message }: { error?: string; message?: string }) {
  return <>
    {error && <div className="alert alert-danger" role="alert">{error}</div>}
    {message && <div className="alert alert-success" role="status">{message}</div>}
  </>;
}
