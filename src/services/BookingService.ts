import { ApiClient } from './ApiClient';
import type { BookingDTO, BookingRequestDTO, BookingStatus } from '../types/api';

export class BookingService {
  static create(data: BookingRequestDTO) {
    return ApiClient.request<BookingDTO>('/bookings', { method: 'POST', data });
  }
  static get(id: string) {
    return ApiClient.request<BookingDTO>(`/bookings/${encodeURIComponent(id)}`);
  }
  static getAll() {
    return ApiClient.request<BookingDTO[]>('/bookings');
  }
  static getMyBookings() {
    return ApiClient.request<BookingDTO[]>('/bookings/my-bookings');
  }
  static cancel(id: string) {
    return ApiClient.request<BookingDTO>(`/bookings/${encodeURIComponent(id)}/cancel`, {
      method: 'PUT',
    });
  }
  static updateStatus(id: string, status: BookingStatus) {
    return ApiClient.request<BookingDTO>(`/bookings/${encodeURIComponent(id)}/status`, {
      method: 'PUT',
      data: { status },
    });
  }
}
