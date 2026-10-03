import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Feedback } from '../components/Feedback';
import { PageHeader } from '../components/PageHeader';
import { SeatSelector } from '../components/SeatSelector';
import { BookingService } from '../services/BookingService';
import { ShowService } from '../services/ShowService';
import { MovieService } from '../services/MovieService';
import { TheatreService } from '../services/TheatreService';
import { getErrorMessage } from '../services/ApiClient';
import type { MovieDTO, ShowDTO, TheatreDTO, SeatAvailabilityDTO } from '../types/api';
import { dateLabel, timeLabel, money, isFutureShow } from '../utils/format';

export function SeatsPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState<ShowDTO | null>(null);
  const [movie, setMovie] = useState<MovieDTO | null>(null);
  const [theatre, setTheatre] = useState<TheatreDTO | null>(null);
  const [seats, setSeats] = useState<SeatAvailabilityDTO | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setSelected([]);
    async function loadShow() {
      try {
        const [show, seats] = await Promise.all([ShowService.get(id), ShowService.getSeats(id)]);
        const [movie, theatre] = await Promise.all([
          MovieService.get(show.movieId),
          TheatreService.get(show.theatreId),
        ]);
        if (active) {
          setShow(show);
          setSeats(seats);
          setMovie(movie);
          setTheatre(theatre);
        }
      } catch (error) {
        if (active) setError(getErrorMessage(error));
      } finally {
        if (active) setLoading(false);
      }
    }
    loadShow();
    return () => {
      active = false;
    };
  }, [id]);

  function toggleSeat(seat: string) {
    setSelected((current) =>
      current.includes(seat) ? current.filter((item) => item !== seat) : [...current, seat],
    );
  }
  async function bookSeats() {
    if (!show || selected.length === 0) return;
    setBusy(true);
    setError('');
    try {
      await BookingService.create({
        showId: id,
        seatNumbers: selected,
        numberOfTickets: selected.length,
      });
      navigate('/bookings', { state: { booked: true } });
    } catch (error) {
      setError(getErrorMessage(error));
      try {
        const latest = await ShowService.getSeats(id);
        setSeats(latest);
        setSelected((current) => current.filter((seat) => latest.availableSeats.includes(seat)));
      } catch {}
    } finally {
      setBusy(false);
    }
  }
  const eligible =
    show && isFutureShow(show) && movie?.status !== 'ENDED' && theatre?.status === 'ACTIVE';

  return (
    <section className="page">
      <PageHeader title="Book tickets" description="Choose your seats and review the total.">
        <Link className="btn btn-outline-primary" to="/shows">
          Back to shows
        </Link>
      </PageHeader>
      <Feedback error={error} />
      {loading && <p role="status">Loading seat availability...</p>}
      {!loading && show && movie && theatre && seats && (
        <>
          <div className="content-card mb-4">
            <h2>{movie.title}</h2>
            <p className="muted mb-0">
              {theatre.theatreName} · {dateLabel(show.showDate)} · {timeLabel(show.showTime)} ·{' '}
              {money(show.ticketPrice)} per ticket
            </p>
          </div>
          {!eligible && (
            <div className="alert alert-warning">This show is no longer available for booking.</div>
          )}
          <div className="booking-layout">
            <SeatSelector
              seats={seats}
              selected={selected}
              busy={busy || !eligible}
              onToggle={toggleSeat}
            />
            <section className="content-card booking-summary">
              <h2>Booking summary</h2>
              <dl className="detail-list">
                <dt>Selected seats</dt>
                <dd>{selected.length ? selected.join(', ') : 'None'}</dd>
                <dt>Tickets</dt>
                <dd>{selected.length}</dd>
                <dt>Ticket price</dt>
                <dd>{money(show.ticketPrice)}</dd>
                <dt>Total</dt>
                <dd>
                  <strong>{money(show.ticketPrice * selected.length)}</strong>
                </dd>
              </dl>
              <button
                className="btn btn-primary w-100"
                onClick={bookSeats}
                disabled={busy || !eligible || selected.length === 0}
              >
                {busy ? 'Booking...' : 'Book tickets'}
              </button>
            </section>
          </div>
        </>
      )}
    </section>
  );
}
