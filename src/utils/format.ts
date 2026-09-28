import type { ShowDTO } from '../types/api';

export function money(amount: number) {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    currencyDisplay: 'code',
  }).format(amount);
}

export function dateLabel(date: string) {
  return new Date(date.slice(0, 10) + 'T00:00:00').toLocaleDateString('en-LK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function timeLabel(time: string) {
  return new Date('2000-01-01T' + time + 'Z').toLocaleTimeString('en-LK', {
    timeZone: 'UTC',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function isFutureShow(show: ShowDTO) {
  return (
    show.status === 'SCHEDULED' &&
    new Date(show.showDate + 'T' + show.showTime + '+05:30').getTime() > Date.now()
  );
}
