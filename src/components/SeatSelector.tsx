import type { SeatAvailabilityDTO } from '../types/api';

interface SeatSelectorProps {
  seats: SeatAvailabilityDTO;
  selected: string[];
  busy: boolean;
  onToggle: (seat: string) => void;
}

export function SeatSelector({ seats, selected, busy, onToggle }: SeatSelectorProps) {
  const allSeats = [...seats.availableSeats, ...seats.bookedSeats];
  const rows = Array.from(new Set(allSeats.map((seat) => seat.replace(/\d+$/, '')))).sort(
    (a, b) => a.length - b.length || a.localeCompare(b),
  );
  return (
    <section className="content-card">
      <h2>Select seats</h2>
      <div className="seat-legend">
        <span>
          <i className="seat-key" />
          Available
        </span>
        <span>
          <i className="seat-key selected" />
          Selected
        </span>
        <span>
          <i className="seat-key booked" />
          Booked
        </span>
      </div>
      <div className="screen-label">Screen</div>
      <div className="seat-map" aria-label="Seat selection">
        {rows.map((row) => (
          <div className="seat-row" key={row}>
            <span className="row-label">{row}</span>
            <div className="seat-buttons">
              {allSeats
                .filter((seat) => seat.replace(/\d+$/, '') === row)
                .sort((a, b) => Number(a.replace(/^\D+/, '')) - Number(b.replace(/^\D+/, '')))
                .map((seat) => {
                  const booked = seats.bookedSeats.includes(seat);
                  const chosen = selected.includes(seat);
                  return (
                    <button
                      type="button"
                      className={`seat${chosen ? ' selected' : ''}${booked ? ' booked' : ''}`}
                      key={seat}
                      aria-label={`Seat ${seat}${booked ? ', booked' : ''}`}
                      aria-pressed={chosen}
                      disabled={busy || booked || (selected.length >= 100 && !chosen)}
                      onClick={() => onToggle(seat)}
                    >
                      {seat}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
