import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Feedback } from '../components/Feedback';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { PaymentService } from '../services/PaymentService';
import { BookingService } from '../services/BookingService';
import { UserService } from '../services/UserService';
import { getErrorMessage } from '../services/ApiClient';
import type { PaymentDTO, BookingDTO, UserDTO } from '../types/api';
import { dateLabel, money } from '../utils/format';

export function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentDTO[]>([]);
  const [bookings, setBookings] = useState<BookingDTO[]>([]);
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    Promise.all([PaymentService.getAll(), BookingService.getAll(), UserService.getAll()])
      .then(([payments, bookings, users]) => {
        if (active) {
          setPayments(payments);
          setBookings(bookings);
          setUsers(users);
        }
      })
      .catch((error) => {
        if (active) setError(getErrorMessage(error));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <section className="page">
      <PageHeader title="Payments" description="View customer payment information and status." />
      <Feedback error={error} />
      {loading && <p role="status">Loading payments...</p>}
      {!loading && !error && payments.length === 0 && (
        <p className="empty-state">No payments have been made.</p>
      )}
      {payments.length > 0 && (
        <div className="table-card table-responsive">
          <table className="table mb-0">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => {
                const booking = bookings.find((booking) => booking.bookingId === payment.bookingId);
                return (
                  <tr key={payment.paymentId}>
                    <td>{users.find((user) => user.id === booking?.userId)?.name}</td>
                    <td className="text-nowrap">{money(payment.amount)}</td>
                    <td>{payment.paymentMethod.replace(/_/g, ' ')}</td>
                    <td className="text-nowrap">{dateLabel(payment.paymentDate)}</td>
                    <td>
                      <StatusBadge status={payment.status} />
                    </td>
                    <td>
                      <Link
                        className="btn btn-outline-primary btn-sm"
                        to={`/bookings/${payment.bookingId}/payment`}
                      >
                        View payment
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
