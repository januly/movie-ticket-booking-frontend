import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookingCard } from '../components/BookingCard';
import { Feedback } from '../components/Feedback';
import { PageHeader } from '../components/PageHeader';
import { BookingService } from '../services/BookingService';
import { MovieService } from '../services/MovieService';
import { TheatreService } from '../services/TheatreService';
import { ShowService } from '../services/ShowService';
import { UserService } from '../services/UserService';
import { getErrorMessage } from '../services/ApiClient';
import type {
  BookingDTO,
  BookingStatus,
  MovieDTO,
  ShowDTO,
  TheatreDTO,
  UserDTO,
} from '../types/api';

export function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingDTO[]>([]);
  const [movies, setMovies] = useState<MovieDTO[]>([]);
  const [theatres, setTheatres] = useState<TheatreDTO[]>([]);
  const [shows, setShows] = useState<ShowDTO[]>([]);
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  async function loadData() {
    try {
      const [bookings, movies, theatres, shows, users] = await Promise.all([
        BookingService.getAll(),
        MovieService.getAll(),
        TheatreService.getAll(),
        ShowService.getAll(),
        UserService.getAll(),
      ]);
      setBookings(bookings);
      setMovies(movies);
      setTheatres(theatres);
      setShows(shows);
      setUsers(users);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadData();
  }, []);
  async function updateStatus(id: string, status: BookingStatus) {
    if (status === 'CANCELLED' && !window.confirm('Cancel this booking?')) return;
    setError('');
    setMessage('');
    setBusy(true);
    try {
      await BookingService.updateStatus(id, status);
      setMessage('Booking status updated.');
      await loadData();
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="page">
      <PageHeader
        title="All bookings"
        description="Review customer bookings and update their status."
      />
      <Feedback error={error} message={message} />
      {loading && <p role="status">Loading bookings...</p>}
      {!loading && !error && bookings.length === 0 && (
        <p className="empty-state">No bookings have been made.</p>
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
              customerName={users.find((user) => user.id === booking.userId)?.name}
            >
              {booking.paymentId && (
                <Link
                  className="btn btn-outline-primary"
                  to={`/bookings/${booking.bookingId}/payment`}
                >
                  View payment
                </Link>
              )}
              <label className="form-field">
                Booking status
                <select
                  className="form-select"
                  value={booking.status}
                  disabled={busy || booking.status === 'CANCELLED'}
                  onChange={(e) => updateStatus(booking.bookingId, e.target.value as BookingStatus)}
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </label>
            </BookingCard>
          );
        })}
      </div>
    </section>
  );
}
