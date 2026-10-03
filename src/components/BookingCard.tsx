import type { ReactNode } from 'react';
import type { BookingDTO, MovieDTO, ShowDTO, TheatreDTO } from '../types/api';
import { StatusBadge } from './StatusBadge';
import { dateLabel, timeLabel, money } from '../utils/format';

interface BookingCardProps {
  booking: BookingDTO;
  movie?: MovieDTO;
  show?: ShowDTO;
  theatre?: TheatreDTO;
  customerName?: string;
  children?: ReactNode;
}

export function BookingCard({
  booking,
  movie,
  show,
  theatre,
  customerName,
  children,
}: BookingCardProps) {
  return (
    <article className="item-card booking-card">
      <div className="booking-header">
        <h2>{movie?.title || 'Movie booking'}</h2>
        <StatusBadge status={booking.status} />
      </div>
      {customerName && <p>Customer: {customerName}</p>}
      <p className="muted">
        {theatre?.theatreName}
        {show && ` · ${dateLabel(show.showDate)} · ${timeLabel(show.showTime)}`}
      </p>
      <dl className="detail-list">
        <dt>Selected seats</dt>
        <dd>{booking.seatNumbers.join(', ')}</dd>
        <dt>Tickets</dt>
        <dd>{booking.numberOfTickets}</dd>
        <dt>Total</dt>
        <dd>
          <strong>{money(booking.totalAmount)}</strong>
        </dd>
        <dt>Booked on</dt>
        <dd>{dateLabel(booking.bookingDate)}</dd>
      </dl>
      <p className="booking-reference">Reference: {booking.bookingId}</p>
      <div className="actions">{children}</div>
    </article>
  );
}
