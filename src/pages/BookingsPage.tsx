import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookingCard } from '../components/BookingCard';
import { Feedback } from '../components/Feedback';
import { PageHeader } from '../components/PageHeader';
import { BookingService } from '../services/BookingService';
import { MovieService } from '../services/MovieService';
import { ShowService } from '../services/ShowService';
import { TheatreService } from '../services/TheatreService';
import { getErrorMessage } from '../services/ApiClient';
import type { BookingDTO, MovieDTO, ShowDTO, TheatreDTO } from '../types/api';
import { isFutureShow } from '../utils/format';

export function BookingsPage() {
  const location = useLocation();
  const [bookings, setBookings] = useState<BookingDTO[]>([]);
  const [movies, setMovies] = useState<MovieDTO[]>([]);
  const [shows, setShows] = useState<ShowDTO[]>([]);
  const [theatres, setTheatres] = useState<TheatreDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(
    (location.state as { booked?: boolean } | null)?.booked ? 'Booking created.' : '',
  );
  async function loadBookings() {
    try {
      const [bookings, movies, shows, theatres] = await Promise.all([
        BookingService.getMyBookings(),
        MovieService.getAll(),
        ShowService.getAll(),
        TheatreService.getAll(),
      ]);
      setBookings(bookings);
      setMovies(movies);
      setShows(shows);
      setTheatres(theatres);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadBookings();
  }, []);
  async function cancelBooking(id: string) {
    if (!window.confirm('Cancel this booking?')) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await BookingService.cancel(id);
      setMessage('Booking cancelled.');
      await loadBookings();
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="page">
      <PageHeader
        title="My bookings"
        description="Review your tickets and manage upcoming bookings."
      >
        <Link className="btn btn-primary" to="/shows">
          Browse shows
        </Link>
      </PageHeader>
      <Feedback error={error} message={message} />
      {loading && <p role="status">Loading bookings...</p>}
      {!loading && !error && bookings.length === 0 && (
        <p className="empty-state">You have no bookings yet.</p>
      )}
      <div className="booking-list">
        {bookings.map((booking) => {
          const show = shows.find((show) => show.showId === booking.showId);
          return (
            <BookingCard
              key={booking.bookingId}
              booking={booking}
              show={show}
              movie={movies.find((movie) => movie.movieId === show?.movieId)}
              theatre={theatres.find((theatre) => theatre.theatreId === show?.theatreId)}
            >
              {booking.status !== 'CANCELLED' && show && isFutureShow(show) && (
                <button
                  className="btn btn-outline-danger"
                  disabled={busy}
                  onClick={() => cancelBooking(booking.bookingId)}
                >
                  Cancel booking
                </button>
              )}
            </BookingCard>
          );
        })}
      </div>
    </section>
  );
}
