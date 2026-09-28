export function StatusBadge({ status }: { status: string }) {
  let color = 'secondary';
  if (['ACTIVE', 'NOW_SHOWING', 'CONFIRMED', 'COMPLETED'].includes(status)) color = 'success';
  if (['PENDING', 'UPCOMING', 'SCHEDULED'].includes(status)) color = 'warning';
  if (['FAILED', 'CANCELLED'].includes(status)) color = 'danger';
  return (
    <span className={`status-badge badge text-bg-${color}`}>
      {status.replace(/_/g, ' ').toLowerCase()}
    </span>
  );
}
