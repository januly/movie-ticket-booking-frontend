import { type FormEvent, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { BookingCard } from '../components/BookingCard';
import { Feedback } from '../components/Feedback';
import { FormField } from '../components/FormField';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { BookingService } from '../services/BookingService';
import { PaymentService } from '../services/PaymentService';
import { MovieService } from '../services/MovieService';
import { ShowService } from '../services/ShowService';
import { TheatreService } from '../services/TheatreService';
import { getErrorMessage } from '../services/ApiClient';
import type {
  BookingDTO,
  PaymentDTO,
  PaymentMethod,
  MovieDTO,
  ShowDTO,
  TheatreDTO,
} from '../types/api';
import { dateLabel, money, isFutureShow } from '../utils/format';

export function PaymentPage() {
  const { id = '' } = useParams();
  const { hasRole } = useAuth();
  const [booking, setBooking] = useState<BookingDTO | null>(null);
  const [payment, setPayment] = useState<PaymentDTO | null>(null);
  const [movie, setMovie] = useState<MovieDTO | null>(null);
  const [show, setShow] = useState<ShowDTO | null>(null);
  const [theatre, setTheatre] = useState<TheatreDTO | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('CARD');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setBooking(null);
    setPayment(null);
    async function loadPayment() {
      try {
        const booking = await BookingService.get(id);
        const [show, payment] = await Promise.all([
          ShowService.get(booking.showId),
          booking.paymentId ? PaymentService.get(booking.paymentId) : Promise.resolve(null),
        ]);
        const [movie, theatre] = await Promise.all([
          MovieService.get(show.movieId),
          TheatreService.get(show.theatreId),
        ]);
        if (active) {
          setBooking(booking);
          setPayment(payment);
          setShow(show);
          setMovie(movie);
          setTheatre(theatre);
        }
      } catch (error) {
        if (active) setError(getErrorMessage(error));
      } finally {
        if (active) setLoading(false);
      }
    }
    loadPayment();
    return () => {
      active = false;
    };
  }, [id]);

  async function pay(event: FormEvent) {
    event.preventDefault();
    if (!booking || busy) return;
    setError('');
    setBusy(true);
    try {
      const current = payment || (await PaymentService.create(booking.bookingId, method));
      setPayment(current);
      setPayment(await PaymentService.process(current.paymentId, 'COMPLETED'));
      setBooking(await BookingService.get(id));
    } catch (error) {
      setError(getErrorMessage(error));
      try {
        const latest = await BookingService.get(id);
        setBooking(latest);
        if (latest.paymentId) setPayment(await PaymentService.get(latest.paymentId));
      } catch {}
    } finally {
      setBusy(false);
    }
  }
  async function refreshStatus() {
    if (!payment) return;
    setError('');
    setBusy(true);
    try {
      const [status, details, booking] = await Promise.all([
        PaymentService.getStatus(payment.paymentId),
        PaymentService.get(payment.paymentId),
        BookingService.get(id),
      ]);
      setPayment({ ...details, status });
      setBooking(booking);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  const canPay =
    hasRole(['CUSTOMER']) &&
    booking?.status === 'PENDING' &&
    show &&
    isFutureShow(show) &&
    movie?.status !== 'ENDED' &&
    theatre?.status === 'ACTIVE' &&
    (!payment || payment.status === 'PENDING' || payment.status === 'FAILED');

  return (
    <section className="page">
      <PageHeader title="Payment" description="Review the booking total and payment status.">
        <Link
          className="btn btn-outline-primary"
          to={hasRole(['ADMIN']) ? '/admin/payments' : '/bookings'}
        >
          Back
        </Link>
      </PageHeader>
      <Feedback error={error} />
      {loading && <p role="status">Loading payment details...</p>}
      {!loading && booking && (
        <div className="booking-layout">
          <BookingCard
            booking={booking}
            movie={movie || undefined}
            show={show || undefined}
            theatre={theatre || undefined}
          />
          <section className="content-card">
            <h2>Payment details</h2>
            {payment ? (
              <>
                <StatusBadge status={payment.status} />
                <dl className="detail-list">
                  <dt>Payment ID</dt>
                  <dd>{payment.paymentId}</dd>
                  <dt>Amount</dt>
                  <dd>{money(payment.amount)}</dd>
                  <dt>Method</dt>
                  <dd>{payment.paymentMethod.replace(/_/g, ' ')}</dd>
                  <dt>Payment date</dt>
                  <dd>{dateLabel(payment.paymentDate)}</dd>
                </dl>
                <button
                  className="btn btn-outline-primary mb-3"
                  disabled={busy}
                  onClick={refreshStatus}
                >
                  {busy ? 'Please wait...' : 'Refresh status'}
                </button>
                {payment.status === 'COMPLETED' && (
                  <Feedback message="Payment completed. Your booking is confirmed." />
                )}
                {payment.status === 'FAILED' && (
                  <div className="alert alert-danger" role="alert">
                    Payment failed.
                  </div>
                )}
                {payment.status === 'REFUNDED' && (
                  <p className="muted">This payment has been refunded.</p>
                )}
              </>
            ) : (
              <p className="muted">No payment has been made for this booking.</p>
            )}
            {canPay && (
              <form className="form-stack" onSubmit={pay}>
                {!payment && (
                  <FormField label="Payment method">
                    <select
                      className="form-select"
                      value={method}
                      onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                    >
                      <option value="CARD">Card</option>
                      <option value="CASH">Cash</option>
                      <option value="BANK_TRANSFER">Bank transfer</option>
                    </select>
                  </FormField>
                )}
                <button className="btn btn-primary" disabled={busy}>
                  {busy
                    ? 'Processing...'
                    : `${payment?.status === 'FAILED' ? 'Retry payment' : 'Pay'} ${money(booking.totalAmount)}`}
                </button>
              </form>
            )}
            {booking.status === 'CANCELLED' && (
              <p className="muted mb-0">This booking has been cancelled.</p>
            )}
            {booking.status === 'PENDING' && !canPay && hasRole(['CUSTOMER']) && (
              <p className="muted">This booking is no longer eligible for payment.</p>
            )}
          </section>
        </div>
      )}
    </section>
  );
}
